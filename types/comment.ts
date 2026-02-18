/**
 * TypeScript type definitions for the comments system.
 * These types are used throughout the application for type safety.
 */

/**
 * Minimal user information embedded in comments.
 * Represents the user who authored the comment.
 */
export interface CommentUser {
  id: string;
  name: string;
  image: string | null;
}

/**
 * A complete comment with user information, content, and engagement data.
 * Used in the UI to render comments with like counts and current user's like status.
 */
export interface Comment {
  id: string;
  articleId: string;
  user: CommentUser;
  content: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

/**
 * OAuth user record (separate from admin authentication).
 * Users must authenticate via OAuth to post comments and like.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  provider: string;
  providerId: string;
  createdAt: string;
}
