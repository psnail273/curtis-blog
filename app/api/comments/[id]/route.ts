import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth, isAdmin } from '@/lib/auth-helpers';
import { UUID_REGEX } from '@/lib/validation';

/**
 * DELETE /api/comments/[id]
 *
 * Delete a comment (authenticated - author or admin only).
 * Cascading deletes will remove associated likes automatically.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const sql = getDb();
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid comment ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Fetch the comment to check ownership
    const commentRows = await sql`
      SELECT user_id FROM comments WHERE id = ${id}
    `;

    if (commentRows.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = commentRows[0];

    // Check if user is the comment author or an admin
    const isAuthor = comment.user_id === user.id;
    const userIsAdmin = isAdmin(user.email);

    if (!isAuthor && !userIsAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      );
    }

    // Delete the comment (cascading deletes will remove associated likes)
    const deleteRows = await sql`
      DELETE FROM comments WHERE id = ${id} RETURNING id
    `;

    if (deleteRows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: deleteRows[0].id });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be signed in to delete comments' },
        { status: 401 }
      );
    }

    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
