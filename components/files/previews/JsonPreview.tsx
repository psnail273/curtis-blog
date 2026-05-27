'use client';

import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileIcon } from '@/components/files/FileIcon';
import type { FileRecord } from '@/types/file';

/** Maximum file size (in bytes) for inline preview. */
const MAX_PREVIEW_SIZE = 100 * 1024; // 100KB

interface JsonPreviewProps {
  file: FileRecord;
}

/**
 * Fetches and displays JSON content with syntax highlighting.
 * Enforces a 100KB size limit. Falls back to metadata card on error.
 */
export function JsonPreview({ file }: JsonPreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      try {
        setIsLoading(true);
        setError(null);

        // Check size limit before fetching
        if (file.size > MAX_PREVIEW_SIZE) {
          setError('File is too large for inline preview.');
          return;
        }

        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file (${response.status})`);
        }

        const text = await response.text();
        if (cancelled) return;

        // Try to parse and pretty-print JSON
        try {
          const parsed = JSON.parse(text);
          setContent(JSON.stringify(parsed, null, 2));
        } catch {
          // If not valid JSON, show raw text
          setContent(text);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load content.';
        setError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchContent();
    return () => { cancelled = true; };
  }, [file.url, file.size]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center justify-center py-8" role="status" aria-label="Loading JSON preview">
          <p className="text-sm text-muted">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 rounded-lg border border-border bg-background text-center">
        <div className="text-accent mb-3">
          <FileIcon type="code" size={48} />
        </div>
        <p className="text-sm text-muted">
          {error || 'JSON preview could not be loaded.'}
        </p>
        <p className="text-xs text-caption mt-1">
          Use the buttons below to download or open externally.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
        <FileIcon type="code" size={14} className="text-accent" />
        <span className="text-xs text-caption font-medium truncate">
          {file.name}
        </span>
      </div>
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto text-sm">
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={{ background: 'transparent', padding: '1rem', margin: 0 }}
          showLineNumbers
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            opacity: 0.6,
            userSelect: 'none',
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
