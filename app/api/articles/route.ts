import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  category: string;
  read_time: number;
}

function toArticle(row: ArticleRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    publishedAt: row.published_at,
    category: row.category,
    readTime: row.read_time,
  };
}

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, slug, title, excerpt, content, author, published_at, category, read_time
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
