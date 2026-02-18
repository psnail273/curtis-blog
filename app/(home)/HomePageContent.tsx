'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Article } from '@/types/article';
import { HeroMosaic } from '@/components/home/HeroMosaic';
import { CTABanner } from '@/components/home/CTABanner';
import { CategorySection } from '@/components/home/CategorySection';
import { getCategoryColor } from '@/lib/category-colors';

interface HomePageContentProps {
  heroArticles: Article[];
  articles: Article[];
  categories: string[];
}

export function HomePageContent({ heroArticles, articles, categories }: HomePageContentProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  // Group ALL articles by category — pinned articles appear in both hero AND their section
  const articlesByCategory = useMemo(() => {
    const grouped = new Map<string, Article[]>();
    for (const article of articles) {
      const list = grouped.get(article.category) ?? [];
      list.push(article);
      grouped.set(article.category, list);
    }
    return categories
      .filter(cat => grouped.has(cat))
      .map(cat => ({ category: cat, articles: grouped.get(cat)! }));
  }, [articles, categories]);

  // Empty state - no articles at all
  if (articles.length === 0) {
    return (
      <div className="py-16 md:py-24 text-center">
        <div className="mb-4 text-muted" aria-hidden="true">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
          No articles yet
        </h2>
        <p className="font-sans text-base md:text-lg text-muted">
          Check back soon for new content
        </p>
      </div>
    );
  }

  // Category-specific view
  if (activeCategory) {
    const categoryArticles = articles.filter(a => a.category === activeCategory);

    // Empty category or invalid category
    if (categoryArticles.length === 0) {
      return (
        <div className="py-16 md:py-24 text-center">
          <div className="mb-4 text-muted" aria-hidden="true">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
            No articles in {activeCategory}
          </h2>
          <p className="font-sans text-base md:text-lg text-muted">
            Check back soon for new {activeCategory} content
          </p>
        </div>
      );
    }

    return <CategorySection articles={categoryArticles} priority={true} />;
  }

  // Default "All" view
  return (
    <div className="flex flex-col">
      {/* Hero Mosaic Grid */}
      <HeroMosaic articles={heroArticles} />

      {/* CTA Banner */}
      <CTABanner />

      {/* Category Sections — side-by-side editorial layout */}
      {articlesByCategory.map(({ category, articles: catArticles }) => {
        const catColor = getCategoryColor(category);

        return (
          <section key={category} className="mb-10 md:mb-14">
            {/* Category header with MCM color bar */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div
                className="w-1 h-5 rounded-full shrink-0"
                style={{ backgroundColor: catColor.light }}
                aria-hidden="true"
              />
              <span
                className="text-xs uppercase tracking-[0.2em] font-semibold"
                style={{ color: catColor.light }}
              >
                {category}
              </span>
              <div className="flex-1 h-px bg-border" aria-hidden="true" />
            </div>

            <CategorySection articles={catArticles} />
          </section>
        );
      })}
    </div>
  );
}
