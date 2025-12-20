import Stripe from 'stripe';

// Initialize Stripe with secret key
// IMPORTANT: Set STRIPE_SECRET_KEY in your .env.local file
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// Stripe Price IDs - configured in .env.local
export const STRIPE_PRICE_IDS = {
  employer: {
    starter_monthly: process.env.STRIPE_PRICE_EMPLOYER_STARTER || '',
    growth_monthly: process.env.STRIPE_PRICE_EMPLOYER_GROWTH || '',
    business_monthly: process.env.STRIPE_PRICE_EMPLOYER_BUSINESS || '',
    enterprise_monthly: process.env.STRIPE_PRICE_EMPLOYER_ENTERPRISE || '',
  },
  talent: {
    starter_monthly: process.env.STRIPE_PRICE_TALENT_STARTER || '',
    active_match_monthly: process.env.STRIPE_PRICE_TALENT_ACTIVE_MATCH || '',
  },
  setup_fee: process.env.STRIPE_PRICE_SETUP_FEE || '',
};

// Create or retrieve a Stripe customer
export async function getOrCreateStripeCustomer(
  email: string,
  userId: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer | null> {
  if (!stripe) {
    console.warn('Stripe not initialized - missing STRIPE_SECRET_KEY');
    return null;
  }

  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
      ...metadata,
    },
  });

  return customer;
}

// Create a checkout session for subscription
export async function createCheckoutSession(params: {
  customerId: string;
  priceId: string;
  setupPriceId?: string; // One-time setup fee
  successUrl: string;
  cancelUrl: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) {
    console.warn('Stripe not initialized');
    return null;
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: params.priceId,
      quantity: 1,
    },
  ];

  // Add setup fee if applicable
  if (params.setupPriceId) {
    lineItems.push({
      price: params.setupPriceId,
      quantity: 1,
    });
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    customer: params.customerId,
    mode: 'subscription',
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    subscription_data: {
      metadata: params.metadata,
    },
  };

  // Add trial period if applicable
  if (params.trialDays && params.trialDays > 0) {
    sessionParams.subscription_data!.trial_period_days = params.trialDays;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);
  return session;
}

// Create a billing portal session for managing subscription
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session | null> {
  if (!stripe) {
    console.warn('Stripe not initialized');
    return null;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

// Cancel a subscription
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not initialized');
    return null;
  }

  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  }

  // Cancel at period end
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Resume a canceled subscription
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not initialized');
    return null;
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Get subscription details
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not initialized');
    return null;
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Change subscription tier
export async function changeSubscriptionTier(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    console.warn('Stripe not initialized');
    return null;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  if (!stripe) {
    console.warn('Stripe not initialized');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}
