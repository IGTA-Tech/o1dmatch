// src/app/api/stripe/webhook/route.ts
// ── CHANGES FROM ORIGINAL ─────────────────────────────────
// 1. handleCheckoutCompleted: after subscription upsert,
//    calls createAffiliateCommission() if affiliateCode in metadata
// 2. handleSubscriptionDeleted: calls handleAffiliateClawback()
// 3. handleInvoicePaid: now calls handleAffiliateCommission()
//    for first-time invoice on a subscription
// All other handler logic UNCHANGED.
// ──────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body      = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('No stripe-signature header');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
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
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// ─── handleCheckoutCompleted ─────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] ── checkout.session.completed ─────────────────');
  console.log('[Webhook] Session ID:', session.id);
  console.log('[Webhook] Session metadata:', JSON.stringify(session.metadata ?? {}));
  console.log('[Webhook] Amount total (cents):', session.amount_total);
  console.log('[Webhook] Customer:', session.customer);
  console.log('[Webhook] Subscription:', session.subscription);

  const userId        = session.metadata?.userId;
  const userType      = session.metadata?.userType;
  const tier          = session.metadata?.tier;
  const affiliateCode = session.metadata?.affiliateCode ?? null;

  console.log('[Webhook] Parsed — userId:', userId ?? 'MISSING');
  console.log('[Webhook] Parsed — userType:', userType ?? 'MISSING');
  console.log('[Webhook] Parsed — tier:', tier ?? 'MISSING');
  console.log('[Webhook] Parsed — affiliateCode:', affiliateCode ?? 'NOT PRESENT IN METADATA');

  if (!userId || !userType || !tier) {
    console.error('[Webhook] ✗ Missing required metadata — aborting. Full metadata:', session.metadata);
    return;
  }

  const customerId     = session.customer as string;
  const subscriptionId = session.subscription as string;

  console.log('[Webhook] customerId:', customerId);
  console.log('[Webhook] subscriptionId:', subscriptionId);

  let stripeSubscription: Stripe.Subscription | null = null;
  let priceId: string | null = null;
  let currentPeriodStart: string | null = null;
  let currentPeriodEnd: string | null   = null;
  let trialEndsAt: string | null        = null;
  let amountPaid = 0;

  if (subscriptionId) {
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      priceId = stripeSubscription.items.data[0]?.price.id || null;
      const subData = stripeSubscription as unknown as {
        current_period_start?: number;
        current_period_end?: number;
        trial_end?: number | null;
      };
      if (subData.current_period_start) currentPeriodStart = new Date(subData.current_period_start * 1000).toISOString();
      if (subData.current_period_end)   currentPeriodEnd   = new Date(subData.current_period_end   * 1000).toISOString();
      if (subData.trial_end)            trialEndsAt        = new Date(subData.trial_end             * 1000).toISOString();
      console.log('[Webhook] Stripe subscription status:', stripeSubscription.status);
    } catch (err) {
      console.error('[Webhook] Error fetching subscription from Stripe:', err);
    }
  }

  // Get amount from session (for commission calc)
  amountPaid = (session.amount_total ?? 0) / 100;
  console.log('[Webhook] amountPaid:', amountPaid);

  // Subscription upsert (UNCHANGED)
  if (userType === 'employer') {
    const { error } = await supabase.from('employer_subscriptions').upsert({
      employer_id: userId, tier, status: stripeSubscription?.status === 'trialing' ? 'trialing' : 'active',
      stripe_customer_id: customerId, stripe_subscription_id: subscriptionId, stripe_price_id: priceId,
      current_period_start: currentPeriodStart, current_period_end: currentPeriodEnd,
      trial_ends_at: trialEndsAt, setup_fee_paid: true, updated_at: new Date().toISOString(),
    }, { onConflict: 'employer_id' });
    if (error) console.error('[Webhook] Error updating employer subscription:', error);
    else console.log('[Webhook] ✓ Employer subscription updated');
  } else if (userType === 'talent') {
    const { error } = await supabase.from('talent_subscriptions').upsert({
      talent_id: userId, tier, status: stripeSubscription?.status === 'trialing' ? 'trialing' : 'active',
      stripe_customer_id: customerId, stripe_subscription_id: subscriptionId, stripe_price_id: priceId,
      current_period_start: currentPeriodStart, current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'talent_id' });
    if (error) console.error('[Webhook] Error updating talent subscription:', error);
    else console.log('[Webhook] ✓ Talent subscription updated');
  }

  // ── Affiliate commission ──────────────────────────────────
  console.log('[Webhook] Affiliate check — code:', affiliateCode ?? 'none', '| subscriptionId:', subscriptionId ?? 'none');

  if (!affiliateCode) {
    // Last-chance fallback: read from profiles.affiliate_code_used directly
    console.log('[Webhook] No affiliateCode in metadata — checking profiles table as last resort');
    const { data: profileData } = await supabase
      .from('profiles')
      .select('affiliate_code_used')
      .eq('id', userId)
      .single();

    const fallbackCode = profileData?.affiliate_code_used ?? null;
    console.log('[Webhook] profiles.affiliate_code_used:', fallbackCode ?? 'none');

    if (fallbackCode && subscriptionId) {
      let commissionableAmount = amountPaid;
      if (userType === 'employer') commissionableAmount = Math.max(0, amountPaid - 100);
      await createAffiliateCommission({
        userId, userType, tier, affiliateCode: fallbackCode,
        stripeSubscriptionId: subscriptionId, stripeInvoiceId: null, grossAmount: commissionableAmount,
      });
    }
  } else if (subscriptionId) {
    let commissionableAmount = amountPaid;
    if (userType === 'employer') commissionableAmount = Math.max(0, amountPaid - 100);
    console.log('[Webhook] Creating commission — code:', affiliateCode, 'amount:', commissionableAmount);
    await createAffiliateCommission({
      userId, userType, tier, affiliateCode,
      stripeSubscriptionId: subscriptionId, stripeInvoiceId: null, grossAmount: commissionableAmount,
    });
  }

  console.log('[Webhook] ── checkout.session.completed DONE ──────────');
}

// ─── handleSubscriptionUpdated (UNCHANGED) ───────────────────
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id, 'status:', subscription.status);

  const customerId = subscription.customer as string;
  const priceId    = subscription.items.data[0]?.price.id || null;

  let status: string;
  switch (subscription.status) {
    case 'active':                  status = 'active';    break;
    case 'trialing':                status = 'trialing';  break;
    case 'past_due':                status = 'past_due';  break;
    case 'canceled': case 'unpaid': status = 'canceled';  break;
    case 'paused':                  status = 'paused';    break;
    default:                        status = 'active';
  }

  const subData = subscription as unknown as {
    current_period_start?: number; current_period_end?: number; trial_end?: number | null;
  };
  const currentPeriodStart = subData.current_period_start ? new Date(subData.current_period_start * 1000).toISOString() : null;
  const currentPeriodEnd   = subData.current_period_end   ? new Date(subData.current_period_end   * 1000).toISOString() : null;
  const trialEndsAt        = subData.trial_end            ? new Date(subData.trial_end             * 1000).toISOString() : null;

  const { data: employerSub } = await supabase
    .from('employer_subscriptions').select('employer_id').eq('stripe_customer_id', customerId).single();
  if (employerSub) {
    const { error } = await supabase.from('employer_subscriptions').update({
      status, stripe_subscription_id: subscription.id, stripe_price_id: priceId,
      current_period_start: currentPeriodStart, current_period_end: currentPeriodEnd,
      trial_ends_at: trialEndsAt, updated_at: new Date().toISOString(),
    }).eq('stripe_customer_id', customerId);
    if (error) console.error('Error updating employer subscription:', error);
    else console.log('Employer subscription status updated to:', status);
    return;
  }

  const { data: talentSub } = await supabase
    .from('talent_subscriptions').select('talent_id').eq('stripe_customer_id', customerId).single();
  if (talentSub) {
    const { error } = await supabase.from('talent_subscriptions').update({
      status, stripe_subscription_id: subscription.id, stripe_price_id: priceId,
      current_period_start: currentPeriodStart, current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }).eq('stripe_customer_id', customerId);
    if (error) console.error('Error updating talent subscription:', error);
    else console.log('Talent subscription status updated to:', status);
  }
}

// ─── handleSubscriptionDeleted ───────────────────────────────
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  const customerId = subscription.customer as string;

  // UNCHANGED: cancel subscriptions
  await supabase.from('employer_subscriptions').update({
    tier: 'free', status: 'canceled', stripe_subscription_id: null,
    stripe_price_id: null, current_period_start: null, current_period_end: null,
    trial_ends_at: null, updated_at: new Date().toISOString(),
  }).eq('stripe_customer_id', customerId);

  await supabase.from('talent_subscriptions').update({
    tier: 'profile_only', status: 'canceled', stripe_subscription_id: null,
    stripe_price_id: null, current_period_start: null, current_period_end: null,
    updated_at: new Date().toISOString(),
  }).eq('stripe_customer_id', customerId);

  console.log('Subscription canceled for customer:', customerId);

  // ── NEW: apply clawback if within 30-day window ──────────
  await handleAffiliateClawback(subscription.id);
}

// ─── handleInvoicePaid ───────────────────────────────────────
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);
  // Subscription status updated via subscription.updated event (UNCHANGED)

  // ── NEW: update affiliate_commissions with invoice ID ────
  // This fires for the first invoice and links the stripe_invoice_id
  // In Stripe API 2025-12-15+, invoice.subscription moved to
  // invoice.parent.subscription_details.subscription — cast to any for compatibility.
  const invoiceAny   = invoice as any;
  const invoiceSubId = invoiceAny.subscription ?? invoiceAny.parent?.subscription_details?.subscription ?? null;

  if (invoiceSubId && invoice.billing_reason === 'subscription_create') {
    await supabase
      .from('affiliate_commissions')
      .update({ stripe_invoice_id: invoice.id, updated_at: new Date().toISOString() })
      .eq('stripe_sub_id', invoiceSubId as string)
      .is('stripe_invoice_id', null);
  }
}

// ─── handleInvoiceFailed (UNCHANGED) ─────────────────────────
async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  const customerId = invoice.customer as string;
  await supabase.from('employer_subscriptions').update({
    status: 'past_due', updated_at: new Date().toISOString(),
  }).eq('stripe_customer_id', customerId);
  await supabase.from('talent_subscriptions').update({
    status: 'past_due', updated_at: new Date().toISOString(),
  }).eq('stripe_customer_id', customerId);
}

// ─── createAffiliateCommission ───────────────────────────────
async function createAffiliateCommission(params: {
  userId: string;
  userType: string;
  tier: string;
  affiliateCode: string;
  stripeSubscriptionId: string;
  stripeInvoiceId: string | null;
  grossAmount: number;
}) {
  console.log('[Commission] ── createAffiliateCommission ──────────────');
  console.log('[Commission] Params:', JSON.stringify({ ...params }));

  try {
    // Step 1: Find active partner
    const { data: partner, error: partnerErr } = await supabase
      .from('affiliate_partners')
      .select('id, commission_rate, total_conversions, total_earned, total_pending')
      .eq('affiliate_code', params.affiliateCode.toUpperCase().trim())
      .eq('status', 'active')
      .single();

    console.log('[Commission] Partner lookup:', partner ? `found id=${partner.id} rate=${partner.commission_rate}` : 'NOT FOUND', '| error:', partnerErr?.message ?? 'none');

    if (!partner) {
      console.log('[Commission] ✗ Aborting — no active partner for code:', params.affiliateCode);
      return;
    }

    // Step 2: Idempotency check
    const { data: existing, error: existErr } = await supabase
      .from('affiliate_commissions')
      .select('id')
      .eq('affiliate_id', partner.id)
      .eq('referred_user_id', params.userId)
      .single();

    console.log('[Commission] Existing commission:', existing ? `found id=${existing.id}` : 'none', '| error:', existErr?.message ?? 'none');

    if (existing) {
      console.log('[Commission] ✗ Aborting — commission already exists for user:', params.userId);
      return;
    }

    // Step 3: Calculate
    const commissionAmount = Math.round(params.grossAmount * partner.commission_rate * 100) / 100;
    const clawbackUntil    = new Date();
    clawbackUntil.setDate(clawbackUntil.getDate() + 30);

    console.log('[Commission] grossAmount:', params.grossAmount, '| rate:', partner.commission_rate, '| commission:', commissionAmount);
    console.log('[Commission] clawback_until:', clawbackUntil.toISOString());

    // Step 4: Find referral record
    const { data: referral, error: refErr } = await supabase
      .from('affiliate_referrals')
      .select('id')
      .eq('affiliate_code', params.affiliateCode.toUpperCase().trim())
      .eq('referred_user_id', params.userId)
      .single();

    console.log('[Commission] Referral record:', referral ? `found id=${referral.id}` : 'NOT FOUND', '| error:', refErr?.message ?? 'none');

    // Step 5: Insert commission — ON CONFLICT DO NOTHING prevents duplicates
    // if webhook and billing-client commission API both fire for the same user.
    const { data: newCommission, error: insertErr } = await supabase
      .from('affiliate_commissions')
      .upsert({
        affiliate_id:      partner.id,
        referral_id:       referral?.id ?? null,
        referred_user_id:  params.userId,
        stripe_sub_id:     params.stripeSubscriptionId,
        stripe_invoice_id: params.stripeInvoiceId,
        gross_amount:      params.grossAmount,
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

    console.log('[Commission] Insert result:', newCommission ? `id=${newCommission.id}` : 'failed', '| error:', insertErr?.message ?? 'none');
    if (insertErr) {
      console.error('[Commission] ✗ Commission insert failed:', insertErr);
      return;
    }

    // Step 6: Update referral → converted
    if (referral) {
      const { error: refUpdateErr } = await supabase
        .from('affiliate_referrals')
        .update({
          status:                  'converted',
          converted_at:            new Date().toISOString(),
          stripe_subscription_id:  params.stripeSubscriptionId,
          subscription_tier:       params.tier,
          user_role:               params.userType,
        })
        .eq('id', referral.id);
      console.log('[Commission] Referral → converted error:', refUpdateErr?.message ?? 'none ✓');
    } else {
      console.log('[Commission] No referral record — skipping referral update');
    }

    // Step 7: Update partner stats
    const { error: partnerUpdateErr } = await supabase
      .from('affiliate_partners')
      .update({
        total_conversions: (partner.total_conversions ?? 0) + 1,
        total_earned:      (partner.total_earned ?? 0) + commissionAmount,
        total_pending:     (partner.total_pending ?? 0) + commissionAmount,
        updated_at:        new Date().toISOString(),
      })
      .eq('id', partner.id);

    console.log('[Commission] Partner stats update error:', partnerUpdateErr?.message ?? 'none ✓');
    console.log(`[Commission] ✓ DONE — $${commissionAmount} commission for partner ${partner.id}`);

  } catch (err) {
    console.error('[Commission] ✗ Unexpected error:', err);
  }
}

// ─── NEW: handleAffiliateClawback ────────────────────────────
async function handleAffiliateClawback(subscriptionId: string) {
  try {
    const { data: commission } = await supabase
      .from('affiliate_commissions')
      .select('id, status, clawback_until, commission_amount, affiliate_id')
      .eq('stripe_sub_id', subscriptionId)
      .single();

    if (!commission) return;

    const isInClawback =
      commission.status === 'pending' &&
      commission.clawback_until &&
      new Date() < new Date(commission.clawback_until);

    if (isInClawback) {
      await supabase.from('affiliate_commissions').update({
        status: 'clawback', updated_at: new Date().toISOString(),
      }).eq('id', commission.id);

      // Reverse pending amount
      await supabase.rpc('decrement_affiliate_pending', {
        p_partner_id: commission.affiliate_id,
        p_amount:     commission.commission_amount,
      });

      console.log(`[Affiliate] Clawback applied for commission ${commission.id}`);
    }
  } catch (err) {
    console.error('[Affiliate] Clawback error:', err);
  }
}