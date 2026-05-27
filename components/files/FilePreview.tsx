'use client';

import dynamic from 'next/dynamic';
import type { FileRecord } from '@/types/file';
import { FileIcon } from '@/components/files/FileIcon';

interface FilePreviewProps {
  file: FileRecord;
}

/** Shared loading placeholder for lazy-loaded preview components. */
function PreviewLoading() {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="flex items-center justify-center py-8" role="status" aria-label="Loading preview">
        <p className="text-sm text-muted">Loading preview...</p>
      </div>
    </div>
  );
}

// Lazy-load preview sub-components to minimize initial bundle size
const PdfPreview = dynamic(
  () => import('@/components/files/previews/PdfPreview').then(mod => ({ default: mod.PdfPreview })),
  { loading: () => <PreviewLoading /> }
);

const VideoPreview = dynamic(
  () => import('@/components/files/previews/VideoPreview').then(mod => ({ default: mod.VideoPreview })),
  { loading: () => <PreviewLoading /> }
);

const JsonPreview = dynamic(
  () => import('@/components/files/previews/JsonPreview').then(mod => ({ default: mod.JsonPreview })),
  { loading: () => <PreviewLoading /> }
);

const MarkdownPreview = dynamic(
  () => import('@/components/files/previews/MarkdownPreview').then(mod => ({ default: mod.MarkdownPreview })),
  { loading: () => <PreviewLoading /> }
);

const DocxPreview = dynamic(
  () => import('@/components/files/previews/DocxPreview').then(mod => ({ default: mod.DocxPreview })),
  { loading: () => <PreviewLoading /> }
);

export function FilePreview({ file }: FilePreviewProps) {
  if (file.type === 'image') {
    return (
      <div className="flex items-center justify-center bg-background rounded-lg border border-border overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.url}
          alt={file.description || file.name}
          loading="lazy"
          className="max-w-full max-h-[400px] object-contain"
        />
      </div>
    );
  }

  if (file.type === 'pdf') {
    return <PdfPreview file={file} />;
  }

  if (file.type === 'video') {
    return <VideoPreview file={file} />;
  }

  const ext = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase();

  if (ext === 'json') {
    return <JsonPreview file={file} />;
  }

  if (ext === 'md' || ext === 'markdown') {
    return <MarkdownPreview file={file} />;
  }

  if (ext === 'docx' || ext === 'doc') {
    return <DocxPreview file={file} />;
  }

  // Code preview (unchanged)
  if (file.type === 'code') {
    return (
      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
          <FileIcon type="code" size={14} className="text-accent" />
          <span className="text-xs text-caption font-medium truncate">
            {file.name}
            {file.metadata.language && (
              <span className="ml-2 text-muted">({file.metadata.language})</span>
            )}
          </span>
        </div>
        <div className="p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
          <p className="text-sm text-muted italic">
            Preview not available for code files. Use the download or external link button below to view the full content.
          </p>
        </div>
      </div>
    );
  }

  // Fallback for document, other, and unrecognized types
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 rounded-lg border border-border bg-background text-center">
      <div className="text-accent mb-3">
        <FileIcon type={file.type} size={48} />
      </div>
      <p className="text-sm text-muted">
        Preview is not available for this file type.
      </p>
      <p className="text-xs text-caption mt-1">
        Use the buttons below to download or open externally.
      </p>
    </div>
  );
}
