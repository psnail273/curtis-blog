'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import SearchBox from '@/components/search/SearchBox';
import LiveIndicator from './liveIndicator/liveIndicator';
import HamburgerButton from './hamburgerButton/HamburgerButton';
import { useLiveStatus } from '@/contexts/LiveStatusContext';
import MobileNav from './mobileNav/MobileNav';

interface HeaderProps {
  categories: string[];
}

export default function Header({ categories }: HeaderProps) {
  const { status, streams, isLoading } = useLiveStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hamburgerRef = useRef<HTMLButtonElement>(null);

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
        {/* Top Tier: Logo, Live Indicator (center), Search/Hamburger */}
        <div className="flex items-center justify-between w-full overflow-x-hidden px-4 py-3 md:px-8 md:py-4">
          {/* Left section: Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="text-xl md:text-2xl font-semibold font-serif text-foreground transition-colors duration-200 whitespace-nowrap hover:text-accent"
            >
              Curtis Israel
            </Link>
          </div>

          {/* Center section: Live Indicator */}
          <LiveIndicator status={status} streams={streams} isLoading={isLoading} />

          {/* Right section: Search (desktop) / Hamburger (mobile) */}
          <div className="flex items-center gap-4">
            {/* Search - desktop only */}
            <div className="hidden lg:flex items-center shrink-0">
              <SearchBox />
            </div>

            {/* Mobile hamburger button */}
            <div className="lg:hidden">
              <HamburgerButton
                ref={hamburgerRef}
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(prev => !prev)}
              />
            </div>
          </div>
        </div>

        {/* Bottom Tier: Category Tabs + Page Links (desktop only) */}
        <div className="hidden lg:block border-t border-border">
          <nav
            className="flex items-center justify-center gap-6 md:gap-8 px-4 md:px-8 py-3 md:py-4 overflow-x-auto"
            aria-label="Category navigation"
          >
            {/* All tab */}
            <Link
              href="/"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                activeCategory === null && pathname === '/'
                  ? 'text-accent'
                  : 'text-secondary hover:text-accent'
              )}
              aria-current={activeCategory === null && pathname === '/' ? 'page' : undefined}
            >
              All
            </Link>

            {/* Category tabs */}
            {categories.map((category) => (
              <Link
                key={category}
                href={`/?category=${encodeURIComponent(category)}`}
                className={cn(
                  'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                  'transition-colors duration-200',
                  activeCategory === category
                    ? 'text-accent'
                    : 'text-secondary hover:text-accent'
                )}
                aria-current={activeCategory === category ? 'page' : undefined}
              >
                {category}
              </Link>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-border" aria-hidden="true" />

            {/* About link */}
            <Link
              href="/about"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                pathname === '/about'
                  ? 'text-accent'
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
                  ? 'text-accent'
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
                  ? 'text-accent'
                  : 'text-secondary hover:text-accent'
              )}
              aria-current={pathname === '/support' ? 'page' : undefined}
            >
              Support
            </Link>
          </nav>
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
