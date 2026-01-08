// Subscription tier definitions for O1DMatch

export type EmployerTier = 'free' | 'starter' | 'growth' | 'business' | 'enterprise';
export type TalentTier = 'profile_only' | 'starter' | 'active_match' | 'igta_member';

export interface TierLimits {
  activeJobs: number;
  lettersPerMonth: number;
}

export interface EmployerTierConfig {
  id: EmployerTier;
  name: string;
  price: number; // Monthly price in USD
  setupFee: number;
  limits: TierLimits;
  features: string[];
  stripePriceId?: string; // To be filled with actual Stripe price IDs
}

export interface TalentTierConfig {
  id: TalentTier;
  name: string;
  price: number; // Monthly price in USD
  features: string[];
  stripePriceId?: string;
}

// ============================================
// EMPLOYER SUBSCRIPTION TIERS
// ============================================

export const EMPLOYER_TIERS: Record<EmployerTier, EmployerTierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    setupFee: 0,
    limits: {
      activeJobs: 2,
      lettersPerMonth: 5,
    },
    features: [
      '2 active job postings',
      '5 interest letters per month',
      'Browse O-1 talent profiles',
      'Basic company profile',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 25,
    setupFee: 100,
    limits: {
      activeJobs: 5,
      lettersPerMonth: 15,
    },
    features: [
      '5 active job postings',
      '15 interest letters per month',
      'Priority listing in employer directory',
      'Enhanced company profile',
      'Email notifications for new matches',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    price: 49,
    setupFee: 100,
    limits: {
      activeJobs: 15,
      lettersPerMonth: 40,
    },
    features: [
      '15 active job postings',
      '40 interest letters per month',
      'Featured employer badge',
      'Advanced talent search filters',
      'Analytics dashboard',
      'Priority support',
    ],
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 99,
    setupFee: 100,
    limits: {
      activeJobs: 50,
      lettersPerMonth: 100,
    },
    features: [
      '50 active job postings',
      '100 interest letters per month',
      'Dedicated account manager',
      'Custom company branding',
      'API access',
      'Bulk letter sending',
      'Team member accounts',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    setupFee: 0,
    limits: {
      activeJobs: Infinity,
      lettersPerMonth: Infinity,
    },
    features: [
      'Unlimited job postings',
      'Unlimited interest letters',
      'White-label options',
      'Custom integrations',
      'Dedicated success manager',
      'SLA guarantee',
      'Custom contract terms',
    ],
  },
};

// ============================================
// TALENT SUBSCRIPTION TIERS
// ============================================

export const TALENT_TIERS: Record<TalentTier, TalentTierConfig> = {
  profile_only: {
    id: 'profile_only',
    name: 'Profile Only',
    price: 0,
    features: [
      'Create and maintain profile',
      'Upload evidence documents',
      'Get AI O-1 score assessment',
      'Browse job listings',
      'View employer profiles',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 250,
    features: [
      'All Profile Only features',
      'Receive interest letters from employers',
      'Apply to job postings',
      'Appear in employer talent search',
      // 'Direct messaging with employers',
      'Email notifications for opportunities',
    ],
  },
  active_match: {
    id: 'active_match',
    name: 'Active Match',
    price: 500,
    features: [
      'All Starter features',
      'Priority visibility in search results',
      'Active matching with employers on/off platform',
      'Dedicated matching specialist',
      'Resume/profile optimization review',
      'Interview preparation support',
      'Priority customer support',
    ],
  },
  igta_member: {
    id: 'igta_member',
    name: 'Innovative Automations Member',
    price: 0,
    features: [
      'All Active Match features included FREE',
      'Verified Innovative Automations program participant badge',
      'Direct integration with Innovative Automations case management',
      'Priority access to new features',
      'Exclusive Innovative Automations member events',
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getEmployerTierLimits(tier: EmployerTier): TierLimits {
  return EMPLOYER_TIERS[tier].limits;
}

export function canEmployerPostJob(tier: EmployerTier, currentActiveJobs: number): boolean {
  const limits = getEmployerTierLimits(tier);
  return currentActiveJobs < limits.activeJobs;
}

export function canEmployerSendLetter(tier: EmployerTier, lettersSentThisMonth: number): boolean {
  const limits = getEmployerTierLimits(tier);
  return lettersSentThisMonth < limits.lettersPerMonth;
}

export function getTalentCanReceiveLetters(tier: TalentTier): boolean {
  return tier !== 'profile_only';
}

export function getTalentCanApply(tier: TalentTier): boolean {
  return tier !== 'profile_only';
}

export function isIGTAMember(tier: TalentTier): boolean {
  return tier === 'igta_member';
}

// Calculate remaining resources
export function getEmployerRemainingJobs(tier: EmployerTier, currentActiveJobs: number): number {
  const limits = getEmployerTierLimits(tier);
  if (limits.activeJobs === Infinity) return Infinity;
  return Math.max(0, limits.activeJobs - currentActiveJobs);
}

export function getEmployerRemainingLetters(tier: EmployerTier, lettersSentThisMonth: number): number {
  const limits = getEmployerTierLimits(tier);
  if (limits.lettersPerMonth === Infinity) return Infinity;
  return Math.max(0, limits.lettersPerMonth - lettersSentThisMonth);
}
