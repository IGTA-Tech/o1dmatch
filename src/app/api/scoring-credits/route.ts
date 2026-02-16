/* /src/app/api/scoring-credits/route.ts */
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Helper: get authenticated user
async function getAuthUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// GET /api/scoring-credits — get current credit balance (auto-creates/resets)
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Call the DB function that auto-creates or auto-resets credits
    const { data, error } = await supabase.rpc("get_or_reset_scoring_credits", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("[scoring-credits] RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;

    return NextResponse.json({
      success: true,
      credits: {
        remaining: row?.credits_remaining ?? 10,
        used: row?.credits_used ?? 0,
        limit: row?.monthly_limit ?? 10,
        periodStart: row?.period_start,
        periodEnd: row?.period_end,
      },
    });
  } catch (err) {
    console.error("[scoring-credits] GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/scoring-credits — deduct 1 credit
// Body: { action: "deduct" }
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "deduct") {
      const supabase = await createClient();

      // Call the deduct function — returns true/false
      const { data, error } = await supabase.rpc("deduct_scoring_credit", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("[scoring-credits] Deduct RPC error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json(
          {
            success: false,
            error: "No credits remaining. Credits reset at the end of the month.",
          },
          { status: 403 }
        );
      }

      // Fetch updated balance
      const { data: updated, error: fetchErr } = await supabase.rpc(
        "get_or_reset_scoring_credits",
        { p_user_id: user.id }
      );

      if (fetchErr) {
        console.error("[scoring-credits] Fetch after deduct error:", fetchErr);
      }

      const row = Array.isArray(updated) ? updated[0] : updated;

      return NextResponse.json({
        success: true,
        credits: {
          remaining: row?.credits_remaining ?? 0,
          used: row?.credits_used ?? 0,
          limit: row?.monthly_limit ?? 10,
          periodStart: row?.period_start,
          periodEnd: row?.period_end,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[scoring-credits] POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}