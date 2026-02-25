'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import type { Article } from '@/types/article';
import type { FileRecord } from '@/types/file';
import type { SearchResult, PastStream } from '@/types/search';

interface SearchModalProps {
  onClose: () => void;
}

const ARTICLE_LIMIT = 5;
const STREAM_LIMIT = 3;
const FILE_LIMIT = 3;

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [allStreams, setAllStreams] = useState<PastStream[]>([]);
  const [allFiles, setAllFiles] = useState<FileRecord[]>([]);

  const router = useRouter();
  const pathname = usePathname();
  const initialPathRef = useRef(pathname);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useFocusTrap<HTMLDivElement>(mounted);
  const debouncedQuery = useDebounce(query, 300);

  // Mount state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [articlesRes, filesRes, streamsRes] = await Promise.all([
        fetch('/api/articles').then((r) => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/files').then((r) => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/streams').then((r) => r.ok ? r.json() : { streams: [] }).catch(() => ({ streams: [] })),
      ]);

      setAllArticles(Array.isArray(articlesRes) ? articlesRes : []);
      setAllFiles(Array.isArray(filesRes) ? filesRes : []);
      setAllStreams(streamsRes?.streams ?? []);
      setIsLoading(false);
    }

    fetchData();
  }, []);

  // Close on route change (skip initial render)
  useEffect(() => {
    if (pathname !== initialPathRef.current) {
      onClose();
    }
  }, [pathname, onClose]);

  // ESC key handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter results based on debounced query
  const { filteredArticles, filteredStreams, filteredFiles } = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return { filteredArticles: [], filteredStreams: [], filteredFiles: [] };
    }

    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    const articles = allArticles
      .filter(
        (a) =>
          a.title?.toLowerCase().includes(normalizedQuery) ||
          a.category?.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, ARTICLE_LIMIT);

    const streams = allStreams
      .filter((s) => s.title?.toLowerCase().includes(normalizedQuery))
      .slice(0, STREAM_LIMIT);

    const files = allFiles
      .filter(
        (f) =>
          f.name?.toLowerCase().includes(normalizedQuery) ||
          f.description?.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, FILE_LIMIT);

    return { filteredArticles: articles, filteredStreams: streams, filteredFiles: files };
  }, [debouncedQuery, allArticles, allStreams, allFiles]);

  // Convert to SearchResult arrays
  const articleResults: SearchResult[] = filteredArticles.map((a) => ({ type: 'article', data: a }));
  const streamResults: SearchResult[] = filteredStreams.map((s) => ({ type: 'stream', data: s }));
  const fileResults: SearchResult[] = filteredFiles.map((f) => ({ type: 'file', data: f }));

  // Flat list for keyboard navigation
  const flatResults = useMemo(
    () => [...articleResults, ...streamResults, ...fileResults],
    [articleResults, streamResults, fileResults]
  );

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery]);

  // Navigate to a result
  const navigateToResult = useCallback(
    (result: SearchResult) => {
      if (result.type === 'article') {
        router.push(`/articles/${result.data.slug}`);
      } else if (result.type === 'stream') {
        window.open(result.data.url, '_blank', 'noopener,noreferrer');
      } else if (result.type === 'file') {
        window.open(result.data.url, '_blank', 'noopener,noreferrer');
      }
      onClose();
    },
    [router, onClose]
  );

  // Handle selecting a result by flat index
  const handleSelect = useCallback(
    (index: number) => {
      const result = flatResults[index];
      if (result) {
        navigateToResult(result);
      }
    },
    [flatResults, navigateToResult]
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        handleSelect(selectedIndex);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [flatResults.length, selectedIndex, handleSelect]);

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-xl mx-auto mt-[10vh] sm:mt-[15vh] px-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          className="bg-card border border-border rounded-xl shadow-warm-lg overflow-hidden animate-search-modal-enter"
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            inputRef={inputRef}
          />
          <SearchResults
            articles={articleResults}
            streams={streamResults}
            files={fileResults}
            selectedIndex={selectedIndex}
            isLoading={isLoading}
            hasQuery={debouncedQuery.trim().length > 0}
            query={debouncedQuery}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
