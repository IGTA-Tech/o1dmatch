-- Migration: Add welcome_email_sent column to profiles
-- Description: Tracks whether the welcome email has been sent to users

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN profiles.welcome_email_sent IS 'Tracks if welcome email was sent on first login';
