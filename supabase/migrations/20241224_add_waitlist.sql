-- ============================================
-- Waitlist Feature Migration
-- O1DMatch Pre-launch Signup System
-- ============================================

-- Waitlist user type
CREATE TYPE waitlist_user_type AS ENUM ('talent', 'employer', 'agency', 'lawyer');

-- Waitlist status
CREATE TYPE waitlist_status AS ENUM ('pending', 'approved', 'invited', 'converted');

-- ============================================
-- WAITLIST TABLE
-- ============================================

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User Type
  user_type waitlist_user_type NOT NULL,

  -- Common Fields
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,

  -- Talent-specific fields
  current_job_title TEXT,
  current_employer TEXT,
  years_experience INTEGER,
  industry TEXT,
  linkedin_url TEXT,
  visa_status TEXT, -- current visa status if any
  target_timeline TEXT, -- when they plan to file O-1

  -- Employer-specific fields
  company_name TEXT,
  company_website TEXT,
  company_size TEXT,
  hiring_timeline TEXT, -- when they plan to hire O-1 talent
  roles_count INTEGER, -- how many O-1 roles they're looking to fill

  -- Agency-specific fields
  agency_name TEXT,
  agency_website TEXT,
  clients_count INTEGER, -- how many clients they represent

  -- Lawyer-specific fields
  firm_name TEXT,
  bar_number TEXT,
  o1_cases_handled INTEGER, -- approx number of O-1 cases handled
  specializations TEXT[], -- areas of focus

  -- Common additional fields
  referral_source TEXT, -- how they heard about O1DMatch
  notes TEXT, -- any additional info they want to share

  -- Promo/referral tracking
  promo_code TEXT,
  referred_by UUID REFERENCES waitlist(id),

  -- Status tracking
  status waitlist_status DEFAULT 'pending',
  priority_score INTEGER DEFAULT 0, -- for ranking/prioritizing invites

  -- Admin fields
  admin_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_user_id UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique email per user type
  UNIQUE(email, user_type)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_user_type ON waitlist(user_type);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_priority_score ON waitlist(priority_score DESC);
CREATE INDEX idx_waitlist_promo_code ON waitlist(promo_code);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Public can insert into waitlist (signup)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (TRUE);

-- Only admins can view waitlist
CREATE POLICY "Admins can view waitlist"
  ON waitlist FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can update waitlist
CREATE POLICY "Admins can update waitlist"
  ON waitlist FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Only admins can delete from waitlist
CREATE POLICY "Admins can delete from waitlist"
  ON waitlist FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to calculate priority score based on user profile
CREATE OR REPLACE FUNCTION calculate_waitlist_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- Base score
  NEW.priority_score := 0;

  -- Talent scoring
  IF NEW.user_type = 'talent' THEN
    -- More experience = higher priority
    IF NEW.years_experience >= 10 THEN
      NEW.priority_score := NEW.priority_score + 30;
    ELSIF NEW.years_experience >= 5 THEN
      NEW.priority_score := NEW.priority_score + 20;
    ELSIF NEW.years_experience >= 2 THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;

    -- Has LinkedIn = more serious
    IF NEW.linkedin_url IS NOT NULL THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;

    -- Faster timeline = higher priority
    IF NEW.target_timeline = 'immediately' OR NEW.target_timeline = 'within_30_days' THEN
      NEW.priority_score := NEW.priority_score + 20;
    ELSIF NEW.target_timeline = 'within_90_days' THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;
  END IF;

  -- Employer scoring
  IF NEW.user_type = 'employer' THEN
    -- Larger company = higher priority
    IF NEW.company_size = '500+' OR NEW.company_size = '1000+' THEN
      NEW.priority_score := NEW.priority_score + 30;
    ELSIF NEW.company_size = '100-499' THEN
      NEW.priority_score := NEW.priority_score + 20;
    ELSIF NEW.company_size = '50-99' THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;

    -- More roles = higher priority
    IF NEW.roles_count >= 5 THEN
      NEW.priority_score := NEW.priority_score + 20;
    ELSIF NEW.roles_count >= 2 THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;

    -- Has website = more legitimate
    IF NEW.company_website IS NOT NULL THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;
  END IF;

  -- Agency scoring
  IF NEW.user_type = 'agency' THEN
    -- More clients = higher priority
    IF NEW.clients_count >= 10 THEN
      NEW.priority_score := NEW.priority_score + 30;
    ELSIF NEW.clients_count >= 5 THEN
      NEW.priority_score := NEW.priority_score + 20;
    ELSIF NEW.clients_count >= 2 THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;
  END IF;

  -- Lawyer scoring
  IF NEW.user_type = 'lawyer' THEN
    -- More O-1 cases = higher priority
    IF NEW.o1_cases_handled >= 50 THEN
      NEW.priority_score := NEW.priority_score + 30;
    ELSIF NEW.o1_cases_handled >= 20 THEN
      NEW.priority_score := NEW.priority_score + 20;
    ELSIF NEW.o1_cases_handled >= 5 THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;

    -- Has bar number = verified
    IF NEW.bar_number IS NOT NULL THEN
      NEW.priority_score := NEW.priority_score + 10;
    END IF;
  END IF;

  -- Bonus for referrals
  IF NEW.referred_by IS NOT NULL THEN
    NEW.priority_score := NEW.priority_score + 15;
  END IF;

  -- Bonus for promo codes (could indicate partnership)
  IF NEW.promo_code IS NOT NULL THEN
    NEW.priority_score := NEW.priority_score + 10;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_waitlist_priority_trigger
  BEFORE INSERT OR UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION calculate_waitlist_priority();

-- ============================================
-- STATS VIEW (for admin dashboard)
-- ============================================

CREATE VIEW waitlist_stats AS
SELECT
  user_type,
  status,
  COUNT(*) as count,
  AVG(priority_score) as avg_priority,
  MIN(created_at) as earliest_signup,
  MAX(created_at) as latest_signup
FROM waitlist
GROUP BY user_type, status;
