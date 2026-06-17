export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import { categoryToTag, toArticle, type ArticleRow } from '@/lib/article-utils';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { CategoryFilterView } from '@/components/home/CategoryFilterView';
import { getCategoryStyle } from '@/lib/category-colors';
import type { Article } from '@/types/article';

interface CategoryPageProps {
  params: Promise<{ tag: string }>;
}

/**
 * Fetches the articles whose category maps to the given URL tag.
 * Returns the resolved (Pascal-case) category name alongside its articles,
 * or null when no published category matches the tag.
 */
async function getCategoryByTag(
  tag: string,
): Promise<{ category: string; articles: Article[] } | null> {
  try {
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

    const articles = rows.map(toArticle).filter((a) => categoryToTag(a.category) === tag);
    if (articles.length === 0) return null;

    return { category: articles[0].category, articles };
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { tag } = await params;
  const result = await getCategoryByTag(tag);

  if (!result) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `${result.category} Articles`,
    description: `Articles in the ${result.category} category by Curtis Israel.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { tag } = await params;
  const result = await getCategoryByTag(tag);

  if (!result) {
    notFound();
  }

  const { category, articles } = result;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted hover:text-accent text-sm transition-all duration-200 hover:translate-x-[-4px] w-fit"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back to articles
      </Link>

      <div style={getCategoryStyle(category)}>
        <h1 className="font-serif text-2xl md:text-3xl font-medium category-color uppercase tracking-wide pl-3 border-l-[3px] border-current">
          {category}
        </h1>
      </div>

      <CategoryFilterView articles={articles} category={category} priority />
    </div>
  );
}
