'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { mockArticles } from '@/lib/mock-articles';
import { Article } from '@/types/article';
import SearchDropdown from './SearchDropdown';
import { SearchIcon } from './SearchIcon';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './SearchBox.module.scss';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [pathname]);

  // Search effect using debounced query
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      try {
        const normalizedQuery = debouncedQuery.trim().replace(/\s+/g, ' ').toLowerCase();

        const filtered = mockArticles.filter((article) => {
          if (!article.title || !article.category || !article.slug) {
            console.warn('Article missing required fields:', article.id);
            return false;
          }

          return (
            article.title.toLowerCase().includes(normalizedQuery) ||
            article.category.toLowerCase().includes(normalizedQuery)
          );
        });

        setResults(filtered);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error filtering articles:', error);
        setResults([]);
      }
    } else {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [debouncedQuery]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedArticle = results[selectedIndex];
      if (selectedArticle?.slug) {
        window.location.href = `/articles/${selectedArticle.slug}`;
      }
    }
  }, [isOpen, results, selectedIndex]);

  // Memoized close handler
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  return (
    <div ref={searchRef} className={styles.searchBox}>
      <div className={styles.inputWrapper}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.input}
          aria-label="Search articles"
        />
      </div>
      {isOpen && (
        <SearchDropdown
          results={results}
          query={query}
          selectedIndex={selectedIndex}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
