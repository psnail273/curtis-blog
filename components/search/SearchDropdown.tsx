'use client';

import { forwardRef } from 'react';
import { Article } from '@/types/article';
import SearchResultItem from './SearchResultItem';

interface SearchDropdownProps {
  results: Article[];
  query: string;
  selectedIndex: number;
  onClose: (slug: string) => void;
  position: { top: number; left: number; width: number };
}

const SearchDropdownComponent = forwardRef<HTMLDivElement, SearchDropdownProps>(({
  results,
  query,
  selectedIndex,
  onClose,
  position,
}, ref) => {
  const dropdownStyle = {
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: `${position.width}px`,
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      className="fixed bg-card border border-border rounded-lg shadow-warm-lg max-h-[400px] overflow-y-auto z-[1001] pointer-events-auto"
      style={dropdownStyle}
      onClick={handleDropdownClick}
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
