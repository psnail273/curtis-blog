'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Article } from '@/types/article';
import { FeaturedArticle } from '@/components/articles/FeaturedArticle';
import { ArticleListItem } from '@/components/articles/ArticleListItem';

interface HomePageContentProps {
  articles: Article[];
  categories: string[];
}

const CATEGORY_ORDER = ['Gaming', 'Tech', 'Politics', 'Education'] as const;

export function HomePageContent({ articles }: HomePageContentProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || null;

  // Group articles by category for "All" view
  const groupedArticles = useMemo(() => {
    const groups: Record<string, Article[]> = {};
    CATEGORY_ORDER.forEach(cat => {
      const categoryArticles = articles.filter(a => a.category === cat);
      if (categoryArticles.length > 0) {
        groups[cat] = categoryArticles;
      }
    });
    return groups;
  }, [articles]);

  // Filter articles for single category view
  const filteredArticles = useMemo(() => {
    if (!selectedCategory) return articles;
    return articles.filter(article => article.category === selectedCategory);
  }, [articles, selectedCategory]);

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

  // Single category view
  if (selectedCategory) {
    if (filteredArticles.length === 0) {
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
            No articles in this category
          </h2>
          <p className="font-sans text-base md:text-lg text-muted">
            Try another category
          </p>
        </div>
      );
    }

    const featured = filteredArticles[0];
    const listArticles = filteredArticles.slice(1, 4);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-1 md:gap-2">
        <div className="lg:row-span-3">
          <FeaturedArticle article={featured} priority={true} size="compact" />
        </div>
        {listArticles.map((article) => (
          <ArticleListItem
            key={article.id}
            article={article}
            isLast={true}
          />
        ))}
      </div>
    );
  }

  // "All" view - category-grouped layout
  return (
    <div className="flex flex-col">
      {CATEGORY_ORDER.map((category, categoryIdx) => {
        const categoryArticles = groupedArticles[category];
        if (!categoryArticles || categoryArticles.length === 0) {
          return null;
        }

        const featured = categoryArticles[0];
        const listArticles = categoryArticles.slice(1, 4);
        const isLastSection = categoryIdx === CATEGORY_ORDER.length - 1 ||
          CATEGORY_ORDER.slice(categoryIdx + 1).every(cat => !groupedArticles[cat]);

        return (
          <section
            key={category}
            className={`mb-12 lg:mb-16 pb-12 lg:pb-16 border-b border-border ${
              isLastSection ? 'last:border-b-0 last:pb-0 last:mb-0' : ''
            }`}
          >
            {/* Category Heading */}
            <h2 className="font-serif font-semibold text-2xl md:text-3xl text-foreground tracking-tight mb-6 md:mb-8">
              {category}
            </h2>

            {/* Featured + List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-1 md:gap-2">
              <div className="lg:row-span-3">
                <FeaturedArticle
                  article={featured}
                  priority={categoryIdx === 0}
                  size="compact"
                />
              </div>
              {listArticles.map((article) => (
                <ArticleListItem
                  key={article.id}
                  article={article}
                  isLast={true}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
