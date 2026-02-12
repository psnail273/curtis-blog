'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileIcon } from '@/components/files/FileIcon';
import { FilePreview } from '@/components/files/FilePreview';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/lib/utils';
import { formatDate, formatFileSize, capitalizeType } from '@/components/files/utils';
import type { FileRecord } from '@/types/file';

interface FileDetailModalProps {
  fileId: string;
  onClose: () => void;
}

export function FileDetailModal({ fileId, onClose }: FileDetailModalProps) {
  const [file, setFile] = useState<FileRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<Element | null>(null);
  const modalRef = useFocusTrap<HTMLDivElement>(mounted && !isLoading && !error);

  // Capture the triggering element on mount so we can restore focus on close
  useEffect(() => {
    triggerRef.current = document.activeElement;
    setMounted(true);

    return () => {
      // Restore focus to the element that triggered the modal
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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

  // Fetch file details
  const fetchFile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/files/${fileId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found.');
        }
        throw new Error(`Failed to load file details (${response.status}).`);
      }
      const data: FileRecord = await response.json();
      setFile(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={file ? 'file-modal-title' : undefined}
        aria-label={file ? undefined : 'File details'}
        className={cn(
          'relative z-10 flex flex-col bg-card border border-border shadow-warm-lg',
          // Mobile: full screen with some padding
          'inset-2 fixed md:inset-auto',
          // Desktop: centered card with max width
          'md:relative md:w-full md:max-w-2xl md:max-h-[90vh] md:rounded-xl',
          // Rounded on mobile too
          'rounded-xl',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          {file ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 text-accent">
                <FileIcon type={file.type} size={22} />
              </div>
              <h2
                id="file-modal-title"
                className="text-lg font-semibold text-foreground truncate !mb-0"
              >
                {file.name}
              </h2>
            </div>
          ) : (
            <div className="h-6" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close file details"
            className="shrink-0 ml-2"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isLoading && (
            <div className="flex items-center justify-center py-16" role="status" aria-label="Loading file details">
              <p className="text-muted text-lg">Loading file details...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
              <AlertCircle size={36} className="text-destructive mb-3" aria-hidden="true" />
              <p className="text-foreground font-medium mb-2">Could not load file</p>
              <p className="text-sm text-muted mb-6">{error}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={fetchFile}>
                  <RefreshCw size={16} />
                  Retry
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {file && !isLoading && !error && (
            <div className="space-y-5">
              {/* Preview */}
              <FilePreview file={file} />

              {/* Description */}
              {file.description && (
                <p className="text-body text-sm leading-relaxed">
                  {file.description}
                </p>
              )}

              {/* Metadata grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <MetadataItem label="Type" value={capitalizeType(file.type)} />
                <MetadataItem label="Size" value={formatFileSize(file.size)} />
                <MetadataItem label="Uploaded" value={formatDate(file.uploadDate)} />
                <MetadataItem label="Path" value={file.path} />
                {file.metadata.author && (
                  <MetadataItem label="Author" value={file.metadata.author} />
                )}
                {file.metadata.language && (
                  <MetadataItem label="Language" value={file.metadata.language} />
                )}
                {file.metadata.dimensions && (
                  <MetadataItem
                    label="Dimensions"
                    value={`${file.metadata.dimensions.width} x ${file.metadata.dimensions.height}`}
                  />
                )}
                {file.metadata.duration !== undefined && (
                  <MetadataItem
                    label="Duration"
                    value={`${Math.floor(file.metadata.duration / 60)}:${String(file.metadata.duration % 60).padStart(2, '0')}`}
                  />
                )}
              </div>

              {/* Tags */}
              {file.metadata.tags && file.metadata.tags.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-caption uppercase tracking-wider">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {file.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        {file && !isLoading && !error && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border shrink-0">
            <Button variant="outline" asChild>
              <a
                href={file.url}
                download={file.name}
                aria-label={`Download ${file.name}`}
              >
                <Download size={16} />
                Download
              </a>
            </Button>
            <Button asChild>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${file.name} in new tab`}
              >
                <ExternalLink size={16} />
                Open
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/** Small helper component for metadata key-value pairs. */
function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <span className="text-xs font-medium text-caption uppercase tracking-wider">
        {label}
      </span>
      <p className="text-foreground truncate mt-0.5" title={value}>
        {value}
      </p>
    </div>
  );
}
