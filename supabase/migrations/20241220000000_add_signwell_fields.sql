-- Migration: Add SignWell e-signature fields to interest_letters
-- Date: 2024-12-20

-- Add SignWell columns to interest_letters
ALTER TABLE interest_letters
  ADD COLUMN IF NOT EXISTS signwell_document_id TEXT,
  ADD COLUMN IF NOT EXISTS signwell_status TEXT,
  ADD COLUMN IF NOT EXISTS signed_pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS signature_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signature_completed_at TIMESTAMPTZ;

-- Create signwell_events table to track webhook events
CREATE TABLE IF NOT EXISTS signwell_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID REFERENCES interest_letters(id) ON DELETE CASCADE,
  signwell_document_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  signer_email TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_signwell_events_letter_id ON signwell_events(letter_id);
CREATE INDEX IF NOT EXISTS idx_signwell_events_document_id ON signwell_events(signwell_document_id);
CREATE INDEX IF NOT EXISTS idx_interest_letters_signwell_document_id ON interest_letters(signwell_document_id);

-- Update letter_status type to include signature states (if not already included)
-- Note: This might fail if the enum values already exist, which is fine
DO $$
BEGIN
  ALTER TYPE letter_status ADD VALUE IF NOT EXISTS 'signature_requested';
  ALTER TYPE letter_status ADD VALUE IF NOT EXISTS 'signature_pending';
  ALTER TYPE letter_status ADD VALUE IF NOT EXISTS 'signed';
EXCEPTION
  WHEN duplicate_object THEN
    -- Values already exist, that's fine
    NULL;
END
$$;
