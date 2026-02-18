-- Migration: 004_add_comments
-- Description: Create tables for article comments system with OAuth users, comments, and likes
-- Date: 2026-02-15
--
-- Run this migration against your Neon Postgres database:
--   psql $DATABASE_URL -f db/migrations/004_add_comments.sql
--
-- Or paste into the Neon SQL Editor at https://console.neon.tech

-- Create users table (OAuth users, not admin auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  image TEXT,
  provider VARCHAR(50) NOT NULL DEFAULT 'google',
  provider_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Index for auth lookups
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comments for documentation
COMMENT ON TABLE users IS 'OAuth authenticated users who can comment on articles. Separate from admin authentication.';
COMMENT ON COLUMN users.id IS 'Unique identifier (UUID v4, auto-generated)';
COMMENT ON COLUMN users.name IS 'Display name from OAuth provider';
COMMENT ON COLUMN users.email IS 'Email address from OAuth provider (unique)';
COMMENT ON COLUMN users.image IS 'Avatar URL from OAuth provider';
COMMENT ON COLUMN users.provider IS 'OAuth provider name (e.g., google)';
COMMENT ON COLUMN users.provider_id IS 'User ID from the OAuth provider';
COMMENT ON COLUMN users.created_at IS 'When the user first authenticated';

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching comments by article (sorted chronologically)
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id, created_at ASC);
-- Index for fetching a user's comments
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Comments for documentation
COMMENT ON TABLE comments IS 'User comments on articles. Flat chronological list, no threading.';
COMMENT ON COLUMN comments.id IS 'Unique identifier (UUID v4, auto-generated)';
COMMENT ON COLUMN comments.article_id IS 'Foreign key to articles table. Cascade delete if article is removed.';
COMMENT ON COLUMN comments.user_id IS 'Foreign key to users table. Cascade delete if user is removed.';
COMMENT ON COLUMN comments.content IS 'Comment text content (plain text, max 2000 chars enforced at app level)';
COMMENT ON COLUMN comments.created_at IS 'When the comment was posted';
COMMENT ON COLUMN comments.updated_at IS 'When the comment was last edited (reserved for future edit feature)';

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Index for counting likes on a comment
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
-- Index for finding a user's likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Comments for documentation
COMMENT ON TABLE comment_likes IS 'Likes/reactions on comments. One like per user per comment (enforced by unique constraint).';
COMMENT ON COLUMN comment_likes.id IS 'Unique identifier (UUID v4, auto-generated)';
COMMENT ON COLUMN comment_likes.comment_id IS 'Foreign key to comments table. Cascade delete if comment is removed.';
COMMENT ON COLUMN comment_likes.user_id IS 'Foreign key to users table. Cascade delete if user is removed.';
COMMENT ON COLUMN comment_likes.created_at IS 'When the like was created';
