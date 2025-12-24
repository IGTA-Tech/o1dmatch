-- ============================================
-- WAITLIST MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create waitlist category enum
CREATE TYPE waitlist_category AS ENUM ('talent', 'employer', 'agency', 'lawyer');

-- 2. Create waitlist table
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Common fields
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  category waitlist_category NOT NULL,

  -- Queue position (auto-assigned per category)
  queue_position INTEGER,

  -- Talent-specific fields
  primary_field TEXT,
  current_visa_status TEXT,
  biggest_challenge TEXT,
  timeline_urgency TEXT,

  -- Employer-specific fields
  company_name TEXT,
  job_title TEXT,
  company_size TEXT,
  industry TEXT,
  hiring_volume TEXT,

  -- Agency-specific fields
  agency_name TEXT,
  agency_size TEXT,
  annual_placements TEXT,
  international_experience BOOLEAN,
  primary_industries TEXT[],
  client_demand TEXT,

  -- Lawyer-specific fields
  law_firm TEXT,
  bar_state TEXT,
  years_experience TEXT,
  monthly_o1_cases TEXT,
  specializations TEXT[],
  acquisition_challenge TEXT,
  office_location TEXT,

  -- Tracking
  signup_source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Status
  status TEXT DEFAULT 'active',
  converted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one email per category
  UNIQUE(email, category)
);

-- 3. Create indexes
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_category ON waitlist(category);
CREATE INDEX idx_waitlist_queue_position ON waitlist(category, queue_position);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_status ON waitlist(status);

-- 4. Function to auto-assign queue position per category
CREATE OR REPLACE FUNCTION assign_waitlist_queue_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the next queue position for this category
  SELECT COALESCE(MAX(queue_position), 0) + 1
  INTO NEW.queue_position
  FROM waitlist
  WHERE category = NEW.category;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger to assign queue position on insert
CREATE TRIGGER assign_queue_position_on_insert
  BEFORE INSERT ON waitlist
  FOR EACH ROW EXECUTE FUNCTION assign_waitlist_queue_position();

-- 6. Apply updated_at trigger to waitlist
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable RLS on waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for waitlist (allow public inserts, admin reads)
CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view all waitlist entries"
  ON waitlist FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update waitlist entries"
  ON waitlist FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Done! Verify by running:
-- SELECT * FROM waitlist LIMIT 1;
