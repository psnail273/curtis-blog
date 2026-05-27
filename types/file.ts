/**
 * Valid file type categories for the file explorer.
 */
export type FileType = 'code' | 'video' | 'pdf' | 'image' | 'document' | 'other';

/**
 * Extensible metadata stored as JSONB in the database.
 * Add new properties here as needed without requiring schema migration.
 */
export interface FileMetadata {
  author?: string;
  tags?: string[];
  language?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  [key: string]: unknown;
}

/**
 * File record matching the database `files` table schema.
 * Named `FileRecord` to avoid collision with the global `File` Web API type.
 */
export interface FileRecord {
  id: string;
  name: string;
  path: string;
  type: FileType;
  size: number;
  uploadDate: string;
  description: string | null;
  url: string;
  metadata: FileMetadata;
}

/**
 * Raw row shape returned from the database (snake_case columns).
 * Used internally for mapping DB rows to FileRecord.
 */
export interface FileRow {
  id: string;
  name: string;
  path: string;
  type: FileType;
  size: number;
  upload_date: string;
  description: string | null;
  url: string;
  metadata: FileMetadata;
}

/**
 * Valid file type values for runtime validation.
 */
export const FILE_TYPES: FileType[] = ['code', 'video', 'pdf', 'image', 'document', 'other'];
