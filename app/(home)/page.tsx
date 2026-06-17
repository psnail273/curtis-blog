import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { toArticle, type ArticleRow } from '@/lib/article-utils';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { HomePageContent } from './HomePageContent';

export const metadata: Metadata = {
  title: 'Home',
  description: 'A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.',
};

export default async function Home() {
  const sql = getDb();
  const isAdmin = await isAdminAuthenticated();

  const rows = isAdmin
    ? await sql`
        SELECT
          id, slug, title, excerpt, content, author,
          published_at, category, read_time, cover_image,
          status, created_at, updated_at
        FROM articles
        ORDER BY COALESCE(published_at, created_at) DESC
      ` as unknown as ArticleRow[]
    : await sql`
        SELECT
          id, slug, title, excerpt, content, author,
          published_at, category, read_time, cover_image,
          status, created_at, updated_at
        FROM articles
        WHERE status = 'published'
        ORDER BY published_at DESC
      ` as unknown as ArticleRow[];

  const articles = rows.map(toArticle);
  const heroArticles = articles.slice(0, 6);

  // Extract unique categories from articles
  const categories = Array.from(
    new Set(articles.map(article => article.category))
  ).sort();

  return (
    <div className="pt-4 md:pt-6">
      {/* Hidden h1 for semantic structure and SEO */}
      <h1 className="sr-only">Curtis Israel&apos;s Blog</h1>

      <HomePageContent
        heroArticles={heroArticles}
        articles={articles}
        categories={categories}
      />
    </div>
  );
}
