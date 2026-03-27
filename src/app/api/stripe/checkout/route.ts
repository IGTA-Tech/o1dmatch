// src/app/api/stripe/checkout/route.ts
// ── CHANGES FROM ORIGINAL ─────────────────────────────────
// 1. Body now accepts optional `affiliateCode` field
// 2. affiliateCode is passed into session metadata
// 3. Also reads from profiles.affiliate_code_used as fallback
// All promo code, tier validation, and customer logic UNCHANGED.
// ──────────────────────────────────────────────────────────
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateStripeCustomer, createCheckoutSession, createStripeCoupon, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { EMPLOYER_TIERS, TALENT_TIERS, EmployerTier, TalentTier } from '@/lib/subscriptions/tiers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // ── NEW: affiliateCode added to destructuring ──
    const { userType, tier, promoCode, affiliateCode } = body as {
      userType: 'employer' | 'talent';
      tier: string;
      promoCode?: string;
      affiliateCode?: string;   // ← NEW
    };

    // Validate tier (UNCHANGED)
    if (userType === 'employer') {
      if (!Object.keys(EMPLOYER_TIERS).includes(tier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
      if (tier === 'free') {
        return NextResponse.json({ error: 'Cannot checkout for free tier' }, { status: 400 });
      }
    } else {
      if (!Object.keys(TALENT_TIERS).includes(tier)) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
      if (tier === 'profile_only' || tier === 'igta_member') {
        return NextResponse.json({ error: 'Cannot checkout for this tier' }, { status: 400 });
      }
    }

    // Get user profile (UNCHANGED + fetch affiliate fallback)
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, affiliate_code_used')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // ── Resolve affiliate code: explicit > localStorage > profile DB ──
    const resolvedAffiliateCode =
      affiliateCode?.toUpperCase().trim() ||
      profile.affiliate_code_used ||
      null;

    // Create or get Stripe customer (UNCHANGED)
    const customer = await getOrCreateStripeCustomer(
      profile.email || user.email || '',
      user.id,
      profile.full_name,
      { userType }
    );
    if (!customer) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }

    // Promo code handling (UNCHANGED)
    let trialDays = 0;
    let couponId: string | undefined;

    if (promoCode) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode)
        .eq('is_active', true)
        .single();

      if (promo) {
        if (promo.type === 'trial' && promo.trial_days) {
          trialDays = promo.trial_days;
        }
        if (promo.type === 'discount' && promo.discount_percent > 0) {
          try {
            const coupon = await createStripeCoupon({
              discountPercent: promo.discount_percent,
              promoCode: promo.code,
            });
            couponId = coupon.id;
          } catch (couponError) {
            console.error('Failed to create Stripe coupon:', couponError);
          }
        }
        await supabase.from('promo_code_redemptions').insert({
          promo_code_id: promo.id,
          user_id: user.id,
          user_type: userType,
        });
        await supabase
          .from('promo_codes')
          .update({ current_uses: (promo.current_uses || 0) + 1 })
          .eq('id', promo.id);
      }
    }

    // Price IDs (UNCHANGED)
    let priceId: string;
    let setupPriceId: string | undefined;

    if (userType === 'employer') {
      const employerTier = tier as EmployerTier;
      const hasSetupFee  = ['starter', 'growth', 'business'].includes(employerTier);
      setupPriceId       = hasSetupFee ? STRIPE_PRICE_IDS.setup_fee : undefined;
      switch (employerTier) {
        case 'starter':    priceId = STRIPE_PRICE_IDS.employer.starter_monthly;    break;
        case 'growth':     priceId = STRIPE_PRICE_IDS.employer.growth_monthly;     break;
        case 'business':   priceId = STRIPE_PRICE_IDS.employer.business_monthly;   break;
        case 'enterprise': priceId = STRIPE_PRICE_IDS.employer.enterprise_monthly; break;
        default: return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
    } else {
      const talentTier = tier as TalentTier;
      switch (talentTier) {
        case 'starter':      priceId = STRIPE_PRICE_IDS.talent.starter_monthly;      break;
        case 'active_match': priceId = STRIPE_PRICE_IDS.talent.active_match_monthly; break;
        default: return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
    }

    if (!priceId!) {
      return NextResponse.json({ error: 'Stripe price not configured for this tier' }, { status: 500 });
    }

    const baseUrl    = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    // ── Include {CHECKOUT_SESSION_ID} so the billing page gets the session ID ──
    // Stripe replaces {CHECKOUT_SESSION_ID} with the actual session ID automatically.
    // This lets the billing client call /api/affiliate/commission with the session ID
    // to create the commission even if the webhook doesn't fire (e.g. local dev).
    const successUrl = `${baseUrl}/dashboard/${userType}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl  = `${baseUrl}/pricing?canceled=true`;

    const session = await createCheckoutSession({
      customerId:   customer.id,
      priceId,
      setupPriceId,
      successUrl,
      cancelUrl,
      trialDays,
      couponId,
      metadata: {
        userId:        user.id,
        userType,
        tier,
        // ── NEW: include affiliate code in Stripe metadata ──
        ...(resolvedAffiliateCode ? { affiliateCode: resolvedAffiliateCode } : {}),
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}