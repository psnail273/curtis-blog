-- Migration: 002_add_cover_image_to_articles
-- Description: Add cover_image column to articles table for article cover images
-- Date: 2026-02-14
--
-- Run this migration against your Neon Postgres database:
--   psql $DATABASE_URL -f db/migrations/002_add_cover_image_to_articles.sql
--
-- Or paste into the Neon SQL Editor at https://console.neon.tech

-- Add cover_image column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Comment for documentation
COMMENT ON COLUMN articles.cover_image IS 'Optional URL to the article cover image. Used for editorial article list layouts and article detail pages.';
