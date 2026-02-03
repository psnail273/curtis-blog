'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Article } from '@/types/article';
import styles from './SearchResultItem.module.scss';

interface SearchResultItemProps {
  article: Article;
  isSelected: boolean;
  onClick: () => void;
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

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`${styles.result} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
      aria-selected={isSelected}
    >
      <div className={styles.resultTitle}>{article.title || 'Untitled'}</div>
      <div className={styles.resultMeta}>
        <span className={styles.category}>{article.category || 'Uncategorized'}</span>
        <span className={styles.readTime}>{article.readTime || 0} min read</span>
      </div>
      {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
    </Link>
  );
}

// Memoize to prevent re-renders unless props actually change
export default memo(SearchResultItem);
