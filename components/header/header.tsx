'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLiveStatus } from '@/contexts/LiveStatusContext';
import SearchBox from '@/components/search/SearchBox';
import HamburgerButton from './hamburgerButton/HamburgerButton';
import MobileNav from './mobileNav/MobileNav';

interface HeaderProps {
  categories: string[];
}

export default function Header({ categories }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const { isAnyLive } = useLiveStatus();

  const activeCategory = pathname === '/' ? searchParams.get('category') : null;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="w-full border-b border-border mb-6">
        {/* Top Tier: Centered Masthead */}
        <div className="flex items-center justify-center py-4 md:py-6 px-4 md:px-8 relative">
          {/* Centered masthead */}
          <Link
            href="/"
            className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight uppercase hover:text-accent transition-colors"
          >
            Curtis Israel
          </Link>

          {/* Mobile hamburger button - absolute positioned on right */}
          <div className="lg:hidden absolute right-4">
            <HamburgerButton
              ref={hamburgerRef}
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
            />
          </div>
        </div>

        {/* Bottom Tier: Navigation Bar (desktop only) */}
        <div className="hidden lg:flex items-center justify-center relative border-t border-border px-4 md:px-8">
          <nav className="flex items-center gap-6 py-3" aria-label="Main navigation">
            {/* All link */}
            <Link
              href="/"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                activeCategory === null && pathname === '/'
                  ? 'text-accent font-bold'
                  : 'text-secondary hover:text-accent'
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
                className={cn(
                  'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                  'transition-colors duration-200',
                  activeCategory === category
                    ? 'text-accent font-bold'
                    : 'text-secondary hover:text-accent'
                )}
                aria-current={activeCategory === category ? 'page' : undefined}
              >
                {category}
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-border" aria-hidden="true" />

            {/* Streams link (NEW) */}
            <Link
              href="/streams"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                pathname === '/streams'
                  ? 'text-accent font-bold'
                  : isAnyLive
                    ? 'text-red-500 animate-nav-live-pulse'
                    : 'text-secondary hover:text-accent'
              )}
              aria-current={pathname === '/streams' ? 'page' : undefined}
            >
              <span className="inline-flex items-center gap-1.5">
                {isAnyLive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-dot-pulse" aria-hidden="true" />
                )}
                Streams
              </span>
            </Link>

            {/* About link */}
            <Link
              href="/about"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                pathname === '/about'
                  ? 'text-accent font-bold'
                  : 'text-secondary hover:text-accent'
              )}
              aria-current={pathname === '/about' ? 'page' : undefined}
            >
              About
            </Link>

            {/* Files link */}
            <Link
              href="/files"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                pathname === '/files'
                  ? 'text-accent font-bold'
                  : 'text-secondary hover:text-accent'
              )}
              aria-current={pathname === '/files' ? 'page' : undefined}
            >
              Files
            </Link>

            {/* Support link */}
            <Link
              href="/support"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                pathname === '/support'
                  ? 'text-accent font-bold'
                  : 'text-secondary hover:text-accent'
              )}
              aria-current={pathname === '/support' ? 'page' : undefined}
            >
              Support
            </Link>
          </nav>

          {/* Search box on right */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2">
            <SearchBox />
          </div>
        </div>
      </header>

      {/* Mobile navigation panel */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        hamburgerButtonRef={hamburgerRef}
        categories={categories}
      />
    </>
  );
}
