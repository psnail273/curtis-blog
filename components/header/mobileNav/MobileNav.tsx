'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLiveStatus } from '@/contexts/LiveStatusContext';
import { SearchTrigger } from '@/components/search/SearchTrigger';


interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  hamburgerButtonRef: React.RefObject<HTMLButtonElement | null>;
  categories: string[];
  isAdmin: boolean;
}

export default function MobileNav({ isOpen, onClose, hamburgerButtonRef, categories, isAdmin }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelRef = useRef<HTMLDivElement>(null);
  const { isAnyLive } = useLiveStatus();

  const activeCategory = pathname === '/' ? searchParams.get('category') : null;

  // Focus trap: handle Tab/Shift+Tab to cycle through panel elements only
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;

      const focusableElements = panel!.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      const focusableArray = Array.from(focusableElements);
      const firstFocusable = focusableArray[0];
      const lastFocusable = focusableArray[focusableArray.length - 1];

      if (!firstFocusable) return;

      // Shift+Tab on first element: wrap to last
      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
      // Tab on last element: wrap to first
      else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Initial focus: move focus to first nav link when panel opens
  useEffect(() => {
    if (!isOpen) return;

    const panel = panelRef.current;
    if (!panel) return;

    // Wait for slide-in animation to start (next tick)
    const timeoutId = setTimeout(() => {
      const firstLink = panel.querySelector<HTMLAnchorElement>('a[href]');
      firstLink?.focus();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  // Focus restoration: return focus to hamburger button when panel closes
  useEffect(() => {
    // Only restore focus when transitioning from open to closed
    if (isOpen) return;

    // Wait for slide-out animation to complete (300ms + small buffer)
    const timeoutId = setTimeout(() => {
      hamburgerButtonRef.current?.focus();
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [isOpen, hamburgerButtonRef]);

  // Scroll lock: prevent body scroll when panel is open
  useEffect(() => {
    if (!isOpen) return;

    // Save current scroll position and overflow state
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // Lock scroll and add padding to prevent layout shift
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      // Restore original state when panel closes
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Don't render if not open (conditional rendering for performance)
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop - semi-transparent overlay behind the panel */}
      <div
        className={cn(
          'mobile-nav-backdrop fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40',
          'lg:hidden', // Hide on desktop (1024px+)
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {isOpen ? 'Navigation menu opened' : ''}
      </div>

      {/* Slide-in panel from right */}
      <div
        ref={panelRef}
        id="mobile-nav-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
        className={cn(
          'fixed top-0 right-0 h-dvh w-[280px] bg-background z-50',
          'lg:hidden', // Hide on desktop (1024px+)
          'flex flex-col gap-6 p-6 overflow-y-auto',
          'border-l border-border',
          'shadow-2xl',
          'transition-transform duration-300 ease-in-out transform-gpu',
          'motion-reduce:transition-none', // Respect prefers-reduced-motion
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Search */}
        <div className="flex items-center px-4 py-2">
          <SearchTrigger />
          <span className="ml-2 text-base font-sans text-muted">Search</span>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Category links section (primary) */}
        <nav className="flex flex-col gap-3" aria-label="Categories">
          <span className="text-xs font-medium text-secondary uppercase tracking-wide px-4">
            Categories
          </span>

          {/* All category */}
          <Link
            href="/"
            onClick={onClose}
            className={cn(
              'block w-full text-left px-4 py-3 rounded-lg',
              'text-lg font-serif',
              'transition-colors duration-200',
              'min-h-[44px] flex items-center',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              activeCategory === null && pathname === '/'
                ? 'text-accent font-bold border-l-4 border-accent bg-accent/5'
                : 'text-foreground hover:bg-accent/10 hover:text-accent'
            )}
            aria-current={activeCategory === null && pathname === '/' ? 'page' : undefined}
          >
            All
          </Link>

          {/* Category links */}
          {categories.map((category) => (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              onClick={onClose}
              className={cn(
                'block w-full text-left px-4 py-3 rounded-lg',
                'text-lg font-serif',
                'transition-colors duration-200',
                'min-h-[44px] flex items-center',
                'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                activeCategory === category
                  ? 'text-accent font-bold border-l-4 border-accent bg-accent/5'
                  : 'text-foreground hover:bg-accent/10 hover:text-accent'
              )}
              aria-current={activeCategory === category ? 'page' : undefined}
            >
              {category}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Page links section */}
        <nav className="flex flex-col gap-2" aria-label="Pages">
          <span className="text-xs font-medium text-secondary uppercase tracking-wide px-4">
            Pages
          </span>

          <Link
            href="/streams"
            onClick={onClose}
            className={cn(
              'block w-full text-left px-4 py-2 rounded-lg',
              'text-base font-sans',
              'transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              'min-h-[44px] flex items-center',
              pathname === '/streams'
                ? 'text-accent font-bold border-l-4 border-accent bg-accent/5'
                : isAnyLive
                  ? 'text-live animate-nav-live-pulse hover:bg-accent/10'
                  : 'text-muted hover:bg-accent/10 hover:text-accent'
            )}
            aria-current={pathname === '/streams' ? 'page' : undefined}
          >
            <span className="inline-flex items-center gap-1.5">
              {isAnyLive && (
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-live-dot-pulse" aria-hidden="true" />
              )}
              Streams
            </span>
          </Link>
          <Link
            href="/about"
            onClick={onClose}
            className={cn(
              'block w-full text-left px-4 py-2 rounded-lg',
              'text-base font-sans',
              'transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              'min-h-[44px] flex items-center',
              pathname === '/about'
                ? 'text-accent font-bold border-l-4 border-accent bg-accent/5'
                : 'text-muted hover:bg-accent/10 hover:text-accent'
            )}
            aria-current={pathname === '/about' ? 'page' : undefined}
          >
            About
          </Link>
          <Link
            href="/files"
            onClick={onClose}
            className={cn(
              'block w-full text-left px-4 py-2 rounded-lg',
              'text-base font-sans',
              'transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
              'min-h-[44px] flex items-center',
              pathname === '/files'
                ? 'text-accent font-bold border-l-4 border-accent bg-accent/5'
                : 'text-muted hover:bg-accent/10 hover:text-accent'
            )}
            aria-current={pathname === '/files' ? 'page' : undefined}
          >
            Files
          </Link>
        </nav>

        {/* More links section — admin only */}
        {isAdmin && (
          <>
            {/* Divider */}
            <div className="border-t border-border" />

            <nav className="flex flex-col gap-2" aria-label="More">
              <span className="text-xs font-medium text-secondary uppercase tracking-wide px-4">
                More
              </span>

              <Link
                href="/admin"
                onClick={onClose}
                className={cn(
                  'block w-full text-left px-4 py-2 rounded-lg',
                  'text-base font-sans',
                  'transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                  'min-h-[44px] flex items-center',
                  pathname === '/admin'
                    ? 'text-accent font-bold border-l-4 border-accent bg-accent/5'
                    : 'text-muted hover:bg-accent/10 hover:text-accent'
                )}
                aria-current={pathname === '/admin' ? 'page' : undefined}
              >
                Admin
              </Link>
            </nav>
          </>
        )}
      </div>
    </>
  );
}
