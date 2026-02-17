import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateStripeCustomer, createCheckoutSession, createStripeCoupon, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { EMPLOYER_TIERS, TALENT_TIERS, EmployerTier, TalentTier } from '@/lib/subscriptions/tiers';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userType, tier, promoCode } = body as {
      userType: 'employer' | 'talent';
      tier: string;
      promoCode?: string;
    };

    // Validate tier
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    const customer = await getOrCreateStripeCustomer(
      profile.email || user.email || '',
      user.id,
      profile.full_name,
      { userType }
    );

    if (!customer) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }

    // Check for promo code and get trial days / discount
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
        // Handle trial type
        if (promo.type === 'trial' && promo.trial_days) {
          trialDays = promo.trial_days;
        }

        // Handle discount type — create a Stripe coupon
        if (promo.type === 'discount' && promo.discount_percent > 0) {
          try {
            const coupon = await createStripeCoupon({
              discountPercent: promo.discount_percent,
              promoCode: promo.code,
            });
            couponId = coupon.id;
          } catch (couponError) {
            console.error('Failed to create Stripe coupon:', couponError);
            // Continue without discount rather than blocking checkout
          }
        }

        // Record promo code usage
        await supabase.from('promo_code_redemptions').insert({
          promo_code_id: promo.id,
          user_id: user.id,
          user_type: userType,
        });

        // Increment usage count
        await supabase
          .from('promo_codes')
          .update({ current_uses: (promo.current_uses || 0) + 1 })
          .eq('id', promo.id);
      }
    }

    // Get price IDs based on tier
    let priceId: string;
    let setupPriceId: string | undefined;

    if (userType === 'employer') {
      const employerTier = tier as EmployerTier;
      // Starter, Growth, Business tiers have $100 setup fee; Enterprise has none
      const hasSetupFee = ['starter', 'growth', 'business'].includes(employerTier);
      setupPriceId = hasSetupFee ? STRIPE_PRICE_IDS.setup_fee : undefined;

      switch (employerTier) {
        case 'starter':
          priceId = STRIPE_PRICE_IDS.employer.starter_monthly;
          break;
        case 'growth':
          priceId = STRIPE_PRICE_IDS.employer.growth_monthly;
          break;
        case 'business':
          priceId = STRIPE_PRICE_IDS.employer.business_monthly;
          break;
        case 'enterprise':
          priceId = STRIPE_PRICE_IDS.employer.enterprise_monthly;
          break;
        default:
          return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
    } else {
      const talentTier = tier as TalentTier;
      switch (talentTier) {
        case 'starter':
          priceId = STRIPE_PRICE_IDS.talent.starter_monthly;
          break;
        case 'active_match':
          priceId = STRIPE_PRICE_IDS.talent.active_match_monthly;
          break;
        default:
          return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
      }
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this tier' },
        { status: 500 }
      );
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard/${userType}/billing?success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      setupPriceId,
      successUrl,
      cancelUrl,
      trialDays,
      couponId,
      metadata: {
        userId: user.id,
        userType,
        tier,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}