import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { type ArticleRow, toArticle } from '@/lib/article-utils';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const sql = getDb();
    const { slug } = await params;

    const rows = await sql`
      SELECT id, slug, title, excerpt, content, author, published_at, category, read_time, cover_image, status, created_at, updated_at
      FROM articles
      WHERE slug = ${slug} AND status = 'published'
    ` as ArticleRow[];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
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
