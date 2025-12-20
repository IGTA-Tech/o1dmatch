import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { constructWebhookEvent } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  const event = constructWebhookEvent(body, signature, webhookSecret);

  if (!event) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(supabase, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
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

async function handleCheckoutCompleted(
  supabase: Awaited<ReturnType<typeof createClient>>,
  session: Stripe.Checkout.Session
) {
  const { userId, userType, tier } = session.metadata || {};

  if (!userId || !userType) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const tableName = userType === 'employer' ? 'employer_subscriptions' : 'talent_subscriptions';
  const idColumn = userType === 'employer' ? 'employer_id' : 'talent_id';

  await supabase
    .from(tableName)
    .upsert({
      [idColumn]: userId,
      tier: tier || (userType === 'employer' ? 'starter' : 'starter'),
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      status: 'active',
      setup_fee_paid: true,
      updated_at: new Date().toISOString(),
    });
}

async function handleSubscriptionUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const status = mapStripeStatus(subscription.status);

  // Access period dates from subscription (cast for type safety)
  const subData = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
  };
  const periodStart = subData.current_period_start
    ? new Date(subData.current_period_start * 1000).toISOString()
    : null;
  const periodEnd = subData.current_period_end
    ? new Date(subData.current_period_end * 1000).toISOString()
    : null;

  // Try employer first
  const { data: employerSub } = await supabase
    .from('employer_subscriptions')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (employerSub) {
    await supabase
      .from('employer_subscriptions')
      .update({
        status,
        stripe_subscription_id: subscription.id,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
    return;
  }

  // Try talent
  await supabase
    .from('talent_subscriptions')
    .update({
      status,
      stripe_subscription_id: subscription.id,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionCanceled(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  // Update employer subscription
  await supabase
    .from('employer_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  // Update talent subscription
  await supabase
    .from('talent_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

async function handlePaymentSucceeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  const customerId = invoice.customer as string;

  // Reset monthly letter count on successful payment (new billing period)
  await supabase
    .from('employer_subscriptions')
    .update({
      letters_sent_this_month: 0,
      letters_reset_at: new Date().toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  // Log successful payment
  console.log(`Payment succeeded for customer: ${customerId}`);
}

async function handlePaymentFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
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

  // TODO: Send email notification about failed payment
  console.log(`Payment failed for customer: ${customerId}`);
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'trialing':
      return 'trialing';
    case 'paused':
      return 'paused';
    default:
      return 'active';
  }
}
