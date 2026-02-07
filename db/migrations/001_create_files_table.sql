-- Migration: 001_create_files_table
-- Description: Create the files table for storing file metadata
-- Date: 2026-02-06
--
-- Run this migration against your Neon Postgres database:
--   psql $DATABASE_URL -f db/migrations/001_create_files_table.sql
--
-- Or paste into the Neon SQL Editor at https://console.neon.tech

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  path        VARCHAR(1024) NOT NULL,
  type        VARCHAR(50) NOT NULL CHECK (type IN ('code', 'video', 'pdf', 'image', 'document', 'other')),
  size        INTEGER NOT NULL DEFAULT 0,
  category    VARCHAR(100),
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT,
  url         TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_files_type ON files (type);
CREATE INDEX IF NOT EXISTS idx_files_category ON files (category);
CREATE INDEX IF NOT EXISTS idx_files_path ON files (path);

-- Comments for documentation
COMMENT ON TABLE files IS 'File metadata for the file explorer. Actual files are hosted externally; this table stores metadata and URLs.';
COMMENT ON COLUMN files.id IS 'Unique identifier (UUID v4, auto-generated)';
COMMENT ON COLUMN files.name IS 'File name with extension (e.g., utils.ts, intro.mp4)';
COMMENT ON COLUMN files.path IS 'Virtual hierarchical path for tree navigation (e.g., /code/typescript/utils.ts)';
COMMENT ON COLUMN files.type IS 'File type category: code, video, pdf, image, document, other';
COMMENT ON COLUMN files.size IS 'File size in bytes';
COMMENT ON COLUMN files.category IS 'Optional grouping category for filtering (e.g., tutorial, project, reference)';
COMMENT ON COLUMN files.upload_date IS 'When the file metadata was added';
COMMENT ON COLUMN files.description IS 'Human-readable description of the file';
COMMENT ON COLUMN files.url IS 'External URL to the actual file content';
COMMENT ON COLUMN files.metadata IS 'Extensible JSONB for future properties (author, tags, views, etc.)';
