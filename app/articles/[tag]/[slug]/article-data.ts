import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { categoryToTag, type ArticleRow } from '@/lib/article-utils';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export const getArticleBySlug = cache(async (slug: string): Promise<ArticleRow | null> => {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM articles WHERE slug = ${slug}
    ` as ArticleRow[];
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
});

/**
 * Resolves the article this route should render, or calls notFound().
 *
 * Invoked from the segment's layout.tsx — the layout renders above the
 * loading.tsx Suspense boundary, so a notFound() here resolves before the
 * shell is flushed and yields a real 404 status. Triggering notFound() from
 * the page or generateMetadata instead would render the not-found UI into an
 * already-flushed 200 response (and cause a hydration mismatch), because
 * loading.tsx streams the shell before the page runs.
 *
 * 404s when: the slug doesn't exist, the URL tag doesn't match the article's
 * category, or it's an unpublished draft viewed by a non-admin.
 *
 * Wrapped in cache() so the layout, generateMetadata, and page share one
 * fetch + admin lookup per request.
 */
export const resolveArticleOr404 = cache(async (tag: string, slug: string): Promise<ArticleRow> => {
  const isAdmin = await isAdminAuthenticated();
  const article = await getArticleBySlug(slug);

  if (!article) notFound();
  if (categoryToTag(article.category) !== tag) notFound();
  if (article.status !== 'published' && !isAdmin) notFound();

  return article;
});
