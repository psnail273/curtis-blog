'use client';

import { forwardRef } from 'react';
import { Article } from '@/types/article';
import SearchResultItem from './SearchResultItem';
import styles from './SearchDropdown.module.scss';

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
      className={styles.dropdown}
      style={dropdownStyle}
      onClick={handleDropdownClick}
    >
      {results.length === 0 ? (
        <div className={styles.noResults}>
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
