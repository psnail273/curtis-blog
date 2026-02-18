'use client';

import { SearchResultGroup } from './SearchResultGroup';
import SearchResultItem from './SearchResultItem';
import type { SearchResult } from '@/types/search';

interface SearchResultsProps {
  articles: SearchResult[];
  streams: SearchResult[];
  files: SearchResult[];
  selectedIndex: number;
  isLoading: boolean;
  hasQuery: boolean;
  query: string;
  onSelect: (index: number) => void;
}

export function SearchResults({
  articles,
  streams,
  files,
  selectedIndex,
  isLoading,
  hasQuery,
  query,
  onSelect,
}: SearchResultsProps) {
  const totalResults = articles.length + streams.length + files.length;

  if (isLoading) {
    return (
      <div className="px-4 py-8 text-center" role="status" aria-label="Loading search data">
        <p className="text-muted text-sm">Loading...</p>
      </div>
    );
  }

  if (!hasQuery) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted text-sm">
          Start typing to search articles, streams, and files
        </p>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted text-sm">
          No results found for &ldquo;{query}&rdquo;
        </p>
      </div>
    );
  }

  // Build a flat index mapping: each result knows its global index
  let flatIndex = 0;

  return (
    <div
      role="listbox"
      aria-label="Search results"
      className="overflow-y-auto max-h-[calc(70vh-60px)]"
    >
      {articles.length > 0 && (
        <SearchResultGroup label="Articles" count={articles.length}>
          {articles.map((result) => {
            const idx = flatIndex++;
            return (
              <SearchResultItem
                key={`article-${result.data.id}`}
                result={result}
                isSelected={idx === selectedIndex}
                onClick={() => onSelect(idx)}
              />
            );
          })}
        </SearchResultGroup>
      )}

      {streams.length > 0 && (
        <SearchResultGroup label="Streams" count={streams.length}>
          {streams.map((result) => {
            const idx = flatIndex++;
            return (
              <SearchResultItem
                key={`stream-${result.data.id}`}
                result={result}
                isSelected={idx === selectedIndex}
                onClick={() => onSelect(idx)}
              />
            );
          })}
        </SearchResultGroup>
      )}

      {files.length > 0 && (
        <SearchResultGroup label="Files" count={files.length}>
          {files.map((result) => {
            const idx = flatIndex++;
            return (
              <SearchResultItem
                key={`file-${result.data.id}`}
                result={result}
                isSelected={idx === selectedIndex}
                onClick={() => onSelect(idx)}
              />
            );
          })}
        </SearchResultGroup>
      )}
    </div>
  );
}
