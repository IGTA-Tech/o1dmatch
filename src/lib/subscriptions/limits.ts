import { createClient } from '@/lib/supabase/server';
import { EMPLOYER_TIERS, EmployerTier, TalentTier } from './tiers';

export interface UsageLimits {
  canPostJob: boolean;
  canSendLetter: boolean;
  activeJobs: number;
  maxActiveJobs: number;
  lettersSentThisMonth: number;
  maxLettersPerMonth: number;
  tier: EmployerTier;
  status: string;
}

export async function getEmployerUsageLimits(userId: string): Promise<UsageLimits> {
  const supabase = await createClient();

  // Get employer subscription
  const { data: subscription } = await supabase
    .from('employer_subscriptions')
    .select('*')
    .eq('employer_id', userId)
    .single();

  // Default to free tier if no subscription
  const tier: EmployerTier = (subscription?.tier as EmployerTier) || 'free';
  const tierConfig = EMPLOYER_TIERS[tier];
  const status = subscription?.status || 'active';

  // Get active job count
  const { count: activeJobs } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })
    .eq('employer_id', userId)
    .eq('status', 'active');

  const lettersSentThisMonth = subscription?.letters_sent_this_month || 0;

  const canPostJob =
    status === 'active' &&
    (activeJobs || 0) < tierConfig.limits.activeJobs;

  const canSendLetter =
    status === 'active' &&
    lettersSentThisMonth < tierConfig.limits.lettersPerMonth;

  return {
    canPostJob,
    canSendLetter,
    activeJobs: activeJobs || 0,
    maxActiveJobs: tierConfig.limits.activeJobs,
    lettersSentThisMonth,
    maxLettersPerMonth: tierConfig.limits.lettersPerMonth,
    tier,
    status,
  };
}

export async function incrementLetterCount(userId: string): Promise<void> {
  const supabase = await createClient();

  // First check if subscription exists
  const { data: existing } = await supabase
    .from('employer_subscriptions')
    .select('id, letters_sent_this_month')
    .eq('employer_id', userId)
    .single();

  if (existing) {
    // Update existing subscription
    await supabase
      .from('employer_subscriptions')
      .update({
        letters_sent_this_month: (existing.letters_sent_this_month || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('employer_id', userId);
  } else {
    // Create new subscription with free tier
    await supabase
      .from('employer_subscriptions')
      .insert({
        employer_id: userId,
        tier: 'free',
        status: 'active',
        letters_sent_this_month: 1,
      });
  }
}

export async function checkTalentCanReceiveLetters(talentId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from('talent_subscriptions')
    .select('tier, status')
    .eq('talent_id', talentId)
    .single();

  if (!subscription) {
    // No subscription = profile_only tier, cannot receive letters
    return false;
  }

  const tier = subscription.tier as TalentTier;
  const status = subscription.status;

  // Can receive letters if subscribed (starter, active_match, or igta_member) and active
  return (
    status === 'active' &&
    ['starter', 'active_match', 'igta_member'].includes(tier)
  );
}

export async function ensureEmployerSubscription(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('employer_subscriptions')
    .select('id')
    .eq('employer_id', userId)
    .single();

  if (!existing) {
    await supabase
      .from('employer_subscriptions')
      .insert({
        employer_id: userId,
        tier: 'free',
        status: 'active',
        letters_sent_this_month: 0,
      });
  }
}

export async function ensureTalentSubscription(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('talent_subscriptions')
    .select('id')
    .eq('talent_id', userId)
    .single();

  if (!existing) {
    await supabase
      .from('talent_subscriptions')
      .insert({
        talent_id: userId,
        tier: 'profile_only',
        status: 'active',
      });
  }
}
