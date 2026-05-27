import type { FileType, FileRow, FileRecord } from '@/types/file';

/**
 * Extension-to-FileType mapping for common file formats.
 */
const EXTENSION_MAP: Record<string, FileType> = {
  // Code
  '.js': 'code',
  '.jsx': 'code',
  '.ts': 'code',
  '.tsx': 'code',
  '.py': 'code',
  '.rb': 'code',
  '.go': 'code',
  '.rs': 'code',
  '.java': 'code',
  '.c': 'code',
  '.cpp': 'code',
  '.h': 'code',
  '.css': 'code',
  '.scss': 'code',
  '.html': 'code',
  '.xml': 'code',
  '.json': 'code',
  '.yaml': 'code',
  '.yml': 'code',
  '.toml': 'code',
  '.md': 'code',
  '.sh': 'code',
  '.bash': 'code',
  '.sql': 'code',
  '.graphql': 'code',
  '.svelte': 'code',
  '.vue': 'code',

  // Video
  '.mp4': 'video',
  '.webm': 'video',
  '.mov': 'video',
  '.avi': 'video',
  '.mkv': 'video',
  '.m4v': 'video',

  // PDF
  '.pdf': 'pdf',

  // Image
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.gif': 'image',
  '.webp': 'image',
  '.svg': 'image',
  '.ico': 'image',
  '.bmp': 'image',
  '.avif': 'image',

  // Document
  '.doc': 'document',
  '.docx': 'document',
  '.xls': 'document',
  '.xlsx': 'document',
  '.ppt': 'document',
  '.pptx': 'document',
  '.odt': 'document',
  '.ods': 'document',
  '.odp': 'document',
  '.csv': 'document',
  '.txt': 'document',
  '.rtf': 'document',
};

/**
 * MIME type prefix mapping as fallback when extension is not recognized.
 */
const MIME_PREFIX_MAP: [string, FileType][] = [
  ['image/', 'image'],
  ['video/', 'video'],
  ['application/pdf', 'pdf'],
  ['text/', 'code'],
  ['application/json', 'code'],
  ['application/xml', 'code'],
  ['application/javascript', 'code'],
  ['application/typescript', 'code'],
  ['application/msword', 'document'],
  ['application/vnd.openxmlformats', 'document'],
  ['application/vnd.ms-', 'document'],
];

/**
 * Map a database row (snake_case) to a FileRecord (camelCase).
 */
export function toFileRecord(row: FileRow): FileRecord {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    type: row.type,
    size: row.size,
    uploadDate: row.upload_date,
    description: row.description,
    url: row.url,
    metadata: row.metadata,
  };
}

/**
 * Detect the FileType category from a filename and MIME type.
 * Tries extension first, then falls back to MIME type prefix matching.
 */
export function detectFileType(filename: string, mimeType: string): FileType {
  const ext = filename.includes('.')
    ? '.' + filename.split('.').pop()!.toLowerCase()
    : '';

  if (ext && EXTENSION_MAP[ext]) {
    return EXTENSION_MAP[ext];
  }

  const mime = mimeType.toLowerCase();
  for (const [prefix, type] of MIME_PREFIX_MAP) {
    if (mime.startsWith(prefix)) {
      return type;
    }
  }

  return 'other';
}

/**
 * Format a byte count into a human-readable string (KB, MB, GB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
