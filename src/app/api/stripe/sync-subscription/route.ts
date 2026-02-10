import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  console.log('=== SYNC SUBSCRIPTION API CALLED ===');
  
  // Check environment variables
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return NextResponse.json({ 
      error: 'Server configuration error', 
      details: 'Missing SUPABASE_SERVICE_ROLE_KEY' 
    }, { status: 500 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing STRIPE_SECRET_KEY');
    return NextResponse.json({ 
      error: 'Server configuration error', 
      details: 'Missing STRIPE_SECRET_KEY' 
    }, { status: 500 });
  }

  // Use service role key to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const { userId, userType } = body;

    console.log('Request body:', { userId, userType });

    if (!userId || !userType) {
      return NextResponse.json({ error: 'Missing userId or userType' }, { status: 400 });
    }

    // Method 1: Check recent checkout sessions for this user
    console.log('Searching recent checkout sessions...');
    const sessions = await stripe.checkout.sessions.list({
      limit: 20,
    });

    let customer: Stripe.Customer | null = null;
    let foundSession: Stripe.Checkout.Session | null = null;

    for (const session of sessions.data) {
      console.log('Checking session:', session.id, 'metadata:', session.metadata);
      if (session.metadata?.userId === userId) {
        foundSession = session;
        if (session.customer) {
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
          const customerData = await stripe.customers.retrieve(customerId);
          if (!customerData.deleted) {
            customer = customerData as Stripe.Customer;
          }
        }
        break;
      }
    }

    // Method 2: Search customers by metadata
    if (!customer) {
      console.log('Searching customers by metadata...');
      const customers = await stripe.customers.list({ limit: 50 });
      for (const c of customers.data) {
        if (c.metadata?.userId === userId) {
          customer = c;
          break;
        }
      }
    }

    // Method 3: Search by email
    if (!customer) {
      console.log('Searching by email...');
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      console.log('Profile lookup result:', profile);

      if (profile?.email) {
        const customersByEmail = await stripe.customers.list({
          email: profile.email,
          limit: 1,
        });
        if (customersByEmail.data.length > 0) {
          customer = customersByEmail.data[0];
        }
      }
    }

    if (!customer) {
      console.log('No customer found for userId:', userId);
      return NextResponse.json({ 
        error: 'No Stripe customer found for this user',
        details: 'Make sure you have completed a checkout first. UserId: ' + userId
      }, { status: 404 });
    }

    console.log('Found customer:', customer.id, 'email:', customer.email);

    // Get subscriptions for this customer
    console.log('Fetching subscriptions for customer:', customer.id);
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 5,
    });

    console.log('Found subscriptions:', subscriptions.data.length);
    subscriptions.data.forEach(sub => {
      console.log('  - Subscription:', sub.id, 'status:', sub.status);
    });

    // Find an active or trialing subscription
    const subscription = subscriptions.data.find(s => 
      s.status === 'active' || s.status === 'trialing'
    );

    if (!subscription) {
      return NextResponse.json({ 
        error: 'No active subscription found',
        details: `Customer ${customer.id} has ${subscriptions.data.length} subscriptions, but none are active/trialing`,
        customerId: customer.id
      }, { status: 404 });
    }

    const priceId = subscription.items.data[0]?.price.id;
    console.log('Active subscription found:', subscription.id, 'priceId:', priceId);
    
    // Access billing period - cast to handle API version type differences
    const subData = subscription as unknown as {
      current_period_start?: number;
      current_period_end?: number;
      trial_end?: number | null;
    };
    
    console.log('Subscription timestamps:', {
      current_period_start: subData.current_period_start,
      current_period_end: subData.current_period_end,
      trial_end: subData.trial_end,
    });

    // Determine tier from metadata or price
    let tier = customer.metadata?.tier || foundSession?.metadata?.tier;

    // Map price IDs to tiers based on user type
    const employerPriceToTier: Record<string, string> = {
      [process.env.STRIPE_PRICE_EMPLOYER_STARTER || '']: 'starter',
      [process.env.STRIPE_PRICE_EMPLOYER_GROWTH || '']: 'growth',
      [process.env.STRIPE_PRICE_EMPLOYER_BUSINESS || '']: 'business',
      [process.env.STRIPE_PRICE_EMPLOYER_ENTERPRISE || '']: 'enterprise',
    };

    const talentPriceToTier: Record<string, string> = {
      [process.env.STRIPE_PRICE_TALENT_STARTER || '']: 'starter',
      [process.env.STRIPE_PRICE_TALENT_ACTIVE_MATCH || '']: 'active_match',
      [process.env.STRIPE_PRICE_TALENT_IGTA_MEMBER || '']: 'igta_member',
    };

    // Set default tier and determine from price based on user type
    if (userType === 'employer') {
      tier = tier || 'starter';
      if (priceId && employerPriceToTier[priceId]) {
        tier = employerPriceToTier[priceId];
      }
    } else if (userType === 'talent') {
      tier = tier || 'starter';
      if (priceId && talentPriceToTier[priceId]) {
        tier = talentPriceToTier[priceId];
      }
    }

    console.log('Determined tier:', tier, 'for userType:', userType);

    // Safely convert timestamps
    const safeDate = (timestamp: number | null | undefined): string | null => {
      if (!timestamp || typeof timestamp !== 'number') return null;
      try {
        return new Date(timestamp * 1000).toISOString();
      } catch {
        console.error('Failed to convert timestamp:', timestamp);
        return null;
      }
    };

    const subscriptionData = {
      employer_id: userId,
      tier: tier,
      status: subscription.status === 'trialing' ? 'trialing' : 'active',
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId || null,
      current_period_start: safeDate(subData.current_period_start),
      current_period_end: safeDate(subData.current_period_end),
      trial_ends_at: safeDate(subData.trial_end),
      setup_fee_paid: true,
      updated_at: new Date().toISOString(),
    };

    console.log('Upserting subscription data:', JSON.stringify(subscriptionData, null, 2));

    if (userType === 'employer') {
      const { data, error } = await supabase
        .from('employer_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'employer_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert error:', error);
        return NextResponse.json({ 
          error: 'Database error', 
          details: error.message,
          code: error.code 
        }, { status: 500 });
      }

      console.log('=== EMPLOYER SUBSCRIPTION SAVED SUCCESSFULLY ===');
      console.log('Saved data:', data);
      
      return NextResponse.json({ success: true, subscription: data });
    }

    if (userType === 'talent') {
      // Build talent subscription data (different schema than employer)
      const talentSubscriptionData = {
        talent_id: userId,
        tier: tier,
        status: subscription.status === 'trialing' ? 'trialing' : 'active',
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId || null,
        current_period_start: safeDate(subData.current_period_start),
        current_period_end: safeDate(subData.current_period_end),
        updated_at: new Date().toISOString(),
      };

      console.log('Upserting talent subscription data:', JSON.stringify(talentSubscriptionData, null, 2));

      const { data, error } = await supabase
        .from('talent_subscriptions')
        .upsert(talentSubscriptionData, {
          onConflict: 'talent_id',
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert error:', error);
        return NextResponse.json({ 
          error: 'Database error', 
          details: error.message,
          code: error.code 
        }, { status: 500 });
      }

      console.log('=== TALENT SUBSCRIPTION SAVED SUCCESSFULLY ===');
      console.log('Saved data:', data);
      
      return NextResponse.json({ success: true, subscription: data });
    }

    return NextResponse.json({ error: 'Invalid userType' }, { status: 400 });

  } catch (error) {
    console.error('Sync subscription error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}