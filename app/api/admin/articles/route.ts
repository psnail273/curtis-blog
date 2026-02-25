import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDb } from '@/lib/db';
import { type ArticleRow, toArticle } from '@/lib/article-utils';
import { requireAdminAuth } from '@/lib/admin-auth';

/**
 * GET /api/admin/articles
 *
 * Returns all articles (drafts and published), ordered by createdAt desc.
 */
export async function GET() {
  try {
    const authError = await requireAdminAuth();
    if (authError) return authError;
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM articles ORDER BY created_at DESC
    ` as ArticleRow[];

    return NextResponse.json(rows.map(toArticle));
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/articles
 *
 * Creates a new article. Required fields: title, slug, excerpt, content, category, readTime.
 * Defaults: author = "Curtis Israel", status = "draft".
 * If status is "published", publishedAt is set to now.
 */
export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminAuth();
    if (authError) return authError;
    const sql = getDb();
    const body = await request.json();

    const { title, slug, excerpt, content, category, readTime, status, author, coverImage } = body;

    // Validate required fields
    const missing: string[] = [];
    if (!title) missing.push('title');
    if (!slug) missing.push('slug');
    if (!excerpt) missing.push('excerpt');
    if (!content) missing.push('content');
    if (!category) missing.push('category');
    if (readTime === undefined || readTime === null) missing.push('readTime');

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (title.length > 500) {
      return NextResponse.json({ error: 'Title must be 500 characters or fewer' }, { status: 400 });
    }
    if (slug.length > 255) {
      return NextResponse.json({ error: 'Slug must be 255 characters or fewer' }, { status: 400 });
    }
    if (excerpt.length > 1000) {
      return NextResponse.json({ error: 'Excerpt must be 1000 characters or fewer' }, { status: 400 });
    }
    if (content.length > 100000) {
      return NextResponse.json({ error: 'Content must be 100,000 characters or fewer' }, { status: 400 });
    }
    if (category.length > 100) {
      return NextResponse.json({ error: 'Category must be 100 characters or fewer' }, { status: 400 });
    }
    if (author && author.length > 255) {
      return NextResponse.json({ error: 'Author must be 255 characters or fewer' }, { status: 400 });
    }

    // Validate slug format (lowercase letters, numbers, hyphens)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    const articleStatus = status || 'draft';
    const articleAuthor = author || 'Curtis Israel';
    const publishedAt = articleStatus === 'published'
      ? new Date().toISOString()
      : null;

    const rows = await sql`
      INSERT INTO articles (title, slug, excerpt, content, category, read_time, cover_image, status, author, published_at)
      VALUES (
        ${title},
        ${slug},
        ${excerpt},
        ${content},
        ${category},
        ${readTime},
        ${coverImage ?? null},
        ${articleStatus},
        ${articleAuthor},
        ${publishedAt}
      )
      RETURNING *
    ` as ArticleRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create article' },
        { status: 500 }
      );
    }

    // Revalidate the new article's page so ISR picks it up
    revalidatePath(`/articles/${rows[0].slug}`);

    return NextResponse.json(toArticle(rows[0]), { status: 201 });
  } catch (error: unknown) {
    // Handle unique constraint violation on slug
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'An article with this slug already exists' },
        { status: 409 }
      );
    }

    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
