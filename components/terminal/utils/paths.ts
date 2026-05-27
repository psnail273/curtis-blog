import type { FileType } from '@/types/file';

/**
 * Maps virtual directory names to FileType values.
 * e.g. "code" -> "code", "videos" -> "video", "pdfs" -> "pdf"
 */
const DIR_TO_FILE_TYPE: Record<string, FileType> = {
  code: 'code',
  videos: 'video',
  pdfs: 'pdf',
  images: 'image',
  documents: 'document',
};

/**
 * Maps FileType values to their virtual directory display names.
 */
export const FILE_TYPE_DIRS: Record<FileType, string> = {
  code: 'code',
  video: 'videos',
  pdf: 'pdfs',
  image: 'images',
  document: 'documents',
  other: 'other',
};

/**
 * Resolve a directory name to its FileType.
 * Returns null if the directory name is not a valid file type directory.
 */
export function resolveFileType(dirName: string): FileType | null {
  return DIR_TO_FILE_TYPE[dirName.toLowerCase()] ?? null;
}

/**
 * Format a file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

/**
 * Get a text-based type indicator for a file type.
 * Uses simple text labels rather than emoji for terminal aesthetic.
 */
export function getFileTypeIndicator(type: FileType): string {
  switch (type) {
    case 'code':
      return '[CODE]';
    case 'video':
      return '[VID]';
    case 'pdf':
      return '[PDF]';
    case 'image':
      return '[IMG]';
    case 'document':
      return '[DOC]';
    default:
      return '[FILE]';
  }
}

const VALID_DIRECTORIES = new Set([
  '', 'articles', 'files', 'files/code', 'files/videos',
  'files/pdfs', 'files/images', 'files/documents', 'about', 'contact',
]);

function normalizePath(path: string): string {
  const segments = path.split('/').filter((s) => s !== '' && s !== '.');
  const result: string[] = [];
  for (const seg of segments) {
    if (seg === '..') { result.pop(); } else { result.push(seg); }
  }
  return result.join('/');
}

export function resolvePath(cwd: string, target: string): string {
  if (!target || target === '~' || target === '/') return '~';
  let rawPath: string;
  if (target.startsWith('~/')) rawPath = target.slice(2);
  else if (target.startsWith('/')) rawPath = target.slice(1);
  else {
    const cwdRaw = cwd === '~' ? '' : cwd.slice(2);
    rawPath = cwdRaw ? `${cwdRaw}/${target}` : target;
  }
  const normalized = normalizePath(rawPath);
  return normalized ? `~/${normalized}` : '~';
}

export function isValidDirectory(path: string): boolean {
  const raw = path === '~' ? '' : path.startsWith('~/') ? path.slice(2) : path;
  return VALID_DIRECTORIES.has(raw.toLowerCase());
}

export function pathToArg(path: string): string {
  if (path === '~') return '';
  if (path.startsWith('~/')) return path.slice(2);
  return path;
}
