'use client';

import { memo } from 'react';
import { Article } from '@/types/article';
import styles from './SearchResultItem.module.scss';

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
      className={`${styles.result} ${isSelected ? styles.selected : ''}`}
      onClick={handleClick}
      aria-selected={isSelected}
      role="option"
      tabIndex={0}
    >
      <div className={styles.resultTitle}>{article.title || 'Untitled'}</div>
      <div className={styles.resultMeta}>
        <span className={styles.category}>{article.category || 'Uncategorized'}</span>
        <span className={styles.readTime}>{article.readTime || 0} min read</span>
      </div>
      {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
    </div>
  );
}

// Memoize to prevent re-renders unless props actually change
export default memo(SearchResultItem);
