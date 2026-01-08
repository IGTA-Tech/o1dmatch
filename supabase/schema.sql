-- ============================================
-- O1DMatch Database Schema
-- Complete SQL for Supabase
-- ============================================

-- ============================================
-- 1. ENUM TYPES
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('talent', 'employer', 'agency', 'lawyer', 'admin');

-- Visa status for talent
CREATE TYPE visa_status AS ENUM (
  'not_filed',
  'early_stage',
  'profile_building',
  'strong_candidate',
  'ready_to_file',
  'filed',
  'approved',
  'denied'
);

-- Document status
CREATE TYPE document_status AS ENUM ('pending', 'verified', 'rejected', 'needs_review');

-- AI classification confidence
CREATE TYPE classification_confidence AS ENUM ('high', 'medium', 'low');

-- O-1 criteria types
CREATE TYPE o1_criterion AS ENUM (
  'awards',
  'memberships',
  'published_material',
  'judging',
  'original_contributions',
  'scholarly_articles',
  'critical_role',
  'high_salary'
);

-- Job status
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'filled');

-- Application status
CREATE TYPE application_status AS ENUM (
  'pending',
  'reviewed',
  'shortlisted',
  'letter_sent',
  'rejected',
  'withdrawn'
);

-- Interest letter status
CREATE TYPE letter_status AS ENUM (
  'draft',
  'sent',
  'viewed',
  'accepted',
  'declined',
  'expired'
);

-- Commitment level for interest letters
CREATE TYPE commitment_level AS ENUM (
  'exploratory_interest',
  'intent_to_engage',
  'conditional_offer',
  'firm_commitment',
  'offer_extended'
);

-- Work arrangement types
CREATE TYPE work_arrangement AS ENUM ('on_site', 'hybrid', 'remote', 'flexible');

-- Engagement types
CREATE TYPE engagement_type AS ENUM (
  'full_time',
  'part_time',
  'contract_w2',
  'consulting_1099',
  'project_based'
);

-- Lawyer directory tier
CREATE TYPE lawyer_tier AS ENUM ('basic', 'premium', 'featured');

-- Connection request status
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');

-- ============================================
-- 2. BASE TABLES
-- ============================================

-- Profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'talent',
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TALENT TABLES
-- ============================================

-- Talent profiles
CREATE TABLE talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Identity (hidden until letter accepted)
  candidate_id TEXT UNIQUE, -- Auto-generated: CAND-XXXXXX
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Professional Info
  professional_headline TEXT,
  current_job_title TEXT,
  current_employer TEXT, -- HIDDEN from employers
  industry TEXT,
  years_experience INTEGER,
  seniority TEXT, -- entry, mid, senior, lead, principal, executive
  skills TEXT[] DEFAULT '{}',

  -- Education
  education TEXT, -- high_school, bachelors, masters, phd, other
  university TEXT,
  field_of_study TEXT,
  graduation_year INTEGER,

  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  preferred_locations TEXT[] DEFAULT '{}',

  -- Work Preferences
  work_arrangement work_arrangement,
  engagement_type engagement_type,
  salary_min INTEGER,
  salary_preferred INTEGER,
  available_start TEXT, -- immediately, upon_approval, specific_date
  available_start_date DATE,

  -- Online Profiles (hidden until letter accepted)
  linkedin_url TEXT,
  github_url TEXT,
  google_scholar_url TEXT,
  personal_website TEXT,

  -- Resume
  resume_url TEXT, -- HIDDEN until letter accepted
  resume_filename TEXT,

  -- O-1 Score Data
  o1_score INTEGER DEFAULT 0, -- 0-100
  visa_status visa_status DEFAULT 'not_filed',
  criteria_met o1_criterion[] DEFAULT '{}',
  evidence_summary JSONB DEFAULT '{}',
  score_updated_at TIMESTAMPTZ,

  -- Metrics from external sources
  publications_count INTEGER DEFAULT 0,
  h_index INTEGER DEFAULT 0,
  citations_count INTEGER DEFAULT 0,
  patents_count INTEGER DEFAULT 0,

  -- Profile Settings
  profile_photo_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Talent documents (evidence for O-1 criteria)
CREATE TABLE talent_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID REFERENCES talent_profiles(id) ON DELETE CASCADE,

  -- Document Info
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,

  -- Classification
  criterion o1_criterion,
  auto_classified_criterion o1_criterion,
  classification_confidence classification_confidence,
  classification_notes TEXT,

  -- Status
  status document_status DEFAULT 'pending',

  -- Admin Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. EMPLOYER TABLES
-- ============================================

-- Employer profiles
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Company Info
  company_name TEXT NOT NULL,
  legal_name TEXT,
  dba_name TEXT,
  company_logo_url TEXT,
  company_website TEXT,
  industry TEXT,
  company_size TEXT, -- 1-10, 11-50, etc.
  year_founded INTEGER,
  company_description TEXT,

  -- Address
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',

  -- Authorized Signatory
  signatory_name TEXT NOT NULL,
  signatory_title TEXT,
  signatory_email TEXT NOT NULL,
  signatory_phone TEXT,

  -- Certifications
  is_authorized_signatory BOOLEAN DEFAULT FALSE,
  understands_o1_usage BOOLEAN DEFAULT FALSE,
  agrees_to_terms BOOLEAN DEFAULT FALSE,

  -- Profile Completeness
  profile_complete BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. AGENCY TABLES
-- ============================================

-- Agency profiles
CREATE TABLE agency_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Agency Info
  agency_name TEXT NOT NULL,
  agency_logo_url TEXT,
  agency_website TEXT,
  agency_description TEXT,

  -- Primary Contact
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,

  -- Address
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agency clients (companies the agency posts jobs for)
CREATE TABLE agency_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE,

  -- Client Identity
  show_client_identity BOOLEAN DEFAULT TRUE, -- false = confidential

  -- Company Info (same as employer_profiles)
  company_name TEXT NOT NULL,
  legal_name TEXT,
  company_logo_url TEXT,
  company_website TEXT,
  industry TEXT,
  company_size TEXT,
  company_description TEXT,

  -- Address
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',

  -- Signatory (for interest letters)
  signatory_name TEXT NOT NULL,
  signatory_title TEXT,
  signatory_email TEXT NOT NULL,
  signatory_phone TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. JOB TABLES
-- ============================================

-- Job listings
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Posted by (employer or agency)
  employer_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE,
  agency_client_id UUID REFERENCES agency_clients(id) ON DELETE SET NULL,

  -- Basic Info
  title TEXT NOT NULL,
  department TEXT,
  description TEXT NOT NULL,
  why_o1_required TEXT,

  -- Location & Arrangement
  work_arrangement work_arrangement DEFAULT 'on_site',
  locations TEXT[] DEFAULT '{}',

  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_period TEXT DEFAULT 'year', -- year, month, hour
  salary_negotiable BOOLEAN DEFAULT FALSE,

  -- Engagement
  engagement_type engagement_type DEFAULT 'full_time',
  start_timing TEXT, -- upon_approval, within_30_days, within_90_days, specific_date, flexible
  start_date DATE,

  -- Requirements
  min_score INTEGER DEFAULT 0, -- 0-100
  preferred_criteria o1_criterion[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  min_education TEXT,
  education_preferred_not_required BOOLEAN DEFAULT FALSE,
  min_years_experience INTEGER,

  -- Status
  status job_status DEFAULT 'draft',
  visibility TEXT DEFAULT 'public', -- public, invite_only, featured
  is_featured BOOLEAN DEFAULT FALSE,

  -- Dates
  posted_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,

  -- Metrics
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,

  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Either employer_id or agency_id must be set
  CONSTRAINT job_owner_check CHECK (
    (employer_id IS NOT NULL AND agency_id IS NULL) OR
    (employer_id IS NULL AND agency_id IS NOT NULL)
  )
);

-- ============================================
-- 7. APPLICATION TABLES
-- ============================================

-- Job applications
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
  talent_id UUID REFERENCES talent_profiles(id) ON DELETE CASCADE,

  -- Application Data
  cover_message TEXT,
  attached_documents TEXT[] DEFAULT '{}', -- URLs to documents

  -- Snapshot at time of application
  score_at_application INTEGER,
  criteria_met_at_application o1_criterion[] DEFAULT '{}',

  -- Status
  status application_status DEFAULT 'pending',

  -- Employer Actions
  employer_rating INTEGER, -- 1-5 stars
  employer_notes TEXT,

  -- Dates
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate applications
  UNIQUE(job_id, talent_id)
);

-- ============================================
-- 8. INTEREST LETTER TABLES
-- ============================================

-- Interest letters
CREATE TABLE interest_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  talent_id UUID REFERENCES talent_profiles(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_profiles(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agency_profiles(id),
  agency_client_id UUID REFERENCES agency_clients(id),

  -- Source
  source_type TEXT NOT NULL, -- 'browse' or 'application'
  job_id UUID REFERENCES job_listings(id) ON DELETE SET NULL,
  application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,

  -- Letter Content
  commitment_level commitment_level NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT,

  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_period TEXT DEFAULT 'year',
  salary_negotiable BOOLEAN DEFAULT FALSE,

  -- Work Details
  engagement_type engagement_type,
  start_timing TEXT,
  duration_years INTEGER,
  work_arrangement work_arrangement,
  locations TEXT[] DEFAULT '{}',

  -- Content
  duties_description TEXT NOT NULL,
  why_o1_required TEXT NOT NULL,

  -- Generated Letter
  letter_content TEXT, -- Full generated letter text
  pdf_url TEXT, -- Stored PDF

  -- Status
  status letter_status DEFAULT 'draft',

  -- Response
  talent_response_message TEXT,
  responded_at TIMESTAMPTZ,

  -- Expiry
  expires_at TIMESTAMPTZ,

  -- Snapshot of talent identity (revealed on accept)
  revealed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. LAWYER TABLES
-- ============================================

-- Lawyer profiles
CREATE TABLE lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- Attorney Info
  attorney_name TEXT NOT NULL,
  attorney_title TEXT,
  firm_name TEXT NOT NULL,
  firm_logo_url TEXT,

  -- Bio
  bio TEXT,

  -- Specializations
  specializations TEXT[] DEFAULT '{}', -- tech_ai, sports, arts, founders, sciences, business
  visa_types TEXT[] DEFAULT '{}', -- o1a, o1b, eb1a, p1, h1b

  -- Firm Details
  firm_size TEXT,
  office_location TEXT,
  website_url TEXT,

  -- Contact (only shared after connection accepted)
  contact_email TEXT NOT NULL,
  contact_phone TEXT,

  -- Directory
  tier lawyer_tier DEFAULT 'basic',
  is_active BOOLEAN DEFAULT TRUE,

  -- Metrics
  profile_views INTEGER DEFAULT 0,
  connection_requests INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyer connection requests
CREATE TABLE lawyer_connection_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID REFERENCES lawyer_profiles(id) ON DELETE CASCADE,

  -- Requester
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  requester_type TEXT NOT NULL, -- talent, employer, other

  -- Request Details
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  message TEXT NOT NULL,

  -- If talent, optionally share profile
  share_profile BOOLEAN DEFAULT FALSE,
  talent_profile_id UUID REFERENCES talent_profiles(id),

  -- Status
  status connection_status DEFAULT 'pending',

  -- Response
  lawyer_notes TEXT,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. ADMIN TABLES
-- ============================================

-- Score overrides (admin manual adjustments)
CREATE TABLE score_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID REFERENCES talent_profiles(id) ON DELETE CASCADE,

  -- Override values
  override_score INTEGER, -- Total score override
  criterion_overrides JSONB, -- { criterion: score } overrides

  -- Admin info
  admin_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin notes on users
CREATE TABLE admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT, -- profile, document, job, letter, etc.
  entity_id UUID,
  metadata JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. INDEXES
-- ============================================

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Talent
CREATE INDEX idx_talent_user_id ON talent_profiles(user_id);
CREATE INDEX idx_talent_candidate_id ON talent_profiles(candidate_id);
CREATE INDEX idx_talent_o1_score ON talent_profiles(o1_score DESC);
CREATE INDEX idx_talent_visa_status ON talent_profiles(visa_status);
CREATE INDEX idx_talent_industry ON talent_profiles(industry);
CREATE INDEX idx_talent_is_public ON talent_profiles(is_public);
CREATE INDEX idx_talent_skills ON talent_profiles USING GIN(skills);
CREATE INDEX idx_talent_criteria_met ON talent_profiles USING GIN(criteria_met);

-- Documents
CREATE INDEX idx_documents_talent_id ON talent_documents(talent_id);
CREATE INDEX idx_documents_status ON talent_documents(status);
CREATE INDEX idx_documents_criterion ON talent_documents(criterion);

-- Employers
CREATE INDEX idx_employer_user_id ON employer_profiles(user_id);

-- Agencies
CREATE INDEX idx_agency_user_id ON agency_profiles(user_id);
CREATE INDEX idx_agency_clients_agency_id ON agency_clients(agency_id);

-- Jobs
CREATE INDEX idx_jobs_employer_id ON job_listings(employer_id);
CREATE INDEX idx_jobs_agency_id ON job_listings(agency_id);
CREATE INDEX idx_jobs_status ON job_listings(status);
CREATE INDEX idx_jobs_posted_at ON job_listings(posted_at DESC);
CREATE INDEX idx_jobs_min_score ON job_listings(min_score);

-- Applications
CREATE INDEX idx_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_applications_talent_id ON job_applications(talent_id);
CREATE INDEX idx_applications_status ON job_applications(status);

-- Letters
CREATE INDEX idx_letters_talent_id ON interest_letters(talent_id);
CREATE INDEX idx_letters_employer_id ON interest_letters(employer_id);
CREATE INDEX idx_letters_status ON interest_letters(status);

-- Lawyers
CREATE INDEX idx_lawyers_user_id ON lawyer_profiles(user_id);
CREATE INDEX idx_lawyers_tier ON lawyer_profiles(tier);
CREATE INDEX idx_lawyers_is_active ON lawyer_profiles(is_active);
CREATE INDEX idx_lawyer_connections_lawyer_id ON lawyer_connection_requests(lawyer_id);
CREATE INDEX idx_lawyer_connections_status ON lawyer_connection_requests(status);

-- Activity
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_created_at ON activity_log(created_at DESC);

-- ============================================
-- 12. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_profiles_updated_at BEFORE UPDATE ON talent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talent_documents_updated_at BEFORE UPDATE ON talent_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_profiles_updated_at BEFORE UPDATE ON agency_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_clients_updated_at BEFORE UPDATE ON agency_clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interest_letters_updated_at BEFORE UPDATE ON interest_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lawyer_profiles_updated_at BEFORE UPDATE ON lawyer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lawyer_connection_requests_updated_at BEFORE UPDATE ON lawyer_connection_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_score_overrides_updated_at BEFORE UPDATE ON score_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate candidate_id for talent
CREATE OR REPLACE FUNCTION generate_candidate_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.candidate_id IS NULL THEN
    NEW.candidate_id := 'CAND-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_talent_candidate_id BEFORE INSERT ON talent_profiles
  FOR EACH ROW EXECUTE FUNCTION generate_candidate_id();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'talent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update application count on job when application added/removed
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_listings SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_listings SET applications_count = applications_count - 1 WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_application_count_on_insert
  AFTER INSERT ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

CREATE TRIGGER update_application_count_on_delete
  AFTER DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- TALENT PROFILES POLICIES
CREATE POLICY "Talent can view own profile"
  ON talent_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Talent can update own profile"
  ON talent_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Talent can insert own profile"
  ON talent_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Employers can view public talent profiles (masked)"
  ON talent_profiles FOR SELECT
  USING (
    is_public = TRUE AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('employer', 'agency'))
  );

CREATE POLICY "Admins can view all talent profiles"
  ON talent_profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- TALENT DOCUMENTS POLICIES
CREATE POLICY "Talent can manage own documents"
  ON talent_documents FOR ALL
  USING (
    talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all documents"
  ON talent_documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update documents"
  ON talent_documents FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- EMPLOYER PROFILES POLICIES
CREATE POLICY "Employers can manage own profile"
  ON employer_profiles FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Public can view employer profiles"
  ON employer_profiles FOR SELECT
  USING (TRUE);

-- AGENCY PROFILES POLICIES
CREATE POLICY "Agencies can manage own profile"
  ON agency_profiles FOR ALL
  USING (user_id = auth.uid());

-- AGENCY CLIENTS POLICIES
CREATE POLICY "Agencies can manage own clients"
  ON agency_clients FOR ALL
  USING (
    agency_id IN (SELECT id FROM agency_profiles WHERE user_id = auth.uid())
  );

-- JOB LISTINGS POLICIES
CREATE POLICY "Anyone can view active jobs"
  ON job_listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Employers can manage own jobs"
  ON job_listings FOR ALL
  USING (
    employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Agencies can manage own jobs"
  ON job_listings FOR ALL
  USING (
    agency_id IN (SELECT id FROM agency_profiles WHERE user_id = auth.uid())
  );

-- JOB APPLICATIONS POLICIES
CREATE POLICY "Talent can view own applications"
  ON job_applications FOR SELECT
  USING (
    talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Talent can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (
    talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Talent can delete own applications"
  ON job_applications FOR DELETE
  USING (
    talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
    AND status = 'pending'
  );

CREATE POLICY "Employers can view applications for their jobs"
  ON job_applications FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM job_listings
      WHERE employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Employers can update applications for their jobs"
  ON job_applications FOR UPDATE
  USING (
    job_id IN (
      SELECT id FROM job_listings
      WHERE employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid())
    )
  );

-- INTEREST LETTERS POLICIES
CREATE POLICY "Talent can view letters sent to them"
  ON interest_letters FOR SELECT
  USING (
    talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Talent can respond to letters"
  ON interest_letters FOR UPDATE
  USING (
    talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Employers can view their sent letters"
  ON interest_letters FOR SELECT
  USING (
    employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Employers can create letters"
  ON interest_letters FOR INSERT
  WITH CHECK (
    employer_id IN (SELECT id FROM employer_profiles WHERE user_id = auth.uid())
  );

-- LAWYER PROFILES POLICIES
CREATE POLICY "Anyone can view active lawyer profiles"
  ON lawyer_profiles FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Lawyers can manage own profile"
  ON lawyer_profiles FOR ALL
  USING (user_id = auth.uid());

-- LAWYER CONNECTION REQUESTS POLICIES
CREATE POLICY "Users can create connection requests"
  ON lawyer_connection_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can view own requests"
  ON lawyer_connection_requests FOR SELECT
  USING (requester_id = auth.uid());

CREATE POLICY "Lawyers can view requests to them"
  ON lawyer_connection_requests FOR SELECT
  USING (
    lawyer_id IN (SELECT id FROM lawyer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Lawyers can update requests to them"
  ON lawyer_connection_requests FOR UPDATE
  USING (
    lawyer_id IN (SELECT id FROM lawyer_profiles WHERE user_id = auth.uid())
  );

-- ADMIN TABLES POLICIES
CREATE POLICY "Only admins can access score overrides"
  ON score_overrides FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can access admin notes"
  ON admin_notes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can access activity log"
  ON activity_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- 14. STORAGE BUCKETS
-- ============================================

-- Create storage buckets (run in Supabase dashboard or via API)
-- These are created via Supabase Storage API, not SQL

-- Bucket: avatars (public)
-- Bucket: resumes (private)
-- Bucket: evidence (private)
-- Bucket: logos (public)
-- Bucket: letters (private)

-- ============================================
-- 15. INITIAL DATA (Optional)
-- ============================================

-- Insert default admin user (update with real email after deployment)
-- This should be done after creating the auth user

-- Example: After creating admin user via Supabase Auth
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@o1dmatch.com';
