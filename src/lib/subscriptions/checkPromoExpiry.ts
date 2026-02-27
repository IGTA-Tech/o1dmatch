import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Checks if a user's promo-code-granted subscription has expired.
 * If expired, downgrades to the free tier.
 *
 * Call this from dashboard page loads (server-side).
 *
 * Logic:
 * 1. Primary check: trial_ends_at or current_period_end on subscription
 *    - If either date is in the past and no Stripe subscription → expired
 * 2. Secondary check: promo_code_usage records for reason details
 *    - Provides a human-readable reason for the downgrade
 *
 * Returns: { downgraded: boolean, reason?: string }
 */
export async function checkPromoExpiry(
    supabase: SupabaseClient,
    userId: string,
    userType: 'talent' | 'employer'
): Promise<{ downgraded: boolean; reason?: string }> {
    const subscriptionTable =
        userType === 'talent' ? 'talent_subscriptions' : 'employer_subscriptions';
    const idColumn = userType === 'talent' ? 'talent_id' : 'employer_id';
    const freeTier = userType === 'talent' ? 'profile_only' : 'free';

    try {
        console.log(`userId => ${userId}`);
        // 1. Get current subscription
        const { data: subscription, error: subError } = await supabase
            .from(subscriptionTable)
            .select('tier, status, stripe_subscription_id, trial_ends_at, current_period_end')
            .eq(idColumn, userId)
            .single();

        // No subscription or already free — nothing to do
        if (subError || !subscription || subscription.tier === freeTier) {
            return { downgraded: false };
        }

        // If user has an active Stripe subscription, Stripe handles expiry — skip
        if (subscription.stripe_subscription_id) {
            return { downgraded: false };
        }

        const now = new Date();

        // 2. PRIMARY CHECK: Look at subscription dates directly
        //    If status is 'trialing' and trial_ends_at is past → expired
        //    If current_period_end is past → expired
        let isExpired = false;
        let reason = '';

        if (subscription.status === 'trialing' && subscription.trial_ends_at) {
            const trialEnd = new Date(subscription.trial_ends_at);
            if (now > trialEnd) {
                isExpired = true;
                reason = `Your free trial expired on ${trialEnd.toLocaleDateString()}.`;
            }
        }

        if (!isExpired && subscription.current_period_end) {
            const periodEnd = new Date(subscription.current_period_end);
            if (now > periodEnd) {
                isExpired = true;
                reason = `Your promotional plan expired on ${periodEnd.toLocaleDateString()}.`;
            }
        }

        // 3. If expired, try to get promo details for a better reason message, then downgrade
        if (isExpired) {
            try {
                const { data: usages } = await supabase
                    .from('promo_code_usage')
                    .select(`
            used_at,
            promo_codes (
              code,
              type,
              trial_days
            )
          `)
                    .eq('user_id', userId)
                    .order('used_at', { ascending: false })
                    .limit(1);

                if (usages && usages.length > 0) {
                    const promo = usages[0].promo_codes as unknown as {
                        code: string;
                        type: string;
                        trial_days: number | null;
                    };

                    if (promo) {
                        if (promo.type === 'trial' && promo.trial_days) {
                            reason = `Trial period of ${promo.trial_days} day(s) for code "${promo.code}" has expired.`;
                        } else {
                            reason = `Promo code "${promo.code}" has expired.`;
                        }
                    }
                }
            } catch {
                // Promo lookup failed — use the generic reason from above
            }

            // Downgrade to free tier
            const { error: updateError } = await supabase
                .from(subscriptionTable)
                .update({
                    tier: freeTier,
                    status: 'active',
                    trial_ends_at: null,
                    current_period_end: null,
                    updated_at: new Date().toISOString(),
                })
                .eq(idColumn, userId);

            if (updateError) {
                console.error(`Failed to downgrade ${userType} ${userId}:`, updateError);
                return { downgraded: false };
            }

            console.log(`Downgraded ${userType} ${userId} to ${freeTier}: ${reason}`);
            return { downgraded: true, reason };
        }

        // 4. CHECK: Was the promo deactivated by admin? (dates not expired but promo turned off)
        try {
            const { data: usages } = await supabase
                .from('promo_code_usage')
                .select(`promo_codes (
                            code,
                            is_active
                        )`)
                .eq('user_id', userId)
                .order('used_at', { ascending: false })
                .limit(1);

            if (usages && usages.length > 0) {
                const promo = usages[0].promo_codes as unknown as {
                    code: string;
                    is_active: boolean;
                };

                if (promo && !promo.is_active) {
                    const { error: updateError } = await supabase
                        .from(subscriptionTable)
                        .update({
                            tier: freeTier,
                            status: 'active',
                            trial_ends_at: null,
                            current_period_end: null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq(idColumn, userId);

                    if (!updateError) {
                        const deactivatedReason = `Promo code "${promo.code}" has been deactivated.`;
                        console.log(`Downgraded ${userType} ${userId} to ${freeTier}: ${deactivatedReason}`);
                        return { downgraded: true, reason: deactivatedReason };
                    }
                }
            }
        } catch {
            // Promo lookup failed — skip deactivation check
        }

        return { downgraded: false };
    } catch (err) {
        console.error('checkPromoExpiry error:', err);
        return { downgraded: false };
    }
}