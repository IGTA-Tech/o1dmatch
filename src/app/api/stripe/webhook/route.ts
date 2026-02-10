import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Use service role key for webhook (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);

  const userId = session.metadata?.userId;
  const userType = session.metadata?.userType;
  const tier = session.metadata?.tier;

  if (!userId || !userType || !tier) {
    console.error('Missing metadata in checkout session:', session.metadata);
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Get the subscription details from Stripe
  let stripeSubscription: Stripe.Subscription | null = null;
  let priceId: string | null = null;
  let currentPeriodStart: string | null = null;
  let currentPeriodEnd: string | null = null;
  let trialEndsAt: string | null = null;

  if (subscriptionId) {
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      priceId = stripeSubscription.items.data[0]?.price.id || null;
      
      // Access billing period - cast to any to handle API version differences
      const subData = stripeSubscription as unknown as {
        current_period_start?: number;
        current_period_end?: number;
        trial_end?: number | null;
      };
      
      if (subData.current_period_start) {
        currentPeriodStart = new Date(subData.current_period_start * 1000).toISOString();
      }
      if (subData.current_period_end) {
        currentPeriodEnd = new Date(subData.current_period_end * 1000).toISOString();
      }
      if (subData.trial_end) {
        trialEndsAt = new Date(subData.trial_end * 1000).toISOString();
      }
    } catch (err) {
      console.error('Error fetching subscription from Stripe:', err);
    }
  }

  console.log('Updating subscription for user:', userId, 'tier:', tier);

  if (userType === 'employer') {
    // Upsert employer subscription
    const { error } = await supabase
      .from('employer_subscriptions')
      .upsert({
        employer_id: userId,
        tier: tier,
        status: stripeSubscription?.status === 'trialing' ? 'trialing' : 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        trial_ends_at: trialEndsAt,
        setup_fee_paid: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'employer_id',
      });

    if (error) {
      console.error('Error updating employer subscription:', error);
    } else {
      console.log('Employer subscription updated successfully');
    }
  } else if (userType === 'talent') {
    // Upsert talent subscription (note: talent_subscriptions doesn't have trial_ends_at)
    const { error } = await supabase
      .from('talent_subscriptions')
      .upsert({
        talent_id: userId,
        tier: tier,
        status: stripeSubscription?.status === 'trialing' ? 'trialing' : 'active',
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'talent_id',
      });

    if (error) {
      console.error('Error updating talent subscription:', error);
    } else {
      console.log('Talent subscription updated successfully');
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id, 'status:', subscription.status);

  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id || null;

  // Map Stripe status to your allowed statuses
  let status: string;
  switch (subscription.status) {
    case 'active':
      status = 'active';
      break;
    case 'trialing':
      status = 'trialing';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    case 'canceled':
    case 'unpaid':
      status = 'canceled';
      break;
    case 'paused':
      status = 'paused';
      break;
    default:
      status = 'active';
  }

  // Access billing period - cast to handle API version differences
  const subData = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    trial_end?: number | null;
  };

  const currentPeriodStart = subData.current_period_start 
    ? new Date(subData.current_period_start * 1000).toISOString()
    : null;
  const currentPeriodEnd = subData.current_period_end
    ? new Date(subData.current_period_end * 1000).toISOString()
    : null;
  const trialEndsAt = subData.trial_end 
    ? new Date(subData.trial_end * 1000).toISOString() 
    : null;

  // Try to update employer subscription
  const { data: employerSub } = await supabase
    .from('employer_subscriptions')
    .select('employer_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (employerSub) {
    const { error } = await supabase
      .from('employer_subscriptions')
      .update({
        status: status,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        trial_ends_at: trialEndsAt,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Error updating employer subscription:', error);
    } else {
      console.log('Employer subscription status updated to:', status);
    }
    return;
  }

  // Try to update talent subscription
  const { data: talentSub } = await supabase
    .from('talent_subscriptions')
    .select('talent_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (talentSub) {
    // Note: talent_subscriptions doesn't have trial_ends_at column
    const { error } = await supabase
      .from('talent_subscriptions')
      .update({
        status: status,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);

    if (error) {
      console.error('Error updating talent subscription:', error);
    } else {
      console.log('Talent subscription status updated to:', status);
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const customerId = subscription.customer as string;

  // Update employer subscription to free/canceled
  const { error: empError } = await supabase
    .from('employer_subscriptions')
    .update({
      tier: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_start: null,
      current_period_end: null,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (empError) {
    console.error('Error canceling employer subscription:', empError);
  }

  // Update talent subscription to profile_only/canceled (no trial_ends_at column)
  const { error: talError } = await supabase
    .from('talent_subscriptions')
    .update({
      tier: 'profile_only',
      status: 'canceled',
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_start: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (talError) {
    console.error('Error canceling talent subscription:', talError);
  }

  console.log('Subscription canceled for customer:', customerId);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);
  // Subscription is automatically updated via subscription.updated event
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  // Update status to past_due
  await supabase
    .from('employer_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  await supabase
    .from('talent_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}