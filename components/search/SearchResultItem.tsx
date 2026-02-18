'use client';

import { memo, useRef, useEffect } from 'react';
import { FileText, Video, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult, PastStream } from '@/types/search';
import type { Article } from '@/types/article';
import type { FileRecord } from '@/types/file';

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}

function ArticleContent({ data }: { data: Article }) {
  return (
    <>
      <FileText size={18} className="shrink-0 mt-0.5 text-muted" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="text-[0.9375rem] font-medium text-foreground truncate leading-snug">
          {data.title}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="search-category-badge px-1.5 py-0.5 text-accent rounded font-medium">
            {data.category}
          </span>
          <span className="text-muted">{data.readTime} min read</span>
        </div>
        {data.excerpt && (
          <p className="text-xs text-muted truncate mt-1 m-0">{data.excerpt}</p>
        )}
      </div>
    </>
  );
}

function StreamContent({ data }: { data: PastStream }) {
  const platformColors = data.platform === 'twitch'
    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
    : 'bg-red-500/10 text-red-600 dark:text-red-400';

  return (
    <>
      <Video size={18} className="shrink-0 mt-0.5 text-muted" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="text-[0.9375rem] font-medium text-foreground truncate leading-snug">
          {data.title}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className={cn('px-1.5 py-0.5 rounded font-medium capitalize', platformColors)}>
            {data.platform}
          </span>
          <span className="text-muted">{data.duration}</span>
        </div>
      </div>
    </>
  );
}

function FileContent({ data }: { data: FileRecord }) {
  return (
    <>
      <File size={18} className="shrink-0 mt-0.5 text-muted" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="text-[0.9375rem] font-medium text-foreground truncate leading-snug">
          {data.name}
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="search-category-badge px-1.5 py-0.5 text-accent rounded font-medium capitalize">
            {data.type}
          </span>
        </div>
        {data.description && (
          <p className="text-xs text-muted truncate mt-1 m-0">{data.description}</p>
        )}
      </div>
    </>
  );
}

function SearchResultItemComponent({ result, isSelected, onClick }: SearchResultItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isSelected]);

  return (
    <div
      ref={ref}
      className={cn(
        'search-result flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 min-h-[44px]',
        'focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2',
        isSelected && 'search-result-selected'
      )}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
    >
      {result.type === 'article' && <ArticleContent data={result.data} />}
      {result.type === 'stream' && <StreamContent data={result.data} />}
      {result.type === 'file' && <FileContent data={result.data} />}
    </div>
  );
}

export default memo(SearchResultItemComponent);
