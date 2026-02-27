import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
});

/**
 * POST /api/promo/apply
 * 
 * Applies a promo code directly (bypassing Stripe checkout).
 * Used for trial and free_upgrade promo types.
 * 
 * If user has an existing Stripe subscription, it gets cancelled.
 * Tier is set directly in the subscription table.
 * 
 * Body: { code, userType, tier, userId }
 */
export async function POST(request: NextRequest) {
  try {
    const { code, userType, tier, userId } = await request.json();

    if (!code || !userType || !tier || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: code, userType, tier, userId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Validate the promo code
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (promoError || !promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ error: 'This promo code is no longer active' }, { status: 400 });
    }

    // Check dates
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return NextResponse.json({ error: 'This promo code is not yet active' }, { status: 400 });
    }
    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return NextResponse.json({ error: 'This promo code has expired' }, { status: 400 });
    }

    // Check max uses
    if (promo.max_uses && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ error: 'This promo code has reached its usage limit' }, { status: 400 });
    }

    // Check user type
    if (promo.applicable_user_type && promo.applicable_user_type !== 'both' && promo.applicable_user_type !== userType) {
      return NextResponse.json({ error: `This promo code is not available for ${userType} accounts` }, { status: 400 });
    }

    // Check per-user usage
    // Check per-user usage
    // Note: /api/promo/validate may have already inserted a usage record during validation.
    // We delete those "validation-only" records and re-record properly after successful apply.
    const maxPerUser = promo.max_uses_per_user ?? 1;
    const { data: existingUsages } = await supabase
      .from('promo_code_usage')
      .select('id, context')
      .eq('promo_code_id', promo.id)
      .eq('user_id', userId);

    // Count only "apply" context records (not "validate" records)
    const applyUsages = (existingUsages || []).filter(u => 
      u.context && u.context.includes('_billing_apply')
    );

    if (applyUsages.length >= maxPerUser) {
      // This promo was already fully applied before — check if it's still active
      const subTable = userType === 'talent' ? 'talent_subscriptions' : 'employer_subscriptions';
      const subIdCol = userType === 'talent' ? 'talent_id' : 'employer_id';
      const freeTier = userType === 'talent' ? 'profile_only' : 'free';

      const { data: currentSub } = await supabase
        .from(subTable)
        .select('tier')
        .eq(subIdCol, userId)
        .single();

      // Only block if user is currently on the promo-granted tier (not expired yet)
      if (currentSub && currentSub.tier !== freeTier) {
        return NextResponse.json({ error: 'This promo code is already active on your account' }, { status: 400 });
      }
    }

    // Clean up ALL existing usage records for this promo+user (including validate-step records)
    // We'll insert a fresh "apply" record below after successful upgrade
    if (existingUsages && existingUsages.length > 0) {
      await supabase
        .from('promo_code_usage')
        .delete()
        .eq('promo_code_id', promo.id)
        .eq('user_id', userId);
    }

    // Only allow trial and free_upgrade through this endpoint
    if (promo.type !== 'trial' && promo.type !== 'free_upgrade') {
      return NextResponse.json(
        { error: 'This promo code type requires checkout. Use the standard upgrade flow.' },
        { status: 400 }
      );
    }

    // 2. Get the subscription table/column info
    const subscriptionTable = userType === 'talent' ? 'talent_subscriptions' : 'employer_subscriptions';
    const idColumn = userType === 'talent' ? 'talent_id' : 'employer_id';

    // 3. Get current subscription
    const { data: currentSub } = await supabase
      .from(subscriptionTable)
      .select('*')
      .eq(idColumn, userId)
      .single();

    // 4. Cancel existing Stripe subscription if one exists
    if (currentSub?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(currentSub.stripe_subscription_id, {
          prorate: true, // Refund unused portion
        });
        console.log(`Cancelled Stripe subscription ${currentSub.stripe_subscription_id} for ${userType} ${userId}`);
      } catch (stripeError: unknown) {
        const err = stripeError as { message?: string };
        console.error('Failed to cancel Stripe subscription:', err.message);
        // Continue anyway — the subscription might already be cancelled
      }
    }

    // 5. Calculate trial end date if applicable
    let trialEndsAt: string | null = null;
    if (promo.type === 'trial' && promo.trial_days && promo.trial_days > 0) {
      const trialEnd = new Date(now.getTime() + promo.trial_days * 24 * 60 * 60 * 1000);
      trialEndsAt = trialEnd.toISOString();
    }

    // 6. Calculate period end (for free_upgrade, use valid_until if set)
    let periodEnd: string | null = trialEndsAt;
    if (promo.type === 'free_upgrade' && promo.valid_until) {
      periodEnd = promo.valid_until;
    }

    // 7. Update or create subscription with the new tier
    if (currentSub) {
      // Update existing subscription — don't include the id column in the update
      const { error: updateError } = await supabase
        .from(subscriptionTable)
        .update({
          tier: tier,
          status: promo.type === 'trial' ? 'trialing' : 'active',
          stripe_subscription_id: null,
          stripe_price_id: null,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd,
          trial_ends_at: trialEndsAt,
          updated_at: now.toISOString(),
        })
        .eq(idColumn, userId);

      if (updateError) {
        console.error('Failed to update subscription:', updateError);
        return NextResponse.json({ error: `Failed to apply promo code: ${updateError.message}` }, { status: 500 });
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from(subscriptionTable)
        .insert({
          [idColumn]: userId,
          tier: tier,
          status: promo.type === 'trial' ? 'trialing' : 'active',
          stripe_subscription_id: null,
          stripe_customer_id: null,
          stripe_price_id: null,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd,
          trial_ends_at: trialEndsAt,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          ...(userType === 'employer' ? { letters_sent_this_month: 0 } : {}),
        });

      if (insertError) {
        console.error('Failed to create subscription:', insertError);
        return NextResponse.json({ error: `Failed to apply promo code: ${insertError.message}` }, { status: 500 });
      }
    }

    // 8. Record promo usage
    await supabase.from('promo_code_usage').insert({
      promo_code_id: promo.id,
      user_id: userId,
      context: `${userType}_billing_apply`,
    });

    // 9. Increment global usage counter
    await supabase
      .from('promo_codes')
      .update({ current_uses: (promo.current_uses || 0) + 1 })
      .eq('id', promo.id);

    return NextResponse.json({
      success: true,
      tier,
      message: promo.type === 'trial'
        ? `${promo.trial_days}-day trial activated! You've been upgraded to ${tier}.`
        : `Promo applied! You've been upgraded to ${tier}.`,
      trialEndsAt,
      periodEnd,
      stripeSubscriptionCancelled: !!currentSub?.stripe_subscription_id,
    });
  } catch (error) {
    console.error('Promo apply error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}