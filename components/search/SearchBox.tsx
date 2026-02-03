'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { mockArticles } from '@/lib/mock-articles';
import { Article } from '@/types/article';
import SearchDropdown from './SearchDropdown';
import Backdrop from './Backdrop';
import { SearchIcon } from './SearchIcon';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './SearchBox.module.scss';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown and reset query when route changes
  useEffect(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setQuery('');
  }, [pathname]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Recalculate position on window resize
  useEffect(() => {
    if (!isOpen) return;

    function handleResize() {
      if (searchRef.current) {
        const rect = searchRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width,
        });
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

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
      const target = event.target as Node;
      const isClickInSearchBox = searchRef.current?.contains(target);
      const isClickInDropdown = dropdownRef.current?.contains(target);
      
      if (!isClickInSearchBox && !isClickInDropdown) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close handler without clearing query (for clicking outside, pressing Escape)
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  // Select handler with query reset (for clicking/selecting a result)
  const handleSelect = useCallback((slug: string) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setQuery('');
    router.push(`/articles/${slug}`);
  }, [router]);

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
        handleSelect(selectedArticle.slug);
      }
    }
  }, [isOpen, results, selectedIndex, handleSelect]);

  return (
    <>
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
      </div>
      <Backdrop isVisible={isOpen} onClick={handleClose} />
      {isOpen && (
        <SearchDropdown
          ref={dropdownRef}
          results={results}
          query={query}
          selectedIndex={selectedIndex}
          onClose={handleSelect}
          position={dropdownPosition}
        />
      )}
    </>
  );
}
