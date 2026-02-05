'use client';

import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div role="group" aria-label="Filter articles by category" className="flex flex-wrap gap-2">
      {/* "All" pill -- always first */}
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'px-4 py-1.5 rounded-full text-sm font-medium',
          'transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
          selectedCategory === null
            ? 'bg-accent text-accent-foreground'
            : 'bg-transparent text-muted-foreground border border-border hover:border-accent hover:text-accent'
        )}
        aria-pressed={selectedCategory === null}
      >
        All
      </button>

      {/* Category pills */}
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium',
            'transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            selectedCategory === category
              ? 'bg-accent text-accent-foreground'
              : 'bg-transparent text-muted-foreground border border-border hover:border-accent hover:text-accent'
          )}
          aria-pressed={selectedCategory === category}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
