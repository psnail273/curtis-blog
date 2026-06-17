'use client';

import { Fragment, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { Article } from '@/types/article';
import { HeroMosaic } from '@/components/home/HeroMosaic';
import { CategoryArticles } from '@/components/home/CategoryArticles';
import { getCategoryStyle } from '@/lib/category-colors';
import { categoryToTag } from '@/lib/article-utils';

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
  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, Article[]>();
    articles.forEach(article => {
      const existing = groups.get(article.category);
      if (existing) {
        existing.push(article);
      } else {
        groups.set(article.category, [article]);
      }
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b, 'en'));
  }, [articles]);

  // Empty state - no articles at all
  if (articles.length === 0) {
    return <EmptyState title="No articles yet" description="Check back soon for new content" />;
  }

  return (
    <div className="flex flex-col gap-[var(--section-gap-mobile)] md:gap-[var(--section-gap)]">
      {/* Hero mosaic — most recent articles */}
      {heroArticles.length > 0 && (
        <HeroMosaic articles={heroArticles} />
      )}

      {/* Thin divider between hero and category groups */}
      {heroArticles.length > 0 && articles.length > 0 && (
        <hr className="editorial-rule" />
      )}

      {/* Category groups — narrower container for text-heavy content */}
      <div className="w-full flex flex-col gap-[var(--section-gap-mobile)] md:gap-[var(--section-gap)]">
        {groupedByCategory.map(([category, catArticles], groupIndex) => (
          <Fragment key={category}>
            {groupIndex > 0 && <hr className="editorial-rule" />}
            <section aria-label={`${category} articles`}>
              <div className="flex flex-col gap-4 md:gap-5">
                <CategoryHeader category={category} />
                <CategoryArticles
                  articles={catArticles}
                  category={category}
                  limit={CATEGORY_LIMIT}
                  showMoreHref={`/articles/${categoryToTag(category)}`}
                  priority={groupIndex === 0 && heroArticles.length === 0}
                  showCategory={false}
                />
              </div>
            </section>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
