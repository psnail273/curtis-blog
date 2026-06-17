'use client';

import { useState, useEffect } from 'react';
import { PlaylistRow } from './PlaylistRow';
import type { YouTubePlaylist } from '@/lib/services/stream-utils';

interface PlaylistsSectionProps {
  initialPlaylists: YouTubePlaylist[];
}

export function PlaylistsSection({ initialPlaylists }: PlaylistsSectionProps) {
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>(initialPlaylists);
  const [loading, setLoading] = useState(false);

  // If DB was empty on server render, try fetching client-side (triggers after() refresh)
  useEffect(() => {
    if (initialPlaylists.length > 0) return;

    setLoading(true);
    fetch('/api/streams/playlists')
      .then(res => res.json())
      .then(data => {
        setPlaylists(data.playlists ?? []);
      })
      .catch(err => console.error('Failed to fetch playlists:', err))
      .finally(() => setLoading(false));
  }, [initialPlaylists.length]);

  // Loading state (only on cold start when DB is empty)
  if (loading) {
    return (
      <section className="mt-12 md:mt-16">
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-6 md:mb-8">
          Playlists
        </h2>
        <div className="flex gap-4 md:gap-6 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shrink-0 w-[80%] sm:w-[45%] lg:w-[30%] border border-border rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[16/9] bg-muted/40" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted/40 rounded w-3/4" />
                <div className="h-3 bg-muted/40 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Nothing to show — render nothing (recent streams already cover the page)
  if (playlists.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 md:mt-16">
      <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-6 md:mb-8">
        Playlists
      </h2>

      {playlists.map((playlist) => (
        <PlaylistRow key={playlist.id} title={playlist.title} items={playlist.items} />
      ))}
    </section>
  );
}
