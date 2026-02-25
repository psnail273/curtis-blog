import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { type ArticleRow, toArticle } from '@/lib/article-utils';
import { UUID_REGEX } from '@/lib/validation';
import { requireAdminAuth } from '@/lib/admin-auth';

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
    const authError = await requireAdminAuth();
    if (authError) return authError;
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
    const authError = await requireAdminAuth();
    if (authError) return authError;
    const sql = getDb();
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid article ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate field lengths for provided fields
    if (body.title !== undefined && body.title.length > 500) {
      return NextResponse.json({ error: 'Title must be 500 characters or fewer' }, { status: 400 });
    }
    if (body.slug !== undefined && body.slug.length > 255) {
      return NextResponse.json({ error: 'Slug must be 255 characters or fewer' }, { status: 400 });
    }
    if (body.excerpt !== undefined && body.excerpt.length > 1000) {
      return NextResponse.json({ error: 'Excerpt must be 1000 characters or fewer' }, { status: 400 });
    }
    if (body.content !== undefined && body.content.length > 100000) {
      return NextResponse.json({ error: 'Content must be 100,000 characters or fewer' }, { status: 400 });
    }
    if (body.category !== undefined && body.category.length > 100) {
      return NextResponse.json({ error: 'Category must be 100 characters or fewer' }, { status: 400 });
    }
    if (body.author !== undefined && body.author.length > 255) {
      return NextResponse.json({ error: 'Author must be 255 characters or fewer' }, { status: 400 });
    }

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

    // Revalidate the updated article page
    revalidatePath(`/articles/${rows[0].slug}`);
    // If the slug changed, also revalidate the old slug's cached page
    if (current.slug !== rows[0].slug) {
      revalidatePath(`/articles/${current.slug}`);
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
    const authError = await requireAdminAuth();
    if (authError) return authError;
    const sql = getDb();
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid article ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Fetch slug before deletion so we can revalidate the cached page
    const toDelete = await sql`
      SELECT id, slug FROM articles WHERE id = ${id}
    ` as { id: string; slug: string }[];

    if (toDelete.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const deletedSlug = toDelete[0].slug;

    await sql`
      DELETE FROM articles WHERE id = ${id}
    `;

    revalidatePath(`/articles/${deletedSlug}`);

    return NextResponse.json({ success: true, id: toDelete[0].id });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
