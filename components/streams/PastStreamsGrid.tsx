'use client';

import { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';
import type { PastStream } from '@/lib/services/stream-utils';

interface PastStreamsGridProps {
  initialStreams: PastStream[];
}

export function PastStreamsGrid({ initialStreams }: PastStreamsGridProps) {
  const [streams, setStreams] = useState<PastStream[]>(initialStreams);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialStreams.length >= 12);

  // If DB was empty on server render, try fetching client-side (triggers after() refresh)
  useEffect(() => {
    if (initialStreams.length > 0) return;

    setLoading(true);
    fetch('/api/streams')
      .then(res => res.json())
      .then(data => {
        setStreams(data.streams ?? []);
        setHasMore(data.hasMore ?? false);
      })
      .catch(err => console.error('Failed to fetch streams:', err))
      .finally(() => setLoading(false));
  }, [initialStreams.length]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/streams?offset=${streams.length}`);
      const data = await res.json();
      setStreams(prev => [...prev, ...(data.streams ?? [])]);
      setHasMore(data.hasMore ?? false);
    } catch (error) {
      console.error('Failed to load more streams:', error);
    } finally {
      setLoadingMore(false);
    }
  }

  // Loading state (only on cold start when DB is empty)
  if (loading) {
    return (
      <section className="mt-12 md:mt-16">
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-6 md:mb-8">
          Past Streams
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
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

  // Empty state
  if (streams.length === 0) {
    return (
      <section className="mt-12 md:mt-16">
        <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-6 md:mb-8">
          Past Streams
        </h2>
        <div className="text-center py-12 text-muted">
          <p className="mb-2">No past streams yet.</p>
          <p>Follow on Twitch or YouTube to get notified when Curtis goes live.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12 md:mt-16">
      <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-6 md:mb-8">
        Past Streams
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {streams.map((stream) => (
          <StreamCard key={`${stream.platform}-${stream.id}`} stream={stream} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 border-2 border-accent text-accent rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </section>
  );
}
