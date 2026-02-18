'use client';

import { useState, useEffect } from 'react';
import { StreamCard } from './StreamCard';

interface PastStream {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  createdAt: string;
  platform: 'twitch' | 'youtube';
}

export function PastStreamsGrid() {
  const [streams, setStreams] = useState<PastStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [twitchCursor, setTwitchCursor] = useState<string | null>(null);
  const [youtubePageToken, setYoutubePageToken] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  async function fetchStreams(loadMore = false) {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch from both platforms in parallel
      const [twitchRes, youtubeRes] = await Promise.all([
        fetch(`/api/streams/twitch${loadMore && twitchCursor ? `?cursor=${twitchCursor}` : ''}`).catch(() => null),
        fetch(`/api/streams/youtube${loadMore && youtubePageToken ? `?pageToken=${youtubePageToken}` : ''}`).catch(() => null),
      ]);

      const twitchData = twitchRes?.ok ? await twitchRes.json() : { streams: [], cursor: null };
      const youtubeData = youtubeRes?.ok ? await youtubeRes.json() : { streams: [], pageToken: null };

      // Merge and sort by date
      const newStreams = [...twitchData.streams, ...youtubeData.streams].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setStreams(prev => loadMore ? [...prev, ...newStreams] : newStreams);
      setTwitchCursor(twitchData.cursor);
      setYoutubePageToken(youtubeData.pageToken);
      setHasMore(twitchData.cursor !== null || youtubeData.pageToken !== null);
    } catch (error) {
      console.error('Failed to fetch past streams:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Initial load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchStreams(); }, []);

  function handleLoadMore() {
    fetchStreams(true);
  }

  // Loading state
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

      {/* Grid of stream cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {streams.map((stream) => (
          <StreamCard key={`${stream.platform}-${stream.id}`} stream={stream} />
        ))}
      </div>

      {/* Load more button */}
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
