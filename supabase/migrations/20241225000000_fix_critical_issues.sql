-- Migration: Fix Critical Issues
-- Date: 2024-12-25
-- Description: Add missing columns and tables identified in audit

-- =============================================
-- 1. Add welcome_email_sent column to profiles
-- =============================================
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- =============================================
-- 2. Create employer_subscriptions table
-- =============================================
CREATE TABLE IF NOT EXISTS employer_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES employer_profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'growth', 'business', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    -- Usage tracking (resets monthly)
    jobs_posted_this_month INTEGER DEFAULT 0,
    letters_sent_this_month INTEGER DEFAULT 0,
    usage_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employer_id)
);

-- =============================================
-- 3. Create talent_subscriptions table
-- =============================================
CREATE TABLE IF NOT EXISTS talent_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    talent_id UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    tier TEXT NOT NULL DEFAULT 'profile_only' CHECK (tier IN ('profile_only', 'starter', 'active_match', 'igta_member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    -- Usage tracking
    applications_this_month INTEGER DEFAULT 0,
    usage_reset_date DATE DEFAULT CURRENT_DATE,
    -- IGTA member specific
    igta_verified BOOLEAN DEFAULT FALSE,
    igta_verification_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(talent_id)
);

-- =============================================
-- 4. Create indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_employer_id ON employer_subscriptions(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_subscriptions_stripe_customer_id ON employer_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_talent_subscriptions_talent_id ON talent_subscriptions(talent_id);
CREATE INDEX IF NOT EXISTS idx_talent_subscriptions_stripe_customer_id ON talent_subscriptions(stripe_customer_id);

-- Additional indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_interest_letters_revealed_at ON interest_letters(revealed_at);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_signwell_events_event_type ON signwell_events(event_type);

-- =============================================
-- 5. Add updated_at trigger for subscription tables
-- =============================================
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employer_subscriptions_updated_at ON employer_subscriptions;
CREATE TRIGGER update_employer_subscriptions_updated_at
    BEFORE UPDATE ON employer_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

DROP TRIGGER IF EXISTS update_talent_subscriptions_updated_at ON talent_subscriptions;
CREATE TRIGGER update_talent_subscriptions_updated_at
    BEFORE UPDATE ON talent_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- =============================================
-- 6. RLS Policies for subscription tables
-- =============================================

-- Enable RLS
ALTER TABLE employer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_subscriptions ENABLE ROW LEVEL SECURITY;

-- Employer subscription policies
CREATE POLICY "Employers can view own subscription" ON employer_subscriptions
    FOR SELECT USING (
        employer_id IN (
            SELECT id FROM employer_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all employer subscriptions" ON employer_subscriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Service role can manage employer subscriptions" ON employer_subscriptions
    FOR ALL USING (true)
    WITH CHECK (true);

-- Talent subscription policies
CREATE POLICY "Talents can view own subscription" ON talent_subscriptions
    FOR SELECT USING (
        talent_id IN (
            SELECT id FROM talent_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all talent subscriptions" ON talent_subscriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Service role can manage talent subscriptions" ON talent_subscriptions
    FOR ALL USING (true)
    WITH CHECK (true);

-- =============================================
-- 7. Create default subscriptions for existing users
-- =============================================

-- Create free subscriptions for existing employers without one
INSERT INTO employer_subscriptions (employer_id, tier, status)
SELECT id, 'free', 'active'
FROM employer_profiles
WHERE id NOT IN (SELECT employer_id FROM employer_subscriptions)
ON CONFLICT (employer_id) DO NOTHING;

-- Create free subscriptions for existing talents without one
INSERT INTO talent_subscriptions (talent_id, tier, status)
SELECT id, 'profile_only', 'active'
FROM talent_profiles
WHERE id NOT IN (SELECT talent_id FROM talent_subscriptions)
ON CONFLICT (talent_id) DO NOTHING;

-- =============================================
-- 8. Function to auto-create subscription on profile creation
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_employer_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO employer_subscriptions (employer_id, tier, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (employer_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_new_talent_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO talent_subscriptions (talent_id, tier, status)
    VALUES (NEW.id, 'profile_only', 'active')
    ON CONFLICT (talent_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for auto-creating subscriptions
DROP TRIGGER IF EXISTS on_employer_profile_created ON employer_profiles;
CREATE TRIGGER on_employer_profile_created
    AFTER INSERT ON employer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_employer_profile();

DROP TRIGGER IF EXISTS on_talent_profile_created ON talent_profiles;
CREATE TRIGGER on_talent_profile_created
    AFTER INSERT ON talent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_talent_profile();
