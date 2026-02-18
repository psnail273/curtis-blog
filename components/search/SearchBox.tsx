'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Article } from '@/types/article';
import SearchDropdown from './SearchDropdown';
import Backdrop from './Backdrop';
import { SearchIcon } from './SearchIcon';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  // Fetch articles from the API on mount for client-side search
  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch('/api/articles');
        if (res.ok) {
          const data = await res.json();
          setAllArticles(data);
        }
      } catch (error) {
        console.error('Error loading articles for search:', error);
      }
    }
    loadArticles();
  }, []);

  // Detect mobile viewport (matches the lg:hidden breakpoint used by MobileNav)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    setIsMobile(mql.matches);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
    }

    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  // Close dropdown and reset query when route changes
  useEffect(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
    setQuery('');
  }, [pathname]);

  // Calculate dropdown position when opening (desktop only)
  useEffect(() => {
    if (isOpen && searchRef.current && !isMobile) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, isMobile]);

  // Recalculate position on window resize (desktop only)
  useEffect(() => {
    if (!isOpen || isMobile) return;

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
  }, [isOpen, isMobile]);

  // Search effect using debounced query
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      try {
        const normalizedQuery = debouncedQuery.trim().replace(/\s+/g, ' ').toLowerCase();

        const filtered = allArticles.filter((article) => {
          if (!article.title || !article.category || !article.slug) {
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
  }, [debouncedQuery, allArticles]);

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

  // Scroll search input into view when focused on mobile (helps with virtual keyboard)
  const handleFocus = useCallback(() => {
    if (!isMobile) return;

    // Small delay to let the virtual keyboard begin rendering
    setTimeout(() => {
      searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }, [isMobile]);

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
      <div ref={searchRef} className="relative w-full max-w-full sm:max-w-[400px]">
        <div className="search-input-wrapper flex items-center gap-2 px-3 py-2 bg-background rounded-lg transition-all duration-200 text-muted min-h-[44px]">
          <SearchIcon />
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            className="flex-1 border-none outline-none bg-transparent text-body text-base font-sans min-w-0 placeholder:text-caption pl-1"
            aria-label="Search articles"
          />
        </div>

        {/* On mobile, render dropdown inline within the search container */}
        {isMobile && isOpen && (
          <SearchDropdown
            ref={dropdownRef}
            results={results}
            query={query}
            selectedIndex={selectedIndex}
            onClose={handleSelect}
            position={dropdownPosition}
            inline
          />
        )}
      </div>

      {/* On desktop, render backdrop and fixed-position dropdown */}
      {!isMobile && <Backdrop isVisible={isOpen} onClick={handleClose} />}
      {!isMobile && isOpen && (
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
