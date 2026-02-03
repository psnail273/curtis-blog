'use client';

import { memo } from 'react';
import { Article } from '@/types/article';
import SearchResultItem from './SearchResultItem';
import styles from './SearchDropdown.module.scss';

interface SearchDropdownProps {
  results: Article[];
  query: string;
  selectedIndex: number;
  onClose: () => void;
}

function SearchDropdown({
  results,
  query,
  selectedIndex,
  onClose,
}: SearchDropdownProps) {
  if (results.length === 0) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.noResults}>
          No articles found for &quot;{query}&quot;
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dropdown}>
      {results.map((article, index) => (
        <SearchResultItem
          key={article.id}
          article={article}
          isSelected={index === selectedIndex}
          onClick={onClose}
        />
      ))}
    </div>
  );
}

// Custom comparison to prevent re-render if results array hasn't changed
function areEqual(prevProps: SearchDropdownProps, nextProps: SearchDropdownProps) {
  return (
    prevProps.query === nextProps.query &&
    prevProps.selectedIndex === nextProps.selectedIndex &&
    prevProps.results.length === nextProps.results.length &&
    prevProps.results.every((item, index) => item.id === nextProps.results[index]?.id)
  );
}

export default memo(SearchDropdown, areEqual);
