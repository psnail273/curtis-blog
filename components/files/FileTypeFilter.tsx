'use client';

import { cn } from '@/lib/utils';
import type { FileType } from '@/types/file';

interface FileTypeFilterProps {
  selectedType: FileType | null;
  onSelect: (type: FileType | null) => void;
}

const FILE_TYPE_LABELS: { value: FileType; label: string }[] = [
  { value: 'code', label: 'Code' },
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
  { value: 'other', label: 'Other' },
];

/**
 * Pill-based filter for file types, following the CategoryFilter pattern.
 */
export function FileTypeFilter({ selectedType, onSelect }: FileTypeFilterProps) {
  return (
    <div role="group" aria-label="Filter files by type" className="flex flex-wrap gap-3">
      {/* "All" pill -- always first */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] flex items-center justify-center',
          'transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
          selectedType === null
            ? 'bg-accent text-accent-foreground'
            : 'bg-transparent text-muted-foreground border border-border hover:border-accent hover:text-accent'
        )}
        aria-pressed={selectedType === null}
      >
        All
      </button>

      {/* Type pills */}
      {FILE_TYPE_LABELS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={cn(
            'px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] flex items-center justify-center',
            'transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            selectedType === value
              ? 'bg-accent text-accent-foreground'
              : 'bg-transparent text-muted-foreground border border-border hover:border-accent hover:text-accent'
          )}
          aria-pressed={selectedType === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
