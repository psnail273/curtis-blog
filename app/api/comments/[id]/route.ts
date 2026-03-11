import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { UUID_REGEX } from '@/lib/validation';

/**
 * DELETE /api/comments/[id]
 *
 * Delete a comment (author or admin only).
 * - Comments with replies are soft-deleted (deleted_at set).
 * - Comments without replies are hard-deleted.
 * - After hard-deleting, orphaned soft-deleted parents are cleaned up.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, adminAuthenticated] = await Promise.all([
      getCurrentUser(),
      isAdminAuthenticated(),
    ]);

    // Must be either an OAuth user or an admin
    if (!user && !adminAuthenticated) {
      return NextResponse.json(
        { error: 'You must be signed in to delete comments' },
        { status: 401 }
      );
    }

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
      SELECT user_id, parent_id FROM comments WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (commentRows.length === 0) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const comment = commentRows[0];

    // Check authorization: must be comment author or admin
    const isAuthor = user && comment.user_id === user.id;
    if (!isAuthor && !adminAuthenticated) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this comment' },
        { status: 403 }
      );
    }

    // Check if the comment has any non-deleted replies
    const replyRows = await sql`
      SELECT COUNT(*)::int AS count FROM comments
      WHERE parent_id = ${id} AND deleted_at IS NULL
    `;
    const hasReplies = replyRows[0].count > 0;

    if (hasReplies) {
      // Soft delete: set deleted_at, remove likes
      await sql`UPDATE comments SET deleted_at = NOW() WHERE id = ${id}`;
      await sql`DELETE FROM comment_likes WHERE comment_id = ${id}`;
    } else {
      // Hard delete: remove the comment and its likes (cascade handles likes)
      await sql`DELETE FROM comments WHERE id = ${id}`;

      // Clean up orphaned soft-deleted parent if applicable
      if (comment.parent_id) {
        await cleanupOrphanedParent(sql, comment.parent_id);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

/**
 * Recursively clean up soft-deleted parent comments that have no remaining
 * non-deleted children. This prevents orphaned "[deleted]" placeholders.
 */
async function cleanupOrphanedParent(
  sql: ReturnType<typeof getDb>,
  parentId: string
): Promise<void> {
  // Check if parent is soft-deleted and has no remaining non-deleted children
  const parentRows = await sql`
    SELECT id, parent_id, deleted_at FROM comments WHERE id = ${parentId}
  `;

  if (parentRows.length === 0) return;

  const parent = parentRows[0];
  if (!parent.deleted_at) return; // Parent is not soft-deleted, nothing to clean up

  const childRows = await sql`
    SELECT COUNT(*)::int AS count FROM comments
    WHERE parent_id = ${parentId} AND deleted_at IS NULL
  `;

  if (childRows[0].count === 0) {
    // No remaining non-deleted children — hard delete the orphaned parent
    await sql`DELETE FROM comments WHERE id = ${parentId}`;

    // Recurse up the tree
    if (parent.parent_id) {
      await cleanupOrphanedParent(sql, parent.parent_id);
    }
  }
}
