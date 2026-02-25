import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { UUID_REGEX } from '@/lib/validation';

/**
 * POST /api/comments/[id]/like
 *
 * Toggle like on a comment (authenticated).
 * If user has already liked: unlike (delete).
 * If user has not liked: like (insert).
 * Returns the new like state and count.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const sql = getDb();
    const { id: commentId } = await params;

    if (!UUID_REGEX.test(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Check if comment exists
    const commentRows = await sql`
      SELECT id FROM comments WHERE id = ${commentId}
    `;

    if (commentRows.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked this comment
    const existingLike = await sql`
      SELECT id FROM comment_likes
      WHERE comment_id = ${commentId} AND user_id = ${user.id}
    `;

    let liked: boolean;

    if (existingLike.length > 0) {
      // Unlike: delete the existing like
      await sql`
        DELETE FROM comment_likes
        WHERE comment_id = ${commentId} AND user_id = ${user.id}
      `;
      liked = false;
    } else {
      // Like: insert a new like
      await sql`
        INSERT INTO comment_likes (comment_id, user_id)
        VALUES (${commentId}, ${user.id})
      `;
      liked = true;
    }

    // Get the updated like count
    const countRows = await sql`
      SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id = ${commentId}
    `;

    const likeCount = parseInt(countRows[0].count, 10);

    return NextResponse.json({
      liked,
      likeCount,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be signed in to like comments' },
        { status: 401 }
      );
    }

    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
