import { NextResponse } from 'next/server';
import { after } from 'next/server';
import { getDb } from '@/lib/db';
import { refreshPlaylists } from '@/lib/services/stream-refresh';
import type { PastStream, YouTubePlaylist } from '@/lib/services/stream-utils';

export async function GET() {
  try {
    const sql = getDb();

    const playlistRows = await sql`
      SELECT playlist_id, title, thumbnail_url, item_count
      FROM youtube_playlists
      ORDER BY position ASC
    `;

    const playlistIds = playlistRows.map(row => row.playlist_id);

    let itemRows: Record<string, unknown>[] = [];
    if (playlistIds.length > 0) {
      itemRows = await sql`
        SELECT playlist_id, video_id, title, thumbnail_url, duration, view_count, published_at
        FROM youtube_playlist_items
        WHERE playlist_id = ANY(${playlistIds})
        ORDER BY position ASC
      `;
    }

    const itemsByPlaylist = new Map<string, PastStream[]>();
    for (const row of itemRows) {
      const playlistId = row.playlist_id as string;
      const videoId = row.video_id as string;
      const list = itemsByPlaylist.get(playlistId) ?? [];
      list.push({
        id: videoId,
        title: row.title as string,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: row.thumbnail_url as string,
        duration: row.duration as string,
        viewCount: row.view_count as number,
        createdAt: row.published_at as string,
        platform: 'youtube',
      });
      itemsByPlaylist.set(playlistId, list);
    }

    const playlists: YouTubePlaylist[] = playlistRows
      .map(row => ({
        id: row.playlist_id as string,
        title: row.title as string,
        thumbnailUrl: row.thumbnail_url as string,
        itemCount: row.item_count as number,
        items: itemsByPlaylist.get(row.playlist_id as string) ?? [],
      }))
      .filter(playlist => playlist.items.length > 0);

    // If no data or stale (>30 min since newest updated_at), trigger background refresh
    const newest = await sql`SELECT MAX(updated_at) as latest FROM youtube_playlists`;
    const latestUpdatedAt = newest[0]?.latest;
    const isStale = !latestUpdatedAt || (Date.now() - new Date(latestUpdatedAt).getTime()) > 30 * 60 * 1000;

    if (isStale) {
      after(() => refreshPlaylists());
    }

    return NextResponse.json(
      { playlists },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return NextResponse.json({ playlists: [] }, { status: 200 });
  }
}
