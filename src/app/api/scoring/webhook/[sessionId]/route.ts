import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const SCORING_API_BASE = process.env.SCORING_API_BASE || "https://uscis-scoring-tool-paid-production.up.railway.app/api/v1";
const SCORING_API_KEY = process.env.SCORING_API_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create a Supabase admin client (bypasses RLS) for webhook context
// since there is no user auth cookie in webhook requests
function getAdminClient() {
  return createSupabaseAdmin(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Helper: fetch full session results from the external API
async function fetchFullResults(sessionId: string) {
  try {
    const res = await fetch(`${SCORING_API_BASE}/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${SCORING_API_KEY}` },
    });
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("[webhook] Failed to fetch full results:", err);
    return null;
  }
}

// POST /api/scoring/webhook/[sessionId]
// Called by the Xtraordinary Scoring API when scoring is complete or failed
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  console.log(`[webhook] Received webhook for session: ${sessionId}`);

  let payload: any;
  try {
    payload = await req.json();
    console.log("[webhook] Payload:", JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error("[webhook] Invalid JSON payload:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const eventType = payload?.type;
  const eventData = payload?.data;

  if (!eventType || !eventData) {
    console.error("[webhook] Missing type or data in payload");
    return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // ─── scoring.completed ───
  if (eventType === "scoring.completed") {
    console.log(`[webhook] Scoring completed for session: ${sessionId}, score: ${eventData.overallScore}`);

    // The webhook payload has summary data. Fetch full results for detailed fields.
    const fullResponse = await fetchFullResults(eventData.sessionId || sessionId);
    const fullResults = fullResponse?.data?.results || null;

    const updateData: Record<string, any> = {
      status: "completed",
      progress: 100,
      overall_score: eventData.overallScore ?? fullResults?.overallScore ?? null,
      overall_rating: eventData.overallRating ?? fullResults?.overallRating ?? null,
      approval_probability: eventData.approvalProbability ?? fullResults?.approvalProbability ?? null,
      rfe_probability: eventData.rfeProbability ?? fullResults?.rfeProbability ?? null,
      denial_risk: eventData.denialRisk ?? fullResults?.denialRisk ?? null,
      // Full details from the /sessions/{id} endpoint
      criteria_scores: fullResults?.criteriaScores || [],
      rfe_predictions: fullResults?.rfePredictions || [],
      weaknesses: fullResults?.weaknesses || [],
      strengths: fullResults?.strengths || [],
      recommendations: fullResults?.recommendations || {},
      full_report: fullResults?.fullReport || null,
      // Store raw responses
      api_response: fullResponse || payload,
    };

    const { error, data } = await supabase
      .from("scoring_sessions")
      .update(updateData)
      .eq("session_id", sessionId);

    if (error) {
      console.error("[webhook] DB update error:", error);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    console.log(`[webhook] Successfully updated session ${sessionId} with completed results`);
    return NextResponse.json({ success: true, message: "Scoring results saved" });
  }

  // ─── scoring.failed ───
  if (eventType === "scoring.failed") {
    console.log(`[webhook] Scoring failed for session: ${sessionId}`);

    const { error } = await supabase
      .from("scoring_sessions")
      .update({
        status: "failed",
        api_response: payload,
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("[webhook] DB update error on failure:", error);
      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    console.log(`[webhook] Session ${sessionId} marked as failed`);
    return NextResponse.json({ success: true, message: "Failure status recorded" });
  }

  // ─── scoring.progress (optional) ───
  if (eventType === "scoring.progress") {
    const progress = eventData.progress ?? 0;
    console.log(`[webhook] Scoring progress for session: ${sessionId}, progress: ${progress}%`);

    const { error } = await supabase
      .from("scoring_sessions")
      .update({
        status: "scoring",
        progress: progress,
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("[webhook] DB progress update error:", error);
    }

    return NextResponse.json({ success: true, message: "Progress updated" });
  }

  // Unknown event type
  console.log(`[webhook] Unknown event type: ${eventType}`);
  return NextResponse.json({ success: true, message: `Event ${eventType} acknowledged` });
}

// Also accept GET for verification/health check
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  return NextResponse.json({
    status: "active",
    sessionId,
    message: "Webhook endpoint is active",
  });
}