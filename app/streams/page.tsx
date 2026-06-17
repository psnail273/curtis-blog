import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { getDb } from '@/lib/db';
import type { PastStream } from '@/lib/services/stream-utils';
import { StreamsPageContent } from './StreamsPageContent';

export const metadata: Metadata = {
  title: 'Streams',
  description: 'Watch live streams and past broadcasts from Curtis Israel on Twitch and YouTube.',
  openGraph: {
    title: 'Streams | Curtis Israel',
    description: 'Watch live streams and past broadcasts.',
  },
};

const getCachedPlaylists = unstable_cache(
  async () => {
    const sql = getDb();

    const playlistRows = await sql`
      SELECT playlist_id, title, thumbnail_url, item_count
      FROM youtube_playlists
      ORDER BY position ASC
    `;

    const playlistIds = playlistRows.map(row => row.playlist_id);
    if (playlistIds.length === 0) return [];

    const itemRows = await sql`
      SELECT playlist_id, video_id, title, thumbnail_url, duration, view_count, published_at
      FROM youtube_playlist_items
      WHERE playlist_id = ANY(${playlistIds})
      ORDER BY position ASC
    `;

    const itemsByPlaylist = new Map<string, PastStream[]>();
    for (const row of itemRows) {
      const list = itemsByPlaylist.get(row.playlist_id) ?? [];
      list.push({
        id: row.video_id,
        title: row.title,
        url: `https://www.youtube.com/watch?v=${row.video_id}`,
        thumbnailUrl: row.thumbnail_url,
        duration: row.duration,
        viewCount: row.view_count,
        createdAt: row.published_at,
        platform: 'youtube',
      });
      itemsByPlaylist.set(row.playlist_id, list);
    }

    return playlistRows
      .map(row => ({
        id: row.playlist_id,
        title: row.title,
        thumbnailUrl: row.thumbnail_url,
        itemCount: row.item_count,
        items: itemsByPlaylist.get(row.playlist_id) ?? [],
      }))
      .filter(playlist => playlist.items.length > 0);
  },
  ['youtube-playlists'],
  { tags: ['youtube-playlists'], revalidate: 1800 }
);

export default async function StreamsPage() {
  let initialPlaylists: Awaited<ReturnType<typeof getCachedPlaylists>> = [];
  try {
    initialPlaylists = await getCachedPlaylists();
  } catch {
    // DB not available during build or cold start — empty is fine
  }

  return (
    <div className="py-4 md:py-6">
      <h1 className="sr-only">Streams</h1>
      <StreamsPageContent initialPlaylists={initialPlaylists} />
    </div>
  );
}
