import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Next.js App Router config
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const SCORING_API_BASE = (process.env.SCORING_API_BASE || "https://uscis-scoring-tool-paid-production.up.railway.app/api/v1").trim();
const SCORING_API_KEY = (process.env.SCORING_API_KEY || "").trim();
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "").trim();

// Debug: log on server startup to verify env vars are loaded
console.log("[scoring API] ENV check — SCORING_API_BASE:", SCORING_API_BASE);
console.log("[scoring API] ENV check — SCORING_API_KEY loaded:", SCORING_API_KEY ? `yes (${SCORING_API_KEY.substring(0, 12)}...)` : "NO — MISSING!");
console.log("[scoring API] ENV check — SCORING_API_KEY length:", SCORING_API_KEY.length, "expected: 42");
console.log("[scoring API] ENV check — SCORING_API_KEY full:", JSON.stringify(SCORING_API_KEY));
console.log("[scoring API] ENV check — APP_URL:", APP_URL || "MISSING");

// Helper: get authenticated user
async function getAuthUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// Helper: register webhook for a session
async function registerWebhook(sessionId: string): Promise<{ webhookId?: string; webhookUrl?: string }> {
  try {
    const webhookUrl = `${APP_URL}/api/scoring/webhook/${sessionId}`;

    console.log("[scoring API] Registering webhook:", webhookUrl);

    const res = await fetch(`${SCORING_API_BASE}/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SCORING_API_KEY}`,
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ["scoring.completed", "scoring.failed"],
        description: `this webhook is created for ${sessionId}`,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("[scoring API] Webhook registration failed:", json);
      return { webhookUrl };
    }

    console.log("[scoring API] Webhook registered successfully for session:", sessionId, json);
    return { webhookId: json.id || json.webhookId, webhookUrl };
  } catch (err) {
    console.error("[scoring API] Webhook registration error:", err);
    return {};
  }
}

// GET /api/scoring
// ?action=history        → list user's scoring sessions from DB
// ?action=credits        → check credit balance
// ?sessionId=xxx         → poll external API for status, update DB if completed
// ?sessionId=xxx&action=export&format=json|html → export results
export async function GET(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get("action");
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    // --- History: fetch all user sessions from DB ---
    if (action === "history") {
      const user = await getAuthUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("scoring_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[scoring API] History fetch error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, sessions: data || [] });
    }

    // --- Check DB for webhook-updated results (avoids hitting external API) ---
    if (action === "check" && sessionId) {
      const user = await getAuthUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("scoring_sessions")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        return NextResponse.json({ found: false });
      }

      return NextResponse.json({ found: true, session: data });
    }

    // --- Credits: check balance ---
    if (action === "credits") {
      const res = await fetch(`${SCORING_API_BASE}/credits`, {
        headers: { Authorization: `Bearer ${SCORING_API_KEY}` },
      });
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    }

    // --- Export results ---
    if (action === "export" && sessionId) {
      const format = req.nextUrl.searchParams.get("format") || "json";
      const res = await fetch(`${SCORING_API_BASE}/sessions/export?sessionId=${sessionId}&format=${format}`, {
        headers: { Authorization: `Bearer ${SCORING_API_KEY}` },
      });
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    }

    // --- Poll session status from external API ---
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const res = await fetch(`${SCORING_API_BASE}/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${SCORING_API_KEY}` },
    });

    const json = await res.json();

    // If completed, save/update results in Supabase
    if (json?.data?.status === "completed" && json?.data?.results) {
      try {
        const user = await getAuthUser();
        if (user) {
          const supabase = await createClient();
          const results = json.data.results;

          const updateData: Record<string, any> = {
            status: "completed",
            progress: json.data.progress ?? 100,
            overall_score: results.overallScore,
            overall_rating: results.overallRating,
            approval_probability: results.approvalProbability,
            rfe_probability: results.rfeProbability,
            denial_risk: results.denialRisk,
            criteria_scores: results.criteriaScores || [],
            rfe_predictions: results.rfePredictions || [],
            weaknesses: results.weaknesses || [],
            strengths: results.strengths || [],
            recommendations: results.recommendations || {},
            full_report: results.fullReport || null,
            api_response: json,
          };

          const { error: updateError } = await supabase
            .from("scoring_sessions")
            .update(updateData)
            .eq("session_id", sessionId)
            .eq("user_id", user.id);

          if (updateError) {
            console.error("[scoring API] DB update error:", updateError);
          } else {
            console.log("[scoring API] Results saved to DB for session:", sessionId);
          }
        }
      } catch (dbErr) {
        console.error("[scoring API] DB save error:", dbErr);
      }
    }

    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    console.error("[scoring API] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/scoring
// Content-Type: application/json
//   - action=score&sessionId=xxx  → trigger scoring
//   - action=chat&sessionId=xxx   → chat with officer
//   - (default)                   → create session + save to DB + register webhook
// Content-Type: multipart/form-data → upload document
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // --- File upload (multipart/form-data) ---
    if (contentType.includes("multipart/form-data")) {
      const sessionId = req.nextUrl.searchParams.get("sessionId");
      if (!sessionId) {
        return NextResponse.json({ error: "sessionId is required for upload" }, { status: 400 });
      }

      try {
        let incomingFormData;
        try {
          incomingFormData = await req.formData();
        } catch (parseErr: any) {
          console.error("[scoring API] FormData parse error:", parseErr);
          return NextResponse.json({ success: false, error: "Failed to parse uploaded file: " + parseErr.message }, { status: 400 });
        }

        const file = incomingFormData.get("document") as File | null;

        if (!file || !file.name) {
          return NextResponse.json({ success: false, error: "No document file provided" }, { status: 400 });
        }

        console.log("[scoring API] Uploading file:", file.name, "size:", file.size, "type:", file.type, "to session:", sessionId);

        // Read file and create a clean Blob
        const fileBytes = new Uint8Array(await file.arrayBuffer());
        const blob = new Blob([fileBytes], { type: file.type || "application/octet-stream" });

        // Build a fresh FormData for the external API
        const outgoingFormData = new FormData();
        outgoingFormData.append("sessionId", sessionId);
        outgoingFormData.append("document", blob, file.name);

        const uploadUrl = `${SCORING_API_BASE}/sessions/upload`;
        console.log("[scoring API] Upload URL:", uploadUrl);

        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { Authorization: `Bearer ${SCORING_API_KEY}` },
          body: outgoingFormData,
        });

        const responseText = await res.text();
        console.log("[scoring API] Upload raw response:", res.status, responseText.substring(0, 300));

        let json;
        try {
          json = JSON.parse(responseText);
        } catch {
          console.error("[scoring API] Upload response is not JSON:", responseText.substring(0, 500));
          return NextResponse.json(
            { success: false, error: `Upload failed (${res.status}): ${responseText.substring(0, 200)}` },
            { status: res.status }
          );
        }

        return NextResponse.json(json, { status: res.status });
      } catch (uploadErr: any) {
        console.error("[scoring API] Upload error:", uploadErr);
        return NextResponse.json({ success: false, error: uploadErr.message || "Upload failed" }, { status: 500 });
      }
    }

    // --- JSON body ---
    const body = await req.json();
    const action = body.action;
    const sessionId = body.sessionId;

    // --- Trigger scoring ---
    if (action === "score" && sessionId) {
      console.log("[scoring API] Triggering scoring for session:", sessionId);

      const res = await fetch(`${SCORING_API_BASE}/sessions/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SCORING_API_KEY}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const scoreText = await res.text();
      console.log("[scoring API] Score trigger response:", res.status, scoreText.substring(0, 300));

      let json;
      try {
        json = JSON.parse(scoreText);
      } catch {
        return NextResponse.json(
          { success: res.status === 202, message: scoreText.substring(0, 200) },
          { status: res.status }
        );
      }

      // Update status in DB
      try {
        const user = await getAuthUser();
        if (user) {
          const supabase = await createClient();
          await supabase
            .from("scoring_sessions")
            .update({ status: "scoring" })
            .eq("session_id", sessionId)
            .eq("user_id", user.id);
        }
      } catch (dbErr) {
        console.error("[scoring API] DB status update error:", dbErr);
      }

      return NextResponse.json(json, { status: res.status });
    }

    // --- Chat with officer ---
    if (action === "chat" && sessionId) {
      const res = await fetch(`${SCORING_API_BASE}/sessions/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SCORING_API_KEY}`,
        },
        body: JSON.stringify({ sessionId, message: body.message }),
      });

      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    }

    // --- Create session ---
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[scoring API] Creating session:", body);
    console.log("[scoring API] Auth header:", `Bearer ${SCORING_API_KEY}`);

    const res = await fetch(`${SCORING_API_BASE}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SCORING_API_KEY}`,
      },
      body: JSON.stringify({
        visaType: body.visaType,
        documentType: body.documentType,
        beneficiaryName: body.beneficiaryName,
      }),
    });

    const json = await res.json();
    console.log("[scoring API] Session response:", json);

    // Extract sessionId — API returns it inside data.sessionId
    const newSessionId = json.data?.sessionId || json.sessionId;

    // Save new session to Supabase + register webhook
    if (json.success && newSessionId) {
      // 1. Save to DB
      try {
        const supabase = await createClient();
        const { error: insertError } = await supabase
          .from("scoring_sessions")
          .insert({
            user_id: user.id,
            session_id: newSessionId,
            status: "pending",
            progress: 0,
            visa_type: body.visaType || null,
            document_type: body.documentType || null,
            beneficiary_name: body.beneficiaryName || null,
          });

        if (insertError) {
          console.error("[scoring API] DB insert error:", insertError);
        } else {
          console.log("[scoring API] Session saved to DB:", newSessionId);
        }
      } catch (dbErr) {
        console.error("[scoring API] DB insert error:", dbErr);
      }

      // 2. Register webhook for this session
      const webhookInfo = await registerWebhook(newSessionId);

      // 3. Save webhook info to DB
      if (webhookInfo.webhookId || webhookInfo.webhookUrl) {
        try {
          const supabase2 = await createClient();
          await supabase2
            .from("scoring_sessions")
            .update({
              webhook_id: webhookInfo.webhookId || null,
              webhook_url: webhookInfo.webhookUrl || null,
            })
            .eq("session_id", newSessionId);
        } catch (dbErr) {
          console.error("[scoring API] Webhook info DB save error:", dbErr);
        }
      }
    }

    // Return normalized response with sessionId at top level for the frontend
    return NextResponse.json({ ...json, sessionId: newSessionId }, { status: res.status });
  } catch (err) {
    console.error("[scoring API] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/scoring?sessionId=xxx&action=delete
export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("scoring_sessions")
      .delete()
      .eq("session_id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("[scoring API] Delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[scoring API] Deleted session:", sessionId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[scoring API] DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}