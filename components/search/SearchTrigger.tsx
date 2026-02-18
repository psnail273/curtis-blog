'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchModal } from './SearchModal';

export function SearchTrigger() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    // Restore focus to the trigger button
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  // Register Cmd/Ctrl+K global shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openSearch}
        className={cn(
          'flex items-center gap-2 px-2.5 py-2 rounded-lg',
          'text-muted hover:text-accent transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
          'cursor-pointer'
        )}
        aria-label="Search (Ctrl+K)"
      >
        <Search size={20} aria-hidden="true" />
      </button>

      {isSearchOpen && <SearchModal onClose={closeSearch} />}
    </>
  );
}
