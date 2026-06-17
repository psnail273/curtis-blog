'use client';

import { StreamHero } from '@/components/streams/StreamHero';
import { PlaylistsSection } from '@/components/streams/PlaylistsSection';
import type { YouTubePlaylist } from '@/lib/services/stream-utils';

interface StreamsPageContentProps {
  initialPlaylists: YouTubePlaylist[];
}

export function StreamsPageContent({ initialPlaylists }: StreamsPageContentProps) {
  return (
    <>
      <StreamHero />
      <PlaylistsSection initialPlaylists={initialPlaylists} />
    </>
  );
}
