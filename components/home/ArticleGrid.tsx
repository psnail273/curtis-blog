import { Article } from '@/types/article';
import { MosaicCard } from './MosaicCard';
import { cn } from '@/lib/utils';

interface ArticleGridProps {
  articles: Article[];
  columns?: 2 | 3;
  highlightFirst?: boolean;
  showCategory?: boolean;
}

export function ArticleGrid({ articles, columns = 3, highlightFirst = false, showCategory = true }: ArticleGridProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'grid gap-4 md:gap-6',
      columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2'
    )}>
      {articles.map((article, index) => {
        const isHighlighted = highlightFirst && index === 0;

        return (
          <div
            key={article.id}
            className={cn(
              isHighlighted && columns === 3 && 'md:col-span-2',
              isHighlighted && columns === 2 && 'md:col-span-2'
            )}
          >
            <MosaicCard
              article={article}
              size={isHighlighted ? 'medium' : 'small'}
              showCategory={showCategory}
            />
          </div>
        );
      })}
    </div>
  );
}
