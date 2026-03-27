// src/app/api/stripe/enterprise-checkout/route.ts
// Simple checkout for enterprise tier subscriptions.
// Accepts a direct priceId — no tier validation needed since
// enterprise tiers are only shown to users already assigned them.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as never,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, tierKey } = await request.json() as {
      priceId: string;
      tierKey: string;
    };

    if (!priceId) {
      return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    // Get or create Stripe customer
    let customerId: string | undefined;
    const { data: existingCustomer } = await supabase
      .from('employer_subscriptions')
      .select('stripe_customer_id')
      .eq('employer_id', user.id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: profile?.email ?? user.email ?? '',
        name:  profile?.full_name ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer:   customerId,
      mode:       'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/enterprise/tier?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${APP_URL}/enterprise/tier?canceled=true`,
      metadata: {
        user_id:   user.id,
        tier_key:  tierKey,
        user_type: 'enterprise',
      },
      subscription_data: {
        metadata: {
          user_id:  user.id,
          tier_key: tierKey,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[EnterpriseCheckout] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}