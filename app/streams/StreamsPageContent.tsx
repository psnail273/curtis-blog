'use client';

import { StreamHero } from '@/components/streams/StreamHero';
import { PastStreamsGrid } from '@/components/streams/PastStreamsGrid';
import type { PastStream } from '@/lib/services/stream-utils';

interface StreamsPageContentProps {
  initialStreams: PastStream[];
}

export function StreamsPageContent({ initialStreams }: StreamsPageContentProps) {
  return (
    <>
      <StreamHero />
      <PastStreamsGrid initialStreams={initialStreams} />
    </>
  );
}
