import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth-helpers';
import { type Comment } from '@/types/comment';
import { type CommentWithUserRow } from '@/lib/comment-utils';

/**
 * GET /api/articles/[slug]/comments
 *
 * Fetch all comments for an article by slug (public endpoint).
 * Returns comments with user data, like counts, and current user's like status.
 * Ordered chronologically (oldest first).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const sql = getDb();
    const { slug } = await params;
    const currentUser = await getCurrentUser();

    // First, get the article ID from the slug
    const articleRows = await sql`
      SELECT id FROM articles WHERE slug = ${slug}
    `;

    if (articleRows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const articleId = articleRows[0].id;

    // Fetch comments with user data and like counts
    const rows = await sql`
      SELECT
        c.id,
        c.article_id,
        c.parent_id,
        c.content,
        c.created_at,
        c.updated_at,
        c.deleted_at,
        u.id AS user_id,
        u.name AS user_name,
        u.image AS user_image,
        pu.name AS parent_user_name,
        COUNT(DISTINCT cl.id) AS like_count,
        ${currentUser?.id || null}::uuid IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM comment_likes
            WHERE comment_id = c.id AND user_id = ${currentUser?.id || null}::uuid
          ) AS liked_by_current_user
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN comments pc ON c.parent_id = pc.id
      LEFT JOIN users pu ON pc.user_id = pu.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      WHERE c.article_id = ${articleId}
      GROUP BY c.id, u.id, pu.name
      ORDER BY c.created_at ASC
    `;

    const comments: Comment[] = (rows as CommentWithUserRow[]).map((row) => {
      const isDeleted = row.deleted_at !== null;
      return {
        id: row.id,
        articleId: row.article_id,
        parentId: row.parent_id ?? null,
        parentUserName: row.parent_user_name ?? null,
        user: isDeleted
          ? { id: '', name: '', image: null }
          : {
              id: row.user_id,
              name: row.user_name,
              image: row.user_image,
            },
        content: isDeleted ? '' : row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        likeCount: isDeleted ? 0 : Number(row.like_count),
        likedByCurrentUser: isDeleted ? false : Boolean(row.liked_by_current_user),
        deleted: isDeleted,
      };
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/articles/[slug]/comments
 *
 * Create a new comment on an article (authenticated).
 * Validates content (non-empty, max 2000 chars) and sanitizes HTML.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await requireAuth();
    const sql = getDb();
    const { slug } = await params;

    // Get article ID from slug
    const articleRows = await sql`
      SELECT id FROM articles WHERE slug = ${slug}
    `;

    if (articleRows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const articleId = articleRows[0].id;

    // Parse and validate request body
    const body = await request.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment content must be 2000 characters or less' },
        { status: 400 }
      );
    }

    // Validate parentId if provided
    const parentId = body.parentId || null;

    if (parentId) {
      const parentRows = await sql`
        SELECT id FROM comments WHERE id = ${parentId} AND article_id = ${articleId}
      `;

      if (parentRows.length === 0) {
        return NextResponse.json(
          { error: 'Parent comment not found or belongs to a different article' },
          { status: 400 }
        );
      }
    }

    // Strip HTML tags for security (defense-in-depth, React auto-escapes but this prevents stored XSS)
    const sanitizedContent = content.replace(/<[^>]*>/g, '');

    // Insert comment
    const commentRows = await sql`
      INSERT INTO comments (article_id, user_id, content, parent_id)
      VALUES (${articleId}, ${user.id}, ${sanitizedContent}, ${parentId})
      RETURNING id, article_id, user_id, parent_id, content, created_at, updated_at
    `;

    if (commentRows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    const newComment = commentRows[0];

    // Fetch user data for the response
    const userRows = await sql`
      SELECT id, name, image FROM users WHERE id = ${user.id}
    `;

    const comment: Comment = {
      id: newComment.id,
      articleId: newComment.article_id,
      parentId: newComment.parent_id ?? null,
      parentUserName: null,
      user: {
        id: userRows[0].id,
        name: userRows[0].name,
        image: userRows[0].image,
      },
      content: newComment.content,
      createdAt: newComment.created_at,
      updatedAt: newComment.updated_at,
      likeCount: 0,
      likedByCurrentUser: false,
      deleted: false,
    };

    return NextResponse.json(comment, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be signed in to comment' },
        { status: 401 }
      );
    }

    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
