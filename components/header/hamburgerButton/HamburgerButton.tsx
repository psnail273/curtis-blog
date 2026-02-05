'use client';

import { cn } from '@/lib/utils';

interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'relative flex flex-col items-center justify-center gap-[5px] w-11 h-11 p-2.5 bg-transparent border-none cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus-visible:rounded-sm',
        isOpen && 'hamburger-open'
      )}
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <span className="hamburger-line block w-6 h-0.5 bg-foreground rounded-[2px] transition-[transform,opacity] duration-300 ease-in-out motion-reduce:transition-none" />
      <span className="hamburger-line block w-6 h-0.5 bg-foreground rounded-[2px] transition-[transform,opacity] duration-300 ease-in-out motion-reduce:transition-none" />
      <span className="hamburger-line block w-6 h-0.5 bg-foreground rounded-[2px] transition-[transform,opacity] duration-300 ease-in-out motion-reduce:transition-none" />
    </button>
  );
}
