/**
 * Shared utility functions for file components.
 */

import { formatDateLong, formatDateShort } from '@/lib/format-utils';

export function formatDate(dateString: string, format: 'long' | 'short' = 'long'): string {
  return format === 'long' ? formatDateLong(dateString) : formatDateShort(dateString);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function capitalizeType(type: string): string {
  if (type === 'pdf') return 'PDF';
  return type.charAt(0).toUpperCase() + type.slice(1);
}
