import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const SCORING_API_BASE = (process.env.SCORING_API_BASE || "https://uscis-scoring-tool-paid-production.up.railway.app/api/v1").trim();
const SCORING_API_KEY = (process.env.SCORING_API_KEY || "").trim();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const CRON_SECRET = process.env.CRON_SECRET || "";

// Admin client — bypasses RLS since no user auth in cron context
function getAdminClient() {
  return createSupabaseAdmin(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error("[cron/scoring-sync] Unauthorized request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[cron/scoring-sync] Starting weekly scoring sync...");

  const supabase = getAdminClient();
  const results = {
    total: 0,
    checked: 0,
    updated: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    errors: [] as string[],
  };

  try {
    // 1. Fetch all scoring sessions
    const { data: allSessions, error: fetchError } = await supabase
      .from("scoring_sessions")
      .select("*")
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("[cron/scoring-sync] DB fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    results.total = (allSessions || []).length;
    console.log(`[cron/scoring-sync] Found ${results.total} sessions to check`);

    if (results.total === 0) {
      console.log("[cron/scoring-sync] No sessions to sync. Done.");
      return NextResponse.json({ success: true, message: "No sessions to sync", results });
    }

    // 2. Check each session against the external API
    for (const session of (allSessions || [])) {
      results.checked++;
      const sid = session.session_id;

      try {
        console.log(`[cron/scoring-sync] Checking session ${results.checked}/${results.total}: ${sid} (status: ${session.status})`);

        const res = await fetch(`${SCORING_API_BASE}/sessions/${sid}`, {
          headers: { Authorization: `Bearer ${SCORING_API_KEY}` },
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[cron/scoring-sync] API error for ${sid}:`, res.status, errText.substring(0, 200));
          results.errors.push(`${sid}: API returned ${res.status}`);
          results.skipped++;
          continue;
        }

        const json = await res.json();
        const apiStatus = json?.data?.status;
        const apiResults = json?.data?.results;

        // Session completed with results
        if (apiStatus === "completed" && apiResults) {
          console.log(`[cron/scoring-sync] Session ${sid} is completed. Score: ${apiResults.overallScore}`);

          const updateData: Record<string, any> = {
            status: "completed",
            progress: json.data.progress ?? 100,
            overall_score: apiResults.overallScore,
            overall_rating: apiResults.overallRating,
            approval_probability: apiResults.approvalProbability,
            rfe_probability: apiResults.rfeProbability,
            denial_risk: apiResults.denialRisk,
            criteria_scores: apiResults.criteriaScores || [],
            rfe_predictions: apiResults.rfePredictions || [],
            weaknesses: apiResults.weaknesses || [],
            strengths: apiResults.strengths || [],
            recommendations: apiResults.recommendations || {},
            full_report: apiResults.fullReport || null,
            api_response: json,
          };

          const { error: updateError } = await supabase
            .from("scoring_sessions")
            .update(updateData)
            .eq("session_id", sid);

          if (updateError) {
            console.error(`[cron/scoring-sync] DB update error for ${sid}:`, updateError);
            results.errors.push(`${sid}: DB update failed - ${updateError.message}`);
          } else {
            console.log(`[cron/scoring-sync] Updated ${sid} with completed results`);
            results.updated++;
            results.completed++;
          }

        // Session failed
        } else if (apiStatus === "failed" || apiStatus === "error") {
          console.log(`[cron/scoring-sync] Session ${sid} has failed`);

          await supabase
            .from("scoring_sessions")
            .update({ status: "failed", api_response: json })
            .eq("session_id", sid);

          results.updated++;
          results.failed++;

        // Session still processing — update progress
        } else if (apiStatus && apiStatus !== session.status) {
          const progress = json?.data?.progress ?? session.progress;
          console.log(`[cron/scoring-sync] Session ${sid} status: ${apiStatus}, progress: ${progress}%`);

          await supabase
            .from("scoring_sessions")
            .update({ status: apiStatus, progress })
            .eq("session_id", sid);

          results.updated++;

        } else {
          console.log(`[cron/scoring-sync] Session ${sid} unchanged (status: ${apiStatus})`);
          results.skipped++;
        }

        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 500));

      } catch (sessionErr: any) {
        console.error(`[cron/scoring-sync] Error processing ${sid}:`, sessionErr);
        results.errors.push(`${sid}: ${sessionErr.message}`);
        results.skipped++;
      }
    }

    console.log("[cron/scoring-sync] Sync complete:", results);
    return NextResponse.json({ success: true, results });

  } catch (err: any) {
    console.error("[cron/scoring-sync] Fatal error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}