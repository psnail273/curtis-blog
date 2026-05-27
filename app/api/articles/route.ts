import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { type ArticleRow, toArticle } from '@/lib/article-utils';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, slug, title, excerpt, content, author, published_at, category, read_time, cover_image, status, created_at, updated_at
      FROM articles
      WHERE status = 'published'
      ORDER BY published_at DESC
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
