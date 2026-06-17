'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StreamCard } from './StreamCard';
import type { PastStream } from '@/lib/services/stream-utils';

interface PlaylistRowProps {
  title: string;
  items: PastStream[];
}

export function PlaylistRow({ title, items }: PlaylistRowProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' });
  }

  return (
    <div className="mb-10 md:mb-12">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="font-serif font-semibold text-xl md:text-2xl text-foreground">
          {title}
        </h3>
        <div className="hidden sm:flex gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${title} left`}
            className="p-2 border border-border rounded-full text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${title} right`}
            className="p-2 border border-border rounded-full text-foreground hover:bg-muted/40 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        role="region"
        aria-label={`${title} playlist`}
        tabIndex={0}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-lg"
      >
        {items.map((item) => (
          <div key={`${title}-${item.id}`} className="snap-start shrink-0 w-[80%] sm:w-[45%] lg:w-[30%]">
            <StreamCard stream={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
