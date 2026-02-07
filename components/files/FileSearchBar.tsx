'use client';

import { Search } from 'lucide-react';

interface FileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Search input for filtering files by name.
 */
export function FileSearchBar({ value, onChange }: FileSearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        size={18}
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search files by name..."
        aria-label="Search files by name"
        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-body text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 transition-colors duration-200 min-h-[44px]"
      />
    </div>
  );
}
