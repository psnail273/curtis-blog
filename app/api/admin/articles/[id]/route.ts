import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { type ArticleRow, toArticle } from '@/lib/article-utils';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/admin/articles/[id]
 *
 * Returns a single article by UUID.
 */
export async function GET(
  _request: Request,
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

    const rows = await sql`
      SELECT * FROM articles WHERE id = ${id}
    ` as ArticleRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(toArticle(rows[0]));
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/articles/[id]
 *
 * Updates an article by UUID. Only provided fields are updated.
 * If status changes from draft to published and publishedAt is not set,
 * publishedAt is set to now.
 */
export async function PATCH(
  request: NextRequest,
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

    // Fetch current article to check if it exists and get current values
    const existing = await sql`
      SELECT * FROM articles WHERE id = ${id}
    ` as ArticleRow[];

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const current = existing[0];

    // Merge provided fields with current values
    const title = body.title ?? current.title;
    const slug = body.slug ?? current.slug;
    const excerpt = body.excerpt ?? current.excerpt;
    const content = body.content ?? current.content;
    const category = body.category ?? current.category;
    const readTime = body.readTime ?? current.read_time;
    const status = body.status ?? current.status;
    const author = body.author ?? current.author;
    const coverImage = body.coverImage !== undefined ? body.coverImage : current.cover_image;

    // If transitioning from draft to published, set publishedAt to now
    let publishedAt = current.published_at;
    if (status === 'published' && current.status === 'draft') {
      publishedAt = new Date().toISOString();
    }
    // Allow explicit publishedAt override
    if (body.publishedAt !== undefined) {
      publishedAt = body.publishedAt;
    }

    const now = new Date().toISOString();

    const rows = await sql`
      UPDATE articles
      SET
        title = ${title},
        slug = ${slug},
        excerpt = ${excerpt},
        content = ${content},
        category = ${category},
        read_time = ${readTime},
        cover_image = ${coverImage},
        status = ${status},
        author = ${author},
        published_at = ${publishedAt},
        updated_at = ${now}
      WHERE id = ${id}
      RETURNING *
    ` as ArticleRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update article' },
        { status: 500 }
      );
    }

    return NextResponse.json(toArticle(rows[0]));
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 409 }
      );
    }

    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/articles/[id]
 *
 * Deletes an article by UUID.
 */
export async function DELETE(
  _request: Request,
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

    const rows = await sql`
      DELETE FROM articles WHERE id = ${id} RETURNING id
    ` as { id: string }[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, id: rows[0].id });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
