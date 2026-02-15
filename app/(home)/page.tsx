import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { toArticle, type ArticleRow } from '@/lib/article-utils';
import { HomePageContent } from './HomePageContent';

export const metadata: Metadata = {
  title: 'Home',
  description: 'A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.',
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  // Await searchParams to mark route as dynamic (category read client-side via useSearchParams)
  await searchParams;
  const sql = getDb();

  // Fetch all published articles, ordered by published date (newest first)
  const rows = await sql`
    SELECT
      id, slug, title, excerpt, content, author,
      published_at, category, read_time, cover_image,
      status, created_at, updated_at
    FROM articles
    WHERE status = 'published'
    ORDER BY published_at DESC
  ` as ArticleRow[];

  const articles = rows.map(toArticle);

  // Extract unique categories from articles
  const categories = Array.from(
    new Set(articles.map(article => article.category))
  ).sort();

  return (
    <div className="py-4 md:py-6">
      {/* Hidden h1 for semantic structure and SEO */}
      <h1 className="sr-only">Curtis Israel&apos;s Blog</h1>

      <HomePageContent
        articles={articles}
        categories={categories}
      />
    </div>
  );
}
