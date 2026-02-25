'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function SearchInput({ value, onChange, inputRef }: SearchInputProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <Search size={20} className="shrink-0 text-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search articles, streams, and files..."
        className={cn(
          'flex-1 bg-transparent text-lg text-foreground placeholder:text-caption',
          'border-none outline-none min-w-0'
        )}
        aria-label="Search articles, streams, and files"
        autoFocus
      />
    </div>
  );
}
