import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateStripeCustomer, createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { EMPLOYER_TIERS, TALENT_TIERS, EmployerTier, TalentTier } from '@/lib/subscriptions/tiers';

export async function POST(request: Request) {
  try {
    console.log('Checkout API called');
    
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('User authenticated:', user.id);

    const body = await request.json();
    const { userType, tier, promoCode } = body as {
      userType: 'employer' | 'talent';
      tier: string;
      promoCode?: string;
    };
    console.log('Request body:', { userType, tier, promoCode });

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
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('Profile error:', profileError);
      return NextResponse.json({ error: `Profile error: ${profileError.message}` }, { status: 404 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    console.log('Profile found:', profile.email);

    // Create or get Stripe customer
    const email = profile.email || user.email || '';
    if (!email) {
      return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
    }

    let customer;
    try {
      console.log('Creating/getting Stripe customer for:', email);
      customer = await getOrCreateStripeCustomer(
        email,
        user.id,
        profile.full_name || undefined,
        { userType }
      );
      console.log('Stripe customer:', customer.id);
    } catch (stripeError) {
      console.error('Stripe customer error:', stripeError);
      const errorMessage = stripeError instanceof Error ? stripeError.message : 'Failed to create customer';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Ensure customer exists (TypeScript guard)
    if (!customer || !customer.id) {
      return NextResponse.json({ error: 'Failed to create Stripe customer' }, { status: 500 });
    }

    // Check for promo code and get trial days
    let trialDays = 0;
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

    if (userType === 'employer') {
      const employerTier = tier as EmployerTier;

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

    console.log('Price ID:', priceId);

    if (!priceId) {
      const envVarName = userType === 'employer' 
        ? `STRIPE_PRICE_EMPLOYER_${tier.toUpperCase()}` 
        : `STRIPE_PRICE_TALENT_${tier.toUpperCase().replace('_', '_')}`;
      return NextResponse.json(
        { error: `Stripe price not configured. Please set ${envVarName} in your environment variables.` },
        { status: 500 }
      );
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard/${userType}/billing?success=true`;
    const cancelUrl = `${baseUrl}/dashboard/${userType}/billing?canceled=true`;

    console.log('Creating checkout session...');
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);

    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId,
      successUrl,
      cancelUrl,
      trialDays,
      metadata: {
        userId: user.id,
        userType,
        tier,
      },
    });
    
    console.log('Checkout session created:', session.id);

    if (!session.url) {
      return NextResponse.json({ error: 'Checkout session created but no URL returned' }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}