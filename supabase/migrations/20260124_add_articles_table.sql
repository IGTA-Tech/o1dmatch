-- ============================================
-- O1DMatch Articles Table for Content Library
-- Migration: Add articles table for blog/content
-- ============================================

-- Article status enum
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- Articles table for content library
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  meta_description TEXT,
  content TEXT NOT NULL, -- HTML content
  excerpt TEXT,

  -- Categorization
  visa_type TEXT NOT NULL, -- O-1A, O-1B, EB-1A, EB-2 NIW
  content_type TEXT NOT NULL, -- Educational, Talent-Focused, Employer-Focused, Competitive, News Commentary
  target_audience TEXT DEFAULT 'Both', -- Talent, Employer, Both
  topic TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Media
  featured_image_url TEXT,

  -- SEO
  reading_time TEXT DEFAULT '5 min read',

  -- Source tracking
  google_doc_url TEXT,
  source_system TEXT DEFAULT 'content-maker-v2',

  -- RAG/News metadata (for analytics)
  news_integration JSONB,
  rag_integration JSONB,
  backlink_report JSONB,

  -- Publishing
  status article_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_visa_type ON articles(visa_type);
CREATE INDEX idx_articles_content_type ON articles(content_type);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_target_audience ON articles(target_audience);

-- Enable Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

-- Service role can manage all articles (for webhook)
CREATE POLICY "Service role can manage articles"
  ON articles FOR ALL
  USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_articles_updated_at();
