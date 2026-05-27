'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/file-utils';
import { formatDateShort } from '@/lib/format-utils';
import { FileIcon } from '@/components/files/FileIcon';
import type { FileRecord } from '@/types/file';

const FILE_TYPE_COLORS: Record<string, string> = {
  code: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  pdf: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  image: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  document: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export function FilesManager() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/files');
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  async function handleUpload(file: File) {
    clearMessages();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description.trim()) formData.append('description', description.trim());

      const res = await fetch('/api/admin/files', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessMessage(`"${file.name}" uploaded successfully.`);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  async function handleDelete(id: string) {
    clearMessages();

    try {
      const res = await fetch(`/api/admin/files/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete file');
      }
      setDeleteConfirm(null);
      setSuccessMessage('File deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      setDeleteConfirm(null);
    }
  }

  function startEditing(file: FileRecord) {
    setEditingFileId(file.id);
    setEditDescription(file.description || '');
    setDeleteConfirm(null);
    clearMessages();
  }

  function cancelEditing() {
    setEditingFileId(null);
    setEditDescription('');
  }

  async function handleEditSave(id: string) {
    clearMessages();
    setEditSaving(true);

    try {
      const res = await fetch(`/api/admin/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDescription }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update file');
      }

      const updatedFile: FileRecord = await res.json();
      setFiles((prev) => prev.map((f) => (f.id === id ? updatedFile : f)));
      setEditingFileId(null);
      setEditDescription('');
      setSuccessMessage('File updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file');
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-6">Files</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm" role="status">
          {successMessage}
        </div>
      )}

      {/* Upload area */}
      <div className="mb-8 border border-border rounded-lg p-5">
        <h3 className="text-sm font-medium mb-4">Upload File</h3>

        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4',
            dragOver
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-accent/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted">Uploading...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted mb-2">
                Drag and drop a file here, or
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Browse files
              </button>
              <p className="text-xs text-muted mt-2">Max file size: 4.5 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Select file to upload"
              />
            </>
          )}
        </div>

        <div>
          <label htmlFor="file-description" className="block text-sm font-medium mb-1.5">
            Description <span className="text-xs text-muted">(optional)</span>
          </label>
          <input
            id="file-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            placeholder="Brief description of the file"
            disabled={uploading}
          />
        </div>
      </div>

      {/* File list */}
      {loading ? (
        <p className="text-muted py-8 text-center">Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-muted py-8 text-center">
          No files uploaded yet. Drag files here to upload.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 font-medium text-muted">Name</th>
                <th className="py-3 pr-4 font-medium text-muted hidden sm:table-cell">Type</th>
                <th className="py-3 pr-4 font-medium text-muted hidden md:table-cell">Size</th>
                <th className="py-3 pr-4 font-medium text-muted hidden lg:table-cell">Uploaded</th>
                <th className="py-3 font-medium text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-border/50">
                  {editingFileId === file.id ? (
                    <td colSpan={5} className="py-3 pr-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileIcon type={file.type} size={16} className="shrink-0 text-muted" />
                          <span className="font-medium text-foreground text-sm">{file.name}</span>
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-description-${file.id}`}
                            className="block text-xs font-medium mb-1 text-muted"
                          >
                            Description
                          </label>
                          <input
                            id={`edit-description-${file.id}`}
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
                            placeholder="Brief description of the file"
                            disabled={editSaving}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSave(file.id)}
                            disabled={editSaving}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent-hover transition-colors disabled:opacity-50"
                          >
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={editSaving}
                            className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent/5 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FileIcon type={file.type} size={16} className="shrink-0 text-muted" />
                          <div className="min-w-0">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:text-accent transition-colors truncate block"
                              title={file.name}
                            >
                              {file.name}
                            </a>
                            <span className="block text-xs text-muted sm:hidden mt-0.5">
                              {file.type}
                              {' \u00B7 '}
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-xs font-medium',
                            FILE_TYPE_COLORS[file.type] || FILE_TYPE_COLORS.other
                          )}
                        >
                          {file.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted hidden md:table-cell">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-3 pr-4 text-muted hidden lg:table-cell">
                        {formatDateShort(file.uploadDate)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditing(file)}
                            className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent/5 transition-colors"
                          >
                            Edit
                          </button>
                          {deleteConfirm === file.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="px-3 py-1 text-xs font-medium rounded-md bg-destructive text-white hover:opacity-90 transition-opacity"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent/5 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(file.id)}
                              className="px-3 py-1 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
