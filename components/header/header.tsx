'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SearchBox from '@/components/search/SearchBox';
import LiveIndicator from './liveIndicator/liveIndicator';
import HamburgerButton from './hamburgerButton/HamburgerButton';
import { useLiveStatus } from '@/contexts/LiveStatusContext';
import MobileNav from './mobileNav/MobileNav';

export default function Header() {
  const { isAnyLive, isLoading } = useLiveStatus();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);

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
      <header className="flex items-center justify-between w-full border-b border-border mb-6 overflow-x-hidden px-4 py-3 md:px-8 md:py-4 xl:px-[clamp(2rem,5vw,4rem)]">
        {/* Left section: Logo */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="text-[clamp(1.25rem,4vw,1.5rem)] font-semibold font-serif text-foreground transition-colors duration-200 whitespace-nowrap hover:text-accent"
          >
            Curtis Israel
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <div className="lg:hidden">
          <HamburgerButton
            ref={hamburgerRef}
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
          />
        </div>

        {/* Center section: Nav links + Live indicator */}
        <div className="hidden lg:flex items-center justify-center gap-4 flex-1">
          <nav className="flex items-center gap-[clamp(1rem,3vw,2rem)] sm:gap-[clamp(2rem,5vw,4rem)]">
            <Link href="/" className="nav-link uppercase text-[clamp(0.75rem,2vw,0.875rem)] tracking-[0.05em] font-medium text-secondary transition-colors duration-200 whitespace-nowrap hover:text-accent">
              Home
            </Link>
            <Link href="/articles" className="nav-link uppercase text-[clamp(0.75rem,2vw,0.875rem)] tracking-[0.05em] font-medium text-secondary transition-colors duration-200 whitespace-nowrap hover:text-accent">
              Articles
            </Link>
            <Link href="/about" className="nav-link uppercase text-[clamp(0.75rem,2vw,0.875rem)] tracking-[0.05em] font-medium text-secondary transition-colors duration-200 whitespace-nowrap hover:text-accent">
              About
            </Link>
            <Link href="/files" className="nav-link uppercase text-[clamp(0.75rem,2vw,0.875rem)] tracking-[0.05em] font-medium text-secondary transition-colors duration-200 whitespace-nowrap hover:text-accent">
              Files
            </Link>
            <Link href="/support" className="nav-link uppercase text-[clamp(0.75rem,2vw,0.875rem)] tracking-[0.05em] font-medium text-secondary transition-colors duration-200 whitespace-nowrap hover:text-accent">
              Support
            </Link>
            <LiveIndicator isAnyLive={isAnyLive} isLoading={isLoading} />
          </nav>
        </div>

        {/* Right section: Search */}
        <div className="hidden lg:flex items-center shrink-0">
          <SearchBox />
        </div>
      </header>

      {/* Mobile navigation panel */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        hamburgerButtonRef={hamburgerRef}
      />
    </>
  );
}
