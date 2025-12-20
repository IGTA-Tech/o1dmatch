-- O1DMatch Database Setup
-- Run this in Supabase SQL Editor to fix "Database error saving new user"

-- ============================================
-- 1. CREATE PROFILES TABLE (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'talent' CHECK (role IN ('talent', 'employer', 'agency', 'lawyer', 'admin')),
  avatar_url TEXT,

  -- Talent-specific fields
  headline TEXT,
  bio TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  o1_score INTEGER DEFAULT 0,
  o1_categories_met INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,

  -- Employer-specific fields
  company_name TEXT,
  company_website TEXT,
  company_size TEXT,
  industry TEXT,

  -- Lawyer-specific fields
  law_firm TEXT,
  bar_number TEXT,
  practice_areas TEXT[] DEFAULT '{}',
  years_experience INTEGER,

  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow anyone to view public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. CREATE TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'talent')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the signup
  RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to run on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. GRANT NECESSARY PERMISSIONS
-- ============================================

-- Allow authenticated users to use profiles table
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Allow service role full access
GRANT ALL ON public.profiles TO service_role;

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_o1_score ON profiles(o1_score DESC) WHERE role = 'talent';

-- ============================================
-- 6. UPDATE FUNCTION FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. VERIFY SETUP
-- ============================================

-- Test the trigger exists
SELECT tgname, tgrelid::regclass, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Show profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
