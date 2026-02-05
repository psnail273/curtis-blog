'use client';

import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isAnyLive: boolean;
  isLoading: boolean;
}

export default function LiveIndicator({ isAnyLive, isLoading }: LiveIndicatorProps) {
  // Don't render during loading to avoid flash of incorrect state
  if (isLoading) {
    return null;
  }

  // When offline, hide the indicator entirely -- the home page
  // StreamingStatus component handles the offline/follow display
  if (!isAnyLive) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-full',
        'bg-accent/10 border border-accent/20',
        'transition-opacity duration-300'
      )}
      role="status"
      aria-live="polite"
      aria-label="A live stream is currently active"
    >
      {/* Pulsing dot indicator */}
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full bg-accent opacity-75',
            'animate-ping motion-reduce:animate-none'
          )}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>

      {/* LIVE text */}
      <span
        className={cn(
          'text-[0.625rem] font-semibold uppercase tracking-[0.1em] leading-none',
          'text-accent select-none'
        )}
      >
        LIVE
      </span>
    </div>
  );
}
