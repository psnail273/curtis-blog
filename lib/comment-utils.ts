import type { Comment, CommentUser, User } from '@/types/comment';

/**
 * Database row representation of a user.
 * Maps directly to the users table columns (snake_case).
 */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  image: string | null;
  provider: string;
  provider_id: string;
  created_at: string;
}

/**
 * Database row representation of a comment.
 * Maps directly to the comments table columns (snake_case).
 */
export interface CommentRow {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

/**
 * Database row representation of a comment with joined user data.
 * Used when fetching comments with user information in a single query.
 */
export interface CommentWithUserRow {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  parent_user_name: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_image: string | null;
  like_count: number;
  liked_by_current_user?: boolean;
}

/**
 * Database row representation of a comment like.
 * Maps directly to the comment_likes table columns (snake_case).
 */
export interface CommentLikeRow {
  id: string;
  comment_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Converts a database UserRow to the application User type.
 * Transforms snake_case column names to camelCase properties.
 */
export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    provider: row.provider,
    providerId: row.provider_id,
    createdAt: row.created_at,
  };
}

/**
 * Converts a database CommentWithUserRow to the application Comment type.
 * This is used when comments are fetched with joined user data.
 * Transforms snake_case column names to camelCase properties.
 */
export function toComment(row: CommentWithUserRow): Comment {
  return {
    id: row.id,
    articleId: row.article_id,
    parentId: row.parent_id,
    parentUserName: row.parent_user_name,
    user: {
      id: row.user_id,
      name: row.user_name,
      image: row.user_image,
    },
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    likeCount: row.like_count,
    likedByCurrentUser: row.liked_by_current_user ?? false,
  };
}

/**
 * Converts a CommentRow and separate UserRow to a CommentUser.
 * Used when comment and user data are fetched separately.
 */
export function toCommentUser(row: UserRow): CommentUser {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
  };
}
