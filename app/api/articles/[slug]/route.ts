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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const sql = getDb();
    const { slug } = await params;

    const rows = await sql`
      SELECT id, slug, title, excerpt, content, author, published_at, category, read_time
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
