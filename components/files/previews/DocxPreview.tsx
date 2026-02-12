'use client';

import { useState, useEffect } from 'react';
import { FileIcon } from '@/components/files/FileIcon';
import type { FileRecord } from '@/types/file';

/** Maximum file size (in bytes) for inline DOCX preview. */
const MAX_PREVIEW_SIZE = 2 * 1024 * 1024; // 2MB

interface DocxPreviewProps {
  file: FileRecord;
}

/**
 * Fetches a DOCX file, converts it to HTML using mammoth.js, and renders inline.
 * Enforces a 2MB size limit. Falls back to metadata card on conversion error.
 */
export function DocxPreview({ file }: DocxPreviewProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function convertDocx() {
      try {
        setIsLoading(true);
        setError(null);

        // Check size limit before fetching
        if (file.size > MAX_PREVIEW_SIZE) {
          setError('File is too large for inline preview (max 2 MB).');
          return;
        }

        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (cancelled) return;

        // Dynamically import mammoth to keep it out of the main bundle
        const mammoth = await import('mammoth');
        if (cancelled) return;

        const result = await mammoth.convertToHtml({ arrayBuffer });
        if (cancelled) return;

        if (!result.value || result.value.trim().length === 0) {
          setError('Document appears to be empty.');
          return;
        }

        setHtml(result.value);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to convert document.';
        setError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    convertDocx();
    return () => { cancelled = true; };
  }, [file.url, file.size]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center justify-center py-8" role="status" aria-label="Loading document preview">
          <p className="text-sm text-muted">Converting document...</p>
        </div>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 rounded-lg border border-border bg-background text-center">
        <div className="text-accent mb-3">
          <FileIcon type="document" size={48} />
        </div>
        <p className="text-sm text-muted">
          {error || 'Document preview could not be loaded.'}
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
        <FileIcon type="document" size={14} className="text-accent" />
        <span className="text-xs text-caption font-medium truncate">
          {file.name}
        </span>
      </div>
      <div
        className="p-4 md:p-6 overflow-y-auto max-h-[400px] docx-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
