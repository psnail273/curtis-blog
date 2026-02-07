'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FileTypeFilter } from '@/components/files/FileTypeFilter';
import { FileSearchBar } from '@/components/files/FileSearchBar';
import { FileList } from '@/components/files/FileList';
import { FileDetailModal } from '@/components/files/FileDetailModal';
import type { FileRecord, FileType } from '@/types/file';

/**
 * Client component that orchestrates file browsing state:
 * fetching, searching, filtering files, and managing the detail modal.
 */
export function FilesPageContent() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FileType | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/files');
        if (!response.ok) {
          throw new Error(`Failed to fetch files (${response.status})`);
        }
        const data: FileRecord[] = await response.json();
        setFiles(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    let result = files;

    // Filter by type
    if (selectedType) {
      result = result.filter((file) => file.type === selectedType);
    }

    // Filter by search query (case-insensitive name match)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((file) =>
        file.name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [files, selectedType, searchQuery]);

  const handleFileClick = useCallback((fileId: string) => {
    setSelectedFileId(fileId);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedFileId(null);
  }, []);

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Page Header */}
      <header className="mb-12 md:mb-16">
        <h1 className="mb-6">Files</h1>

        <p className="text-lg md:text-xl leading-relaxed mb-6 max-w-2xl text-muted">
          Shared resources, code samples, and media files available for browsing and download.
        </p>

        {/* Decorative separator */}
        <div
          className="w-16 h-[3px] rounded-full bg-accent"
          aria-hidden="true"
        />
      </header>

      {/* Search bar */}
      <div className="mb-6">
        <FileSearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Type filter */}
      <div className="mb-8 md:mb-14">
        <FileTypeFilter
          selectedType={selectedType}
          onSelect={setSelectedType}
        />
      </div>

      {/* Content area: loading, error, empty, or file list */}
      {isLoading ? (
        <div className="text-center py-20" role="status" aria-label="Loading files">
          <p className="text-lg md:text-xl text-muted">Loading files...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20" role="alert">
          <p className="text-lg md:text-xl text-muted mb-4">
            Something went wrong loading the files.
          </p>
          <p className="text-sm text-caption">{error}</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <p className="text-center py-20 text-lg md:text-xl text-muted">
          {searchQuery || selectedType
            ? 'No files match your current filters. Try adjusting your search or filter.'
            : 'No files available yet. Check back soon.'}
        </p>
      ) : (
        <FileList files={filteredFiles} onFileClick={handleFileClick} />
      )}

      {/* File detail modal */}
      {selectedFileId && (
        <FileDetailModal
          fileId={selectedFileId}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
