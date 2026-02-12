import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { ArticlesPageContent } from './ArticlesPageContent';
import type { Article } from '@/types/article';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Thoughts on politics, gaming, education, tech, and whatever else is on my mind.',
  openGraph: {
    title: 'Articles | Curtis Israel',
    description: 'Thoughts on politics, gaming, education, tech, and whatever else is on my mind.',
    url: '/articles',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Articles | Curtis Israel',
    description: 'Thoughts on politics, gaming, education, tech, and whatever else is on my mind.',
  },
};

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
  status: string;
  created_at: string;
  updated_at: string;
}

function toArticle(row: ArticleRow): Article {
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
    status: row.status as 'draft' | 'published',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default async function Articles() {
  let articles: Article[] = [];

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM articles
      WHERE status = 'published'
      ORDER BY published_at DESC
    ` as ArticleRow[];
    articles = rows.map(toArticle);
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Graceful fallback: show empty list
  }

  // Extract unique categories, sorted alphabetically for consistent order
  const categories = Array.from(
    new Set(articles.map((article) => article.category))
  ).sort();

  return <ArticlesPageContent articles={articles} categories={categories} />;
}
