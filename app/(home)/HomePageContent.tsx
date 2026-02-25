'use client';

import { Fragment, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { Article } from '@/types/article';
import { HeroMosaic } from '@/components/home/HeroMosaic';
import { CategoryArticles } from '@/components/home/CategoryArticles';
import { CategoryFilterView } from '@/components/home/CategoryFilterView';
import { getCategoryStyle } from '@/lib/category-colors';

const CATEGORY_LIMIT = 4;

function CategoryHeader({ category }: { category: string }) {
  return (
    <div style={getCategoryStyle(category)}>
      <h2 className="font-serif text-lg md:text-xl font-medium category-color uppercase tracking-wide pl-3 border-l-[3px] border-current">
        {category}
      </h2>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="py-16 md:py-24 text-center">
      <div className="mb-4 text-muted" aria-hidden="true">
        <FileText className="w-16 h-16 mx-auto" />
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">{title}</h2>
      <p className="font-sans text-base md:text-lg text-muted">{description}</p>
    </div>
  );
}

interface HomePageContentProps {
  heroArticles: Article[];
  articles: Article[];
  categories: string[];
}

export function HomePageContent({ heroArticles, articles }: HomePageContentProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  const displayArticles = useMemo(() => {
    if (activeCategory) {
      return articles.filter(a => a.category === activeCategory);
    }
    return articles;
  }, [articles, activeCategory]);

  const groupedByCategory = useMemo(() => {
    if (activeCategory) return null;
    const groups = new Map<string, Article[]>();
    displayArticles.forEach(article => {
      const existing = groups.get(article.category);
      if (existing) {
        existing.push(article);
      } else {
        groups.set(article.category, [article]);
      }
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, 'en'));
  }, [displayArticles, activeCategory]);

  // Empty state - no articles at all
  if (articles.length === 0) {
    return <EmptyState title="No articles yet" description="Check back soon for new content" />;
  }

  // Category-specific view: empty category
  if (activeCategory && displayArticles.length === 0) {
    return (
      <EmptyState
        title={`No articles in ${activeCategory}`}
        description={`Check back soon for new ${activeCategory} content`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-[var(--section-gap-mobile)] md:gap-[var(--section-gap)]">
      {/* Hero mosaic — most recent articles in "All" view */}
      {!activeCategory && heroArticles.length > 0 && (
        <HeroMosaic articles={heroArticles} />
      )}

      {/* Thin divider between hero and category groups */}
      {!activeCategory && heroArticles.length > 0 && displayArticles.length > 0 && (
        <hr className="editorial-rule" />
      )}

      {/* Category groups — narrower container for text-heavy content */}
      <div className="w-full flex flex-col gap-[var(--section-gap-mobile)] md:gap-[var(--section-gap)]">
        {/* Category groups with headers and inter-group separators (All view) */}
        {groupedByCategory?.map(([category, catArticles], groupIndex) => (
          <Fragment key={category}>
            {groupIndex > 0 && <hr className="editorial-rule" />}
            <section aria-label={`${category} articles`}>
              <div className="flex flex-col gap-4 md:gap-5">
                <CategoryHeader category={category} />
                <CategoryArticles
                  articles={catArticles}
                  category={category}
                  limit={CATEGORY_LIMIT}
                  showMoreHref={`/?category=${encodeURIComponent(category)}`}
                  priority={groupIndex === 0 && heroArticles.length === 0}
                  showCategory={false}
                />
              </div>
            </section>
          </Fragment>
        ))}

        {/* Category filter view — hero + 4-column grid */}
        {activeCategory && (
          <CategoryFilterView
            articles={displayArticles}
            category={activeCategory}
            priority={heroArticles.length === 0}
          />
        )}
      </div>
    </div>
  );
}
