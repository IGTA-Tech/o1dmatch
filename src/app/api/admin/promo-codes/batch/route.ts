// src/app/api/admin/promo-codes/batch/route.ts
// ============================================================
// Admin API for partner promo code batches.
// POST — create a batch of N codes for a partner
// GET  — list all batches with usage stats
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (data?.role !== 'admin') return null;
  return user;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg(4)}-${seg(4)}`;
}

// ── GET: list all batches with stats ─────────────────────────
export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get all codes that have a batch_id, grouped
  const { data: codes, error } = await adminClient
    .from('promo_codes')
    .select(`
      id, code, batch_id, purchase_price, current_uses, max_uses,
      is_active, valid_until, type, trial_days, applicable_tier,
      applicable_user_type, assigned_to_partner, created_at,
      partner:affiliate_partners(
        id, affiliate_code,
        profile:profiles!affiliate_partners_user_id_fkey(full_name, email)
      )
    `)
    .not('batch_id', 'is', null)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by batch_id
  const batchMap = new Map<string, {
    batch_id: string;
    partner: Record<string, unknown> | null;
    purchase_price: number | null;
    created_at: string;
    type: string;
    trial_days: number;
    applicable_tier: string | null;
    applicable_user_type: string | null;
    codes: typeof codes;
    total: number;
    used: number;
    revenue: number;
  }>();

  for (const code of codes ?? []) {
    const bid = code.batch_id!;
    if (!batchMap.has(bid)) {
      batchMap.set(bid, {
        batch_id:            bid,
        partner:             code.partner as unknown as Record<string, unknown> | null,
        purchase_price:      code.purchase_price,
        created_at:          code.created_at,
        type:                code.type,
        trial_days:          code.trial_days,
        applicable_tier:     code.applicable_tier,
        applicable_user_type: code.applicable_user_type,
        codes:               [],
        total:               0,
        used:                0,
        revenue:             0,
      });
    }
    const batch = batchMap.get(bid)!;
    batch.codes.push(code);
    batch.total++;
    if (code.current_uses > 0) {
      batch.used++;
      // Revenue = per-code purchase price × times used
      const perCode = (code.purchase_price ?? 0) / (batch.total || 1);
      batch.revenue += perCode * code.current_uses;
    }
  }

  // Recalculate revenue with correct per-code price (batch total known now)
  const batches = Array.from(batchMap.values()).map(b => {
    const perCode = (b.purchase_price ?? 0) / b.total;
    const revenue = b.codes.reduce((s, c) => s + perCode * c.current_uses, 0);
    return { ...b, revenue };
  });

  return NextResponse.json({ success: true, batches });
}

// ── POST: create a batch of codes for a partner ───────────────
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    partnerId,
    count,
    type,
    trial_days,
    discount_percent,
    applicable_tier,
    applicable_user_type,
    max_uses_per_user,
    valid_until,
    purchase_price,
    description,
  } = body as {
    partnerId:            string;
    count:                number;
    type:                 string;
    trial_days:           number;
    discount_percent:     number;
    applicable_tier:      string | null;
    applicable_user_type: string;
    max_uses_per_user:    number;
    valid_until:          string | null;
    purchase_price:       number;
    description:          string;
  };

  if (!partnerId || !count || count < 1 || count > 500) {
    return NextResponse.json({ error: 'partnerId required, count must be 1–500' }, { status: 400 });
  }

  // Generate a unique batch ID
  const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Generate N unique codes
  const existingCodes = new Set<string>();
  const rows: Record<string, unknown>[] = [];

  let attempts = 0;
  while (rows.length < count && attempts < count * 5) {
    attempts++;
    let code = generateCode();

    // Ensure no duplicates within this batch
    while (existingCodes.has(code)) code = generateCode();
    existingCodes.add(code);

    rows.push({
      code,
      type,
      description:          description || null,
      trial_days:           type === 'trial' ? trial_days : 0,
      discount_percent:     type === 'discount' ? discount_percent : 0,
      grants_igta_member:   type === 'igta_verification',
      applicable_tier:      applicable_tier || null,
      applicable_user_type: applicable_user_type || 'both',
      max_uses:             1,   // each code is single-use
      max_uses_per_user:    max_uses_per_user ?? 1,
      valid_from:           new Date().toISOString(),
      valid_until:          valid_until ? new Date(valid_until).toISOString() : null,
      is_active:            true,
      assigned_to_partner:  partnerId,
      purchase_price:       purchase_price || null,
      batch_id:             batchId,
    });
  }

  // Insert all codes
  const { data: inserted, error } = await adminClient
    .from('promo_codes')
    .insert(rows)
    .select('id, code');

  if (error) {
    console.error('[BatchCreate] Insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[BatchCreate] Created ${inserted?.length} codes in batch ${batchId} for partner ${partnerId}`);

  return NextResponse.json({
    success:  true,
    batchId,
    count:    inserted?.length ?? 0,
    codes:    inserted,
  });
}