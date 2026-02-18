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

  // Fetch pinned articles for hero mosaic (up to 6)
  const pinnedRows = await sql`
    SELECT
      id, slug, title, excerpt, content, author,
      published_at, category, read_time, cover_image,
      status, created_at, updated_at, pinned, pinned_at
    FROM articles
    WHERE status = 'published' AND pinned = true
    ORDER BY pinned_at DESC NULLS LAST
    LIMIT 6
  ` as ArticleRow[];

  const pinnedArticles = pinnedRows.map(toArticle);

  // If fewer than 6 pinned, fill with most recent non-pinned
  let heroArticles = [...pinnedArticles];
  if (heroArticles.length < 6) {
    const pinnedIds = pinnedArticles.map(a => a.id);
    const fillCount = 6 - heroArticles.length;
    const fillRows = await sql`
      SELECT
        id, slug, title, excerpt, content, author,
        published_at, category, read_time, cover_image,
        status, created_at, updated_at, pinned, pinned_at
      FROM articles
      WHERE status = 'published'
        AND id != ALL(${pinnedIds.length > 0 ? pinnedIds : ['00000000-0000-0000-0000-000000000000']}::uuid[])
      ORDER BY published_at DESC
      LIMIT ${fillCount}
    ` as ArticleRow[];
    heroArticles = [...heroArticles, ...fillRows.map(toArticle)];
  }

  // Fetch all published articles, ordered by published date (newest first)
  const rows = await sql`
    SELECT
      id, slug, title, excerpt, content, author,
      published_at, category, read_time, cover_image,
      status, created_at, updated_at, pinned, pinned_at
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
