import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Article } from '@/types/article';
import { MosaicCard } from './MosaicCard';
import { ArticleCard } from './ArticleCard';
import { getCategoryStyle } from '@/lib/category-colors';
import { cn } from '@/lib/utils';

interface CategoryArticlesProps {
  articles: Article[];
  category: string;
  limit?: number;
  showMoreHref?: string;
  priority?: boolean;
  showCategory?: boolean;
}

export function CategoryArticles({
  articles,
  category,
  limit,
  showMoreHref,
  priority = false,
  showCategory = false,
}: CategoryArticlesProps) {
  if (articles.length === 0) return null;

  const displayArticles = limit ? articles.slice(0, limit) : articles;
  const featuredArticle = displayArticles[0];
  const restArticles = displayArticles.slice(1);

  return (
    <div className="flex flex-col gap-4 md:gap-5" style={getCategoryStyle(category)}>
      {/* 2-column grid: featured left spanning all rows, articles right */}
      <div
        className={cn(
          'gap-4 md:gap-5',
          restArticles.length > 0
            ? 'grid grid-cols-1 md:grid-cols-2'
            : 'flex flex-col'
        )}
        style={restArticles.length > 0 ? {
          gridTemplateRows: `repeat(${restArticles.length}, 1fr)`
        } as React.CSSProperties : undefined}
      >
        {/* Featured (most recent) article — spans all rows */}
        <div className={cn(restArticles.length > 0 && 'md:row-span-full')}>
          <MosaicCard
            article={featuredArticle}
            size={restArticles.length > 0 ? 'hero' : 'medium'}
            priority={priority}
            showCategory={showCategory}
            featured
            className="h-full"
          />
        </div>

        {/* Right column: each article occupies one grid row */}
        {restArticles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* "View All" link — outside fluid group so it doesn't shift */}
      {showMoreHref && (
        <Link
          href={showMoreHref}
          className={cn(
            'inline-flex items-center gap-1.5 text-sm font-medium',
            'category-color hover:underline transition-colors self-end'
          )}
        >
          View All
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
