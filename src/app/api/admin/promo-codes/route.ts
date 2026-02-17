// src/app/api/admin/promo-codes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return { user, supabase };
}

// GET — list all promo codes
export async function GET() {
  const auth = await getAdminUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await auth.supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, promoCodes: data });
}

// POST — create a new promo code
export async function POST(req: NextRequest) {
  const auth = await getAdminUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const {
    code,
    type,
    description,
    trial_days,
    discount_percent,
    grants_igta_member,
    applicable_tier,
    applicable_user_type,
    max_uses,
    valid_from,
    valid_until,
    is_active,
  } = body;

  // Validate required fields
  if (!code || !type) {
    return NextResponse.json(
      { error: "Code and type are required" },
      { status: 400 }
    );
  }

  // Validate code format — alphanumeric + hyphens/underscores, uppercase
  const codeRegex = /^[A-Z0-9_-]{2,50}$/;
  if (!codeRegex.test(code)) {
    return NextResponse.json(
      { error: "Code must be 2-50 characters, uppercase alphanumeric with hyphens/underscores only" },
      { status: 400 }
    );
  }

  const insertData: Record<string, unknown> = {
    code: code.toUpperCase(),
    type,
    description: description || null,
    trial_days: type === "trial" ? (trial_days || 14) : 0,
    discount_percent: type === "discount" ? (discount_percent || 0) : 0,
    grants_igta_member: type === "igta_verification" ? true : (grants_igta_member || false),
    applicable_tier: applicable_tier || null,
    applicable_user_type: applicable_user_type || "both",
    max_uses: max_uses || null,
    current_uses: 0,
    valid_from: valid_from || new Date().toISOString(),
    valid_until: valid_until || null,
    is_active: is_active !== undefined ? is_active : true,
  };

  const { data, error } = await auth.supabase
    .from("promo_codes")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: `Promo code "${code}" already exists` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, promoCode: data }, { status: 201 });
}

// PATCH — toggle active status
export async function PATCH(req: NextRequest) {
  const auth = await getAdminUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("promo_codes")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, promoCode: data });
}

// DELETE — delete a promo code
export async function DELETE(req: NextRequest) {
  const auth = await getAdminUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}