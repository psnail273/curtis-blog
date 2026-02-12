'use client';

import { forwardRef } from 'react';
import { Article } from '@/types/article';
import { cn } from '@/lib/utils';
import SearchResultItem from './SearchResultItem';

interface SearchDropdownProps {
  results: Article[];
  query: string;
  selectedIndex: number;
  onClose: (slug: string) => void;
  position: { top: number; left: number; width: number };
  /** When true, render inline (relative positioning) instead of fixed positioning */
  inline?: boolean;
}

const SearchDropdownComponent = forwardRef<HTMLDivElement, SearchDropdownProps>(({
  results,
  query,
  selectedIndex,
  onClose,
  position,
  inline = false,
}, ref) => {
  // Fixed positioning for desktop, no inline styles for mobile (uses flow layout)
  const dropdownStyle: React.CSSProperties = inline
    ? {}
    : {
      top: `${position.top}px`,
      left: `${position.left}px`,
      width: `${position.width}px`,
      maxWidth: 'calc(100vw - 16px)',
    };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      className={cn(
        'bg-card border border-border rounded-lg shadow-warm-lg max-h-[400px] overflow-y-auto pointer-events-auto',
        inline
          ? 'relative w-full mt-2 z-10'
          : 'fixed z-[1001]'
      )}
      style={dropdownStyle}
      onClick={handleDropdownClick}
      role="listbox"
      aria-label="Search results"
    >
      {results.length === 0 ? (
        <div className="py-6 px-4 text-center text-muted text-sm">
          No articles found for &quot;{query}&quot;
        </div>
      ) : (
        results.map((article, index) => (
          <SearchResultItem
            key={article.id}
            article={article}
            isSelected={index === selectedIndex}
            onClick={(slug) => {
              onClose(slug);
            }}
          />
        ))
      )}
    </div>
  );
});

SearchDropdownComponent.displayName = 'SearchDropdown';

export default SearchDropdownComponent;
