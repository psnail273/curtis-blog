'use client';

import type { ReactNode } from 'react';

interface SearchResultGroupProps {
  label: string;
  count: number;
  children: ReactNode;
}

export function SearchResultGroup({ label, count, children }: SearchResultGroupProps) {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-card px-4 py-2 border-b border-border">
        <span className="text-xs font-medium text-caption uppercase tracking-wider">
          {label}
        </span>
        <span className="text-xs text-caption ml-1.5">
          ({count})
        </span>
      </div>
      {children}
    </div>
  );
}
