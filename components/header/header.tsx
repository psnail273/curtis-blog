'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { categoryToTag } from '@/lib/article-utils';
import { useLiveStatus } from '@/contexts/LiveStatusContext';
import { useAdminStatus } from '@/lib/hooks/use-admin-status';
import { SearchTrigger } from '@/components/search/SearchTrigger';
import HamburgerButton from './hamburgerButton/HamburgerButton';
import MobileNav from './mobileNav/MobileNav';

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
        'transition-colors duration-200',
        isActive ? 'text-accent font-bold' : 'text-secondary hover:text-accent'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

interface HeaderProps {
  categories: string[];
}

export default function Header({ categories }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const { isAnyLive } = useLiveStatus();
  const { isAdmin } = useAdminStatus();

  // Active category tag derived from the path: /articles/<tag> and
  // /articles/<tag>/<slug> both resolve to <tag>.
  const activeTag = pathname.startsWith('/articles/') ? (pathname.split('/')[2] ?? null) : null;

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

          {/* Mobile: search + hamburger — absolute positioned on right */}
          <div className="lg:hidden absolute right-4 flex items-center gap-1">
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
            <NavLink href="/" isActive={pathname === '/'}>
              All
            </NavLink>

            {categories.map((category) => (
              <NavLink
                key={category}
                href={`/articles/${categoryToTag(category)}`}
                isActive={activeTag === categoryToTag(category)}
              >
                {category}
              </NavLink>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-border" aria-hidden="true" />

            {/* Streams link — special case with live pulse animation */}
            <Link
              href="/streams"
              className={cn(
                'nav-link relative uppercase text-sm md:text-base tracking-wide font-medium whitespace-nowrap pb-1',
                'transition-colors duration-200',
                pathname === '/streams'
                  ? 'text-accent font-bold'
                  : isAnyLive
                    ? 'text-live animate-nav-live-pulse'
                    : 'text-secondary hover:text-accent'
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

            <NavLink href="/about" isActive={pathname === '/about'}>About</NavLink>
            <NavLink href="/files" isActive={pathname === '/files'}>Files</NavLink>
            {isAdmin && (
              <NavLink href="/admin" isActive={pathname === '/admin'}>Admin</NavLink>
            )}
          </nav>

          {/* Right side: search */}
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <SearchTrigger />
          </div>
        </div>
      </header>

      {/* Mobile navigation panel */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        hamburgerButtonRef={hamburgerRef}
        categories={categories}
        isAdmin={isAdmin}
      />
    </>
  );
}
