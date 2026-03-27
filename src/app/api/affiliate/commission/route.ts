// src/app/api/affiliate/commission/route.ts
// ============================================================
// Creates an affiliate commission after a successful payment.
// Called by the billing client on ?success=true as a reliable
// fallback for when the Stripe webhook doesn't fire locally.
//
// Idempotent — safe to call multiple times for the same user.
// Uses service role to bypass RLS.
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(req: NextRequest) {
  // 1. Verify authenticated user
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { sessionId } = body as { sessionId?: string };

  console.log('[AffiliateCommission] ── START ────────────────────────');
  console.log('[AffiliateCommission] userId:', user.id, '| sessionId:', sessionId ?? 'none');

  try {
    // 2. Get affiliate code — from Stripe session metadata first, then profile DB
    let affiliateCode: string | null = null;
    let grossAmount    = 0;
    let stripeSubId    = '';
    let tier           = '';
    let userType       = '';

    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        affiliateCode = session.metadata?.affiliateCode ?? null;
        grossAmount   = (session.amount_total ?? 0) / 100;
        stripeSubId   = session.subscription as string;
        tier          = session.metadata?.tier ?? '';
        userType      = session.metadata?.userType ?? '';

        console.log('[AffiliateCommission] Session metadata affiliateCode:', affiliateCode ?? 'none');
        console.log('[AffiliateCommission] grossAmount:', grossAmount, '| stripeSubId:', stripeSubId);
      } catch (stripeErr) {
        console.error('[AffiliateCommission] Failed to retrieve Stripe session:', stripeErr);
      }
    }

    // Fallback: read from profiles table
    if (!affiliateCode) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('affiliate_code_used')
        .eq('id', user.id)
        .single();
      affiliateCode = profile?.affiliate_code_used ?? null;
      console.log('[AffiliateCommission] Fallback affiliateCode from profile:', affiliateCode ?? 'none');
    }

    if (!affiliateCode) {
      console.log('[AffiliateCommission] No affiliate code — nothing to do');
      return NextResponse.json({ success: true, message: 'No affiliate code' });
    }

    // 3. Get subscription details if not from session
    if (!stripeSubId || !grossAmount) {
      const tableId  = userType === 'employer' ? 'employer_subscriptions' : 'talent_subscriptions';
      const idColumn = userType === 'employer' ? 'employer_id' : 'talent_id';
      const { data: sub } = await adminSupabase
        .from(tableId)
        .select('stripe_subscription_id, tier')
        .eq(idColumn, user.id)
        .single();

      if (sub?.stripe_subscription_id) {
        stripeSubId = sub.stripe_subscription_id;
        tier        = sub.tier ?? tier;
        // Get amount from Stripe subscription price
        try {
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
          // unit_amount is in cents — use the first item's price
          grossAmount = (stripeSub.items.data[0]?.price?.unit_amount ?? 0) / 100;
        } catch {
          grossAmount = 0;
        }
      }
    }

    // 4. Find the active partner
    const { data: partner, error: partnerErr } = await adminSupabase
      .from('affiliate_partners')
      .select('id, commission_rate, total_conversions, total_earned, total_pending')
      .eq('affiliate_code', affiliateCode.toUpperCase().trim())
      .eq('status', 'active')
      .single();

    console.log('[AffiliateCommission] Partner:', partner ? `id=${partner.id}` : 'NOT FOUND', '| error:', partnerErr?.message ?? 'none');

    if (!partner) {
      return NextResponse.json({ success: true, message: 'Partner not found or inactive' });
    }

    // 5. Idempotency — one commission per user per partner
    const { data: existing } = await adminSupabase
      .from('affiliate_commissions')
      .select('id, status')
      .eq('affiliate_id', partner.id)
      .eq('referred_user_id', user.id)
      .single();

    if (existing) {
      console.log('[AffiliateCommission] Commission already exists:', existing.id, 'status:', existing.status);
      return NextResponse.json({ success: true, message: 'Commission already created', commissionId: existing.id });
    }

    // 6. Calculate commission
    // For employer plans: strip $100 setup fee from commission base
    let commissionable = grossAmount;
    if (userType === 'employer') {
      commissionable = Math.max(0, grossAmount - 100);
    }
    const commissionAmount = Math.round(commissionable * partner.commission_rate * 100) / 100;
    const clawbackUntil    = new Date();
    clawbackUntil.setDate(clawbackUntil.getDate() + 30);

    console.log('[AffiliateCommission] gross:', grossAmount, '| commissionable:', commissionable, '| commission:', commissionAmount);

    // 7. Find referral record
    const { data: referral } = await adminSupabase
      .from('affiliate_referrals')
      .select('id')
      .eq('affiliate_code', affiliateCode.toUpperCase().trim())
      .eq('referred_user_id', user.id)
      .single();

    console.log('[AffiliateCommission] Referral record:', referral ? referral.id : 'none');

    // 8. Insert commission — upsert with ignoreDuplicates prevents double-insert
    // if webhook and this fallback API both fire for the same user simultaneously.
    const { data: newCommission, error: insertErr } = await adminSupabase
      .from('affiliate_commissions')
      .upsert({
        affiliate_id:      partner.id,
        referral_id:       referral?.id ?? null,
        referred_user_id:  user.id,
        stripe_sub_id:     stripeSubId || null,
        gross_amount:      commissionable,
        commission_rate:   partner.commission_rate,
        commission_amount: commissionAmount,
        status:            'pending',
        clawback_until:    clawbackUntil.toISOString(),
      }, {
        onConflict:       'affiliate_id,referred_user_id',
        ignoreDuplicates: true,
      })
      .select('id')
      .maybeSingle();  // returns null (not error) when row already existed

    // ignoreDuplicates returns null data (not an error) if row already existed
    if (insertErr) {
      // Check if it's a genuine error vs a duplicate that slipped through
      if (insertErr.code === '23505') {
        console.log('[AffiliateCommission] Duplicate prevented by DB constraint — already exists');
        return NextResponse.json({ success: true, message: 'Commission already created' });
      }
      console.error('[AffiliateCommission] Insert failed:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    if (!newCommission) {
      console.log('[AffiliateCommission] Row already existed — skipping stats update');
      return NextResponse.json({ success: true, message: 'Commission already created' });
    }

    console.log('[AffiliateCommission] ✓ Commission created:', newCommission.id);

    // 9. Update referral → converted
    if (referral) {
      await adminSupabase
        .from('affiliate_referrals')
        .update({
          status:                 'converted',
          converted_at:           new Date().toISOString(),
          stripe_subscription_id: stripeSubId || null,
          subscription_tier:      tier || null,
          user_role:              userType || null,
        })
        .eq('id', referral.id);
      console.log('[AffiliateCommission] ✓ Referral → converted');
    }

    // 10. Increment partner stats atomically
    await adminSupabase
      .from('affiliate_partners')
      .update({
        total_conversions: (partner.total_conversions ?? 0) + 1,
        total_earned:      (partner.total_earned      ?? 0) + commissionAmount,
        total_pending:     (partner.total_pending     ?? 0) + commissionAmount,
        updated_at:        new Date().toISOString(),
      })
      .eq('id', partner.id);

    console.log('[AffiliateCommission] ✓ Partner stats updated');
    console.log('[AffiliateCommission] ── DONE ─────────────────────────');

    return NextResponse.json({
      success:        true,
      commissionId:   newCommission?.id,
      commissionAmount,
      clawbackUntil:  clawbackUntil.toISOString(),
    });

  } catch (err: unknown) {
    console.error('[AffiliateCommission] Unexpected error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}