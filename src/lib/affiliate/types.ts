// src/lib/affiliate/types.ts
// ============================================================
// Affiliate System — TypeScript Types
// ============================================================

export type AffiliatePartnerType   = 'attorney' | 'agency' | 'employer'
export type AffiliatePartnerStatus = 'pending' | 'active' | 'suspended' | 'inactive'
export type AffiliateReferralStatus = 'clicked' | 'signed_up' | 'converted' | 'canceled'
export type AffiliateCommissionStatus = 'pending' | 'approved' | 'paid' | 'clawback'
export type AffiliatePayoutStatus  = 'pending' | 'paid' | 'canceled'

export interface AffiliatePartner {
  id: string
  user_id: string
  partner_type: AffiliatePartnerType
  affiliate_code: string
  commission_rate: number
  status: AffiliatePartnerStatus
  total_referrals: number
  total_conversions: number
  total_earned: number
  total_pending: number
  total_paid: number
  payout_email: string | null
  payout_method: string | null
  w9_required: boolean
  w9_collected: boolean
  yearly_earnings: number
  requires_1099: boolean
  notes: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateReferral {
  id: string
  partner_id: string
  affiliate_code: string
  referred_user_id: string | null
  stripe_subscription_id: string | null
  subscription_tier: string | null
  user_role: string | null
  click_at: string
  signed_up_at: string | null
  converted_at: string | null
  status: AffiliateReferralStatus
  created_at: string
  updated_at: string
}

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  referral_id: string | null
  referred_user_id: string | null
  stripe_invoice_id: string | null
  stripe_sub_id: string | null
  gross_amount: number
  commission_rate: number
  commission_amount: number
  status: AffiliateCommissionStatus
  clawback_until: string | null
  approved_at: string | null
  approved_by: string | null
  paid_at: string | null
  payout_id: string | null
  payout_reference: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AffiliatePayout {
  id: string
  partner_id: string
  amount: number
  period_start: string
  period_end: string
  status: AffiliatePayoutStatus
  paid_date: string | null
  payout_reference: string | null
  payout_method: string | null
  payout_email: string | null
  tax_year: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Constants ───────────────────────────────────────────────
export const AFFILIATE_COMMISSION_RATE    = 0.15   // 15%
export const ATTRIBUTION_WINDOW_DAYS      = 30
export const CLAWBACK_PERIOD_DAYS         = 30
export const MINIMUM_PAYOUT_AMOUNT        = 50
export const TAX_1099_THRESHOLD           = 600

export const AFFILIATE_STORAGE_KEY        = 'affiliate_ref'
export const AFFILIATE_CLICK_STORAGE_KEY  = 'affiliate_ref_click'
export const AFFILIATE_COOKIE_MAX_AGE     = ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60

// ─── Commission examples for UI display ──────────────────────
export const COMMISSION_EXAMPLES = [
  { plan: 'Talent — Starter',       price: 250, role: 'talent' },
  { plan: 'Talent — Active Match',  price: 500, role: 'talent' },
  { plan: 'Employer — Starter',     price: 25,  role: 'employer', note: 'subscription only' },
]

export function calcCommission(amount: number, rate = AFFILIATE_COMMISSION_RATE): number {
  return Math.round(amount * rate * 100) / 100
}

export function isWithinAttributionWindow(clickAt: string): boolean {
  const diffMs   = Date.now() - new Date(clickAt).getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= ATTRIBUTION_WINDOW_DAYS
}