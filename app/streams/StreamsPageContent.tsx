'use client';

import { StreamHero } from '@/components/streams/StreamHero';
import { PastStreamsGrid } from '@/components/streams/PastStreamsGrid';

export function StreamsPageContent() {
  return (
    <>
      <StreamHero />
      <PastStreamsGrid />
    </>
  );
}
