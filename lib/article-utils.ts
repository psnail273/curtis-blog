import type { Article } from '@/types/article';

/**
 * Database row representation of an article.
 * Maps directly to the articles table columns.
 */
export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
  category: string;
  read_time: number;
  cover_image: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Converts a database ArticleRow to the application Article type.
 * Transforms snake_case column names to camelCase properties.
 */
export function toArticle(row: ArticleRow): Article {
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
    coverImage: row.cover_image ?? undefined,
    status: row.status as 'draft' | 'published',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
