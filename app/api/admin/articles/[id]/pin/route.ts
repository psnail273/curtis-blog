import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { type ArticleRow, toArticle } from '@/lib/article-utils';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/admin/articles/[id]/pin
 *
 * Toggles the pinned status of an article.
 * Body: { pinned: boolean }
 * Response: Updated article
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid article ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate pinned field
    if (typeof body.pinned !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. "pinned" must be a boolean.' },
        { status: 400 }
      );
    }

    const pinned = body.pinned;
    const pinnedAt = pinned ? new Date().toISOString() : null;

    const rows = await sql`
      UPDATE articles
      SET pinned = ${pinned}, pinned_at = ${pinnedAt}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    ` as ArticleRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toArticle(rows[0]));
  } catch (error) {
    console.error('Error toggling pin status:', error);
    return NextResponse.json(
      { error: 'Failed to update pin status' },
      { status: 500 }
    );
  }
}
