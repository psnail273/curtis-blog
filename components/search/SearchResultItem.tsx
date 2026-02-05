'use client';

import { memo } from 'react';
import { Article } from '@/types/article';
import { cn } from '@/lib/utils';

interface SearchResultItemProps {
  article: Article;
  isSelected: boolean;
  onClick: (slug: string) => void;
}

function SearchResultItem({
  article,
  isSelected,
  onClick,
}: SearchResultItemProps) {
  if (!article || !article.slug) {
    console.warn('SearchResultItem: Invalid article data', article);
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling to backdrop
    onClick(article.slug);
  };

  return (
    <div
      className={cn(
        'search-result block px-4 py-3 border-b border-border transition-colors duration-200 cursor-pointer min-h-[44px] last:border-b-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2',
        isSelected && 'search-result-selected'
      )}
      onClick={handleClick}
      aria-selected={isSelected}
      role="option"
      tabIndex={0}
    >
      <div className="text-[0.9375rem] font-medium text-foreground line-clamp-2 leading-[1.4] mb-1.5">
        {article.title || 'Untitled'}
      </div>
      <div className="flex items-center gap-2 text-xs mb-1.5">
        <span className="search-category-badge px-1.5 py-0.5 text-accent rounded font-medium">
          {article.category || 'Uncategorized'}
        </span>
        <span className="text-muted">{article.readTime || 0} min read</span>
      </div>
      {article.excerpt && (
        <p className="text-[0.8125rem] text-muted line-clamp-2 leading-normal m-0">
          {article.excerpt}
        </p>
      )}
    </div>
  );
}

// Memoize to prevent re-renders unless props actually change
export default memo(SearchResultItem);
