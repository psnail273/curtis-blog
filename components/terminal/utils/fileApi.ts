import type { FileRecord, FileType } from '@/types/file';

/**
 * Session-level cache for file API responses.
 * Keyed by the request URL to avoid redundant fetches.
 */
const fileCache = new Map<string, FileRecord[]>();

/**
 * Fetch files from the /api/files endpoint with optional type filter.
 * Results are cached for the session to avoid redundant API calls.
 */
export async function fetchFiles(type?: FileType): Promise<FileRecord[]> {
  const params = new URLSearchParams();
  if (type) params.set('type', type);

  const url = `/api/files${params.toString() ? `?${params}` : ''}`;

  const cached = fileCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const files: FileRecord[] = await response.json();
  fileCache.set(url, files);
  return files;
}

/**
 * Fetch a single file by matching its name within a given type.
 * Searches the cached/fetched file list for a name match.
 */
export async function fetchFileByName(
  name: string,
  type?: FileType
): Promise<FileRecord | null> {
  const files = await fetchFiles(type);
  const lowerName = name.toLowerCase();
  return (
    files.find((f) => f.name.toLowerCase() === lowerName) ?? null
  );
}

/**
 * Clear the file cache. Call on terminal reset.
 */
export function clearFileCache(): void {
  fileCache.clear();
}
