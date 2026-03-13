import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SCORING_API_BASE = process.env.SCORING_API_BASE || process.env.SCORING_API_BASE_URL || "https://uscis-scoring-tool-paid-production.up.railway.app/api/v1";
const SCORING_API_KEY  = process.env.SCORING_API_KEY || "";
const IS_DEV = process.env.NODE_ENV !== "production";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function scoringFetch(path: string, options: RequestInit = {}) {
  const url = `${SCORING_API_BASE}${path}`;
  console.log("[rescore] scoringFetch →", url);
  console.log("[rescore] SCORING_API_BASE =", SCORING_API_BASE);
  console.log("[rescore] SCORING_API_KEY present =", SCORING_API_KEY.length > 0, `(${SCORING_API_KEY.substring(0, 12)}...)`);
  return fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${SCORING_API_KEY}`, ...(options.headers ?? {}) },
  });
}

async function downloadFile(url: string): Promise<{ blob: Blob; filename: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const filename = decodeURIComponent(url.split("/").pop()?.split("?")[0] ?? "") || "document.pdf";
    return { blob, filename };
  } catch { return null; }
}

async function getOrCreateCredits(admin: ReturnType<typeof getAdminClient>, userId: string): Promise<number> {
  const now         = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const periodEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data: existing } = await admin
    .from("scoring_credits")
    .select("credits_remaining, period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    const { data: created } = await admin
      .from("scoring_credits")
      .insert({ user_id: userId, credits_remaining: 10, credits_used: 0, monthly_limit: 10, period_start: periodStart, period_end: periodEnd })
      .select("credits_remaining")
      .single();
    return created?.credits_remaining ?? 10;
  }

  // Auto-reset if month rolled over
  if (existing.period_end && new Date(existing.period_end) < now) {
    await admin.from("scoring_credits")
      .update({ credits_remaining: 10, credits_used: 0, period_start: periodStart, period_end: periodEnd, updated_at: now.toISOString() })
      .eq("user_id", userId);
    return 10;
  }

  return existing.credits_remaining ?? 0;
}

// ── POST /api/talent/scoring/rescore ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => cookieStore.getAll(),
        setAll: (toSet) => { try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const admin  = getAdminClient();

  // 1. Credits
  let creditsLeft = 10;
  try { creditsLeft = await getOrCreateCredits(admin, userId); }
  catch (err) { console.error("[rescore] Credits error:", err); }

  if (creditsLeft <= 0) {
    return NextResponse.json({ error: "No scoring credits remaining. Credits reset at end of month." }, { status: 402 });
  }

  // 2. Talent profile
  const { data: talent, error: talentErr } = await admin
    .from("talent_profiles").select("id, first_name, last_name").eq("user_id", userId).maybeSingle();
  if (talentErr) {
    console.error("[rescore] talent_profiles error:", talentErr);
    return NextResponse.json({ error: `Profile DB error: ${talentErr.message}` }, { status: 500 });
  }
  if (!talent) return NextResponse.json({ error: "Talent profile not found" }, { status: 404 });

  const beneficiaryName = `${talent.first_name} ${talent.last_name}`.trim();

  // 3. Documents
  const { data: documents, error: docsErr } = await admin
    .from("talent_documents").select("id, title, file_url, file_name, file_type")
    .eq("talent_id", talent.id).not("file_url", "is", null);
  if (docsErr) {
    console.error("[rescore] documents error:", docsErr);
    return NextResponse.json({ error: `Documents DB error: ${docsErr.message}` }, { status: 500 });
  }
  if (!documents?.length) {
    return NextResponse.json({ error: "No evidence documents found. Please upload your documents first." }, { status: 400 });
  }

  // 4. Create scoring session
  let sessionId: string;
  try {
    const createRes  = await scoringFetch("/sessions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visaType: "O-1A", documentType: "full_petition", beneficiaryName }),
    });
    const createJson = await createRes.json() as Record<string, unknown>;
    if (!createRes.ok || !createJson.success) {
      console.error("[rescore] Create session failed:", createJson);
      return NextResponse.json({ error: (createJson.error as any)?.message ?? createJson.error ?? "Failed to create scoring session" }, { status: 500 });
    }
    sessionId = (createJson.sessionId ?? (createJson.data as any)?.sessionId) as string;
    if (!sessionId) return NextResponse.json({ error: "No sessionId returned from API" }, { status: 500 });
  } catch (err) {
    console.error("[rescore] Create session network error:", err);
    return NextResponse.json({ error: `Scoring API unreachable: ${String(err)}` }, { status: 502 });
  }

  // Save to DB (best-effort)
  const { error: insertErr } = await admin.from("scoring_sessions").insert({
    user_id: userId, session_id: sessionId, status: "pending", progress: 0,
    visa_type: "O-1A", document_type: "full_petition", beneficiary_name: beneficiaryName,
  });
  if (insertErr) console.error("[rescore] scoring_sessions insert:", insertErr.message, insertErr.details);

  // 5. Upload documents
  let uploadedCount  = 0;
  const uploadErrors: string[] = [];
  for (const doc of documents) {
    try {
      const fileData = await downloadFile(doc.file_url);
      if (!fileData) { uploadErrors.push(`Download failed: ${doc.title}`); continue; }
      const fd = new FormData();
      fd.append("sessionId", sessionId);
      fd.append("document", fileData.blob, doc.file_name || fileData.filename);
      const up = await fetch(`${SCORING_API_BASE}/sessions/upload`, {
        method: "POST", headers: { Authorization: `Bearer ${SCORING_API_KEY}` }, body: fd,
      });
      const uj = await up.json();
      if (uj.success) uploadedCount++;
      else uploadErrors.push(`Upload failed: ${doc.title}`);
      await new Promise((r) => setTimeout(r, 200));
    } catch { uploadErrors.push(`Error: ${doc.title}`); }
  }

  if (uploadedCount === 0) {
    await admin.from("scoring_sessions").update({ status: "failed" }).eq("session_id", sessionId);
    return NextResponse.json({ error: `All ${documents.length} uploads failed. Check file URLs.` }, { status: 500 });
  }

  // 6. Trigger scoring
  try {
    const scoreRes  = await scoringFetch("/sessions/score", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    const scoreJson = await scoreRes.json() as Record<string, unknown>;
    if (!scoreRes.ok && scoreRes.status !== 202 && !scoreJson.success) {
      console.error("[rescore] Trigger failed:", scoreJson);
      await admin.from("scoring_sessions").update({ status: "failed" }).eq("session_id", sessionId);
      return NextResponse.json({ error: (scoreJson.error as any)?.message ?? "Failed to trigger scoring" }, { status: 500 });
    }
  } catch (err) {
    console.error("[rescore] Trigger network error:", err);
    return NextResponse.json({ error: "Scoring API unreachable when triggering" }, { status: 502 });
  }

  await admin.from("scoring_sessions").update({ status: "scoring" }).eq("session_id", sessionId);

  // 7. Deduct credit
  await admin.from("scoring_credits")
    .update({ credits_remaining: creditsLeft - 1, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  return NextResponse.json({
    success: true, sessionId, uploadedCount,
    totalDocuments: documents.length, creditsRemaining: creditsLeft - 1,
    ...(uploadErrors.length ? { uploadErrors } : {}),
  });
}

// ── GET /api/talent/scoring/rescore?sessionId=xxx ────────────────────────────
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll:  () => cookieStore.getAll(),
        setAll: (toSet) => { try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId    = session.user.id;
  const admin     = getAdminClient();
  const sessionId = new URL(req.url).searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  try {
    const { data: dbSession } = await admin
      .from("scoring_sessions").select("*").eq("session_id", sessionId).eq("user_id", userId).maybeSingle();

    if (dbSession?.status === "completed" && dbSession.overall_score != null) {
      return NextResponse.json({ found: true, completed: true, session: dbSession });
    }

    const pollRes  = await scoringFetch(`/sessions/${sessionId}`);
    const pollJson = await pollRes.json();
    const apiData  = pollJson?.data ?? pollJson;
    const status   = apiData?.status ?? pollJson?.status;

    if (status === "completed") {
      const overallScore        = apiData?.results?.overallScore        ?? apiData?.overallScore        ?? null;
      const overallRating       = apiData?.results?.overallRating       ?? apiData?.overallRating       ?? null;
      const approvalProbability = apiData?.results?.approvalProbability ?? null;
      const rfeProbability      = apiData?.results?.rfeProbability      ?? null;
      const denialRisk          = apiData?.results?.denialRisk          ?? null;
      const criteriaScores      = apiData?.results?.criteriaScores      ?? apiData?.criteriaScores      ?? [];
      const rfePredictions      = apiData?.results?.rfePredictions      ?? [];
      const weaknesses          = apiData?.results?.weaknesses          ?? [];
      const strengths           = apiData?.results?.strengths           ?? [];
      const recommendations     = apiData?.results?.recommendations     ?? null;
      const fullReport          = apiData?.results?.fullReport          ?? apiData?.fullReport          ?? null;

      await admin.from("scoring_sessions").update({
        status: "completed", progress: 100,
        overall_score: overallScore, overall_rating: overallRating,
        approval_probability: approvalProbability, rfe_probability: rfeProbability,
        denial_risk: denialRisk, criteria_scores: criteriaScores,
        rfe_predictions: rfePredictions, weaknesses, strengths,
        recommendations, full_report: fullReport, api_response: pollJson,
        updated_at: new Date().toISOString(),
      }).eq("session_id", sessionId);

      if (overallScore != null) {
        const { error: profileUpdateErr } = await admin
          .from("talent_profiles")
          .update({
            o1_score: Math.round(overallScore),
            score_updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        if (profileUpdateErr) {
          console.error("[rescore] Failed to update o1_score:", profileUpdateErr.message);
        } else {
          console.log("[rescore] o1_score updated to", Math.round(overallScore), "for user", userId);
        }
      }

      const { data: updated } = await admin.from("scoring_sessions").select("*").eq("session_id", sessionId).maybeSingle();
      return NextResponse.json({ found: true, completed: true, session: updated });
    }

    if (status === "failed" || status === "error") {
      await admin.from("scoring_sessions").update({ status: "failed" }).eq("session_id", sessionId);
      return NextResponse.json({ found: true, completed: false, status: "failed" });
    }

    return NextResponse.json({
      found: !!dbSession, completed: false,
      status: status ?? "processing", progress: apiData?.progress ?? dbSession?.progress ?? 0,
    });
  } catch (err) {
    console.error("[rescore/poll] Error:", err);
    return NextResponse.json({ error: IS_DEV ? String(err) : "Internal server error" }, { status: 500 });
  }
}