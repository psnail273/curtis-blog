-- Migration: 003_add_pinned_articles
-- Description: Add pinned and pinned_at columns to articles table for hero mosaic grid
-- Date: 2026-02-16
--
-- Run this migration against your Neon Postgres database:
--   psql $DATABASE_URL -f db/migrations/003_add_pinned_articles.sql
--
-- Or paste into the Neon SQL Editor at https://console.neon.tech

-- Add pinned columns to articles table
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient pinned article queries
-- (homepage needs pinned articles quickly)
CREATE INDEX IF NOT EXISTS idx_articles_pinned ON articles (pinned, pinned_at DESC NULLS LAST)
  WHERE status = 'published';

-- Comments for documentation
COMMENT ON COLUMN articles.pinned IS 'Admin-controlled flag for articles to display in the homepage hero mosaic grid. Maximum 6 articles should be pinned.';
COMMENT ON COLUMN articles.pinned_at IS 'Timestamp when the article was pinned. Used for ordering pinned articles (most recently pinned first).';
