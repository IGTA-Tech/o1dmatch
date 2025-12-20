-- O1DMatch Subscription Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- EMPLOYER SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS employer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'growth', 'business', 'enterprise')),

  -- Stripe integration
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),

  -- Subscription status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'paused')),

  -- Trial/Promo
  trial_ends_at TIMESTAMPTZ,
  promo_code_id UUID REFERENCES promo_codes(id),

  -- Billing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  setup_fee_paid BOOLEAN DEFAULT FALSE,

  -- Usage tracking (reset monthly)
  letters_sent_this_month INTEGER DEFAULT 0,
  letters_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(employer_id)
);

-- ============================================
-- TALENT SUBSCRIPTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS talent_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'profile_only' CHECK (tier IN ('profile_only', 'starter', 'active_match', 'igta_member')),

  -- Stripe integration
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),

  -- Subscription status
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'paused')),

  -- IGTA Member verification
  igta_member_verified BOOLEAN DEFAULT FALSE,
  igta_verification_code VARCHAR(100),
  igta_verified_at TIMESTAMPTZ,

  -- Billing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(talent_id)
);

-- ============================================
-- PROMO CODES (for trial periods, discounts, IGTA verification)
-- ============================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('trial', 'discount', 'igta_verification', 'free_upgrade')),

  -- What does this code do?
  description TEXT,

  -- Trial: skip credit card for X days
  trial_days INTEGER DEFAULT 0,

  -- Discount: percentage off (0-100)
  discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),

  -- IGTA verification: grants igta_member tier
  grants_igta_member BOOLEAN DEFAULT FALSE,

  -- Which tier does this apply to?
  applicable_tier VARCHAR(20),
  applicable_user_type VARCHAR(20) CHECK (applicable_user_type IN ('employer', 'talent', 'both')),

  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,

  -- Validity period
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROMO CODE REDEMPTIONS (track who used what)
-- ============================================

CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('employer', 'talent')),
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(promo_code_id, user_id)
);

-- ============================================
-- USAGE LOGS (for analytics and limit enforcement)
-- ============================================

CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('employer', 'talent')),
  action_type VARCHAR(50) NOT NULL, -- 'job_post', 'letter_sent', 'letter_received', 'profile_view', etc.
  resource_id UUID, -- Optional: ID of the job, letter, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employer_subs_employer ON employer_subscriptions(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_subs_stripe_customer ON employer_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_employer_subs_status ON employer_subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_talent_subs_talent ON talent_subscriptions(talent_id);
CREATE INDEX IF NOT EXISTS idx_talent_subs_stripe_customer ON talent_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_talent_subs_status ON talent_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_talent_subs_igta ON talent_subscriptions(igta_member_verified) WHERE igta_member_verified = TRUE;

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Employers can only see their own subscription
CREATE POLICY employer_subs_self ON employer_subscriptions
  FOR ALL USING (employer_id = auth.uid());

-- Talent can only see their own subscription
CREATE POLICY talent_subs_self ON talent_subscriptions
  FOR ALL USING (talent_id = auth.uid());

-- Anyone can read active promo codes (to validate them)
CREATE POLICY promo_codes_read ON promo_codes
  FOR SELECT USING (is_active = TRUE);

-- Users can see their own redemptions
CREATE POLICY redemptions_self ON promo_code_redemptions
  FOR SELECT USING (user_id = auth.uid());

-- Users can see their own usage logs
CREATE POLICY usage_logs_self ON usage_logs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to reset monthly letter counts (run via cron)
CREATE OR REPLACE FUNCTION reset_monthly_letter_counts()
RETURNS void AS $$
BEGIN
  UPDATE employer_subscriptions
  SET letters_sent_this_month = 0,
      letters_reset_at = NOW(),
      updated_at = NOW()
  WHERE letters_reset_at < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if employer can send letter
CREATE OR REPLACE FUNCTION can_employer_send_letter(p_employer_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier VARCHAR(20);
  v_letters_sent INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT tier, letters_sent_this_month INTO v_tier, v_letters_sent
  FROM employer_subscriptions
  WHERE employer_id = p_employer_id AND status = 'active';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get limit based on tier
  v_limit := CASE v_tier
    WHEN 'free' THEN 5
    WHEN 'starter' THEN 15
    WHEN 'growth' THEN 40
    WHEN 'business' THEN 100
    WHEN 'enterprise' THEN 999999
    ELSE 0
  END;

  RETURN v_letters_sent < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment letter count
CREATE OR REPLACE FUNCTION increment_letter_count(p_employer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE employer_subscriptions
  SET letters_sent_this_month = letters_sent_this_month + 1,
      updated_at = NOW()
  WHERE employer_id = p_employer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE PROMO CODES (for testing)
-- ============================================

-- IGTA client verification codes
INSERT INTO promo_codes (code, type, description, grants_igta_member, applicable_user_type, is_active)
VALUES
  ('IGTA-MEMBER-2024', 'igta_verification', 'IGTA O-1 program client verification', TRUE, 'talent', TRUE),
  ('IGTA-VIP-ACCESS', 'igta_verification', 'IGTA VIP client access', TRUE, 'talent', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 90-day trial for employers (skip credit card)
INSERT INTO promo_codes (code, type, description, trial_days, applicable_user_type, applicable_tier, is_active)
VALUES
  ('EMPLOYER-TRIAL-90', 'trial', '90-day free trial for employers', 90, 'employer', 'starter', TRUE),
  ('LAUNCH-SPECIAL', 'trial', 'Launch special - 90 day trial', 90, 'both', NULL, TRUE)
ON CONFLICT (code) DO NOTHING;
