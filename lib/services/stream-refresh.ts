import { getDb } from '@/lib/db';
import { checkStreamStatus as checkTwitchStreamStatus } from './twitch';
import {
  checkStreamStatus as checkYouTubeStreamStatus,
  fetchPastStreams as fetchYouTubePastStreams,
  fetchPlaylists as fetchYouTubePlaylists,
  fetchPlaylistItems as fetchYouTubePlaylistItems,
} from './youtube';
import { fetchPastStreams as fetchTwitchPastStreams } from './twitch';

// In-memory flags to prevent concurrent refreshes (thundering herd protection)
let liveRefreshing = false;
let pastStreamsRefreshing = false;
let playlistsRefreshing = false;

// Quota caps for the YouTube playlist sync
const MAX_PLAYLISTS = 20;
const MAX_ITEMS_PER_PLAYLIST = 25;

export async function refreshLiveStatus(): Promise<void> {
  if (liveRefreshing) return;
  liveRefreshing = true;

  try {
    const sql = getDb();

    // Refresh Twitch live status
    const twitchUsername = process.env.NEXT_PUBLIC_TWITCH_USERNAME;
    if (twitchUsername && process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET) {
      try {
        const isLive = await checkTwitchStreamStatus(twitchUsername);
        await sql`
          INSERT INTO live_status (platform, username, is_live, metadata, checked_at)
          VALUES ('twitch', ${twitchUsername}, ${isLive}, '{}', NOW())
          ON CONFLICT (platform, username)
          DO UPDATE SET is_live = ${isLive}, checked_at = NOW()
        `;
      } catch (error) {
        console.error('Failed to refresh Twitch live status:', error);
      }
    }

    // Refresh YouTube live status
    const youtubeChannelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
    if (youtubeChannelId && process.env.YOUTUBE_API_KEY) {
      try {
        const status = await checkYouTubeStreamStatus(youtubeChannelId);
        const metadata = status.videoId ? JSON.stringify({ videoId: status.videoId }) : '{}';
        await sql`
          INSERT INTO live_status (platform, username, is_live, metadata, checked_at)
          VALUES ('youtube', ${youtubeChannelId}, ${status.isLive}, ${metadata}::jsonb, NOW())
          ON CONFLICT (platform, username)
          DO UPDATE SET is_live = ${status.isLive}, metadata = ${metadata}::jsonb, checked_at = NOW()
        `;
      } catch (error) {
        console.error('Failed to refresh YouTube live status:', error);
      }
    }
  } finally {
    liveRefreshing = false;
  }
}

export async function refreshPastStreams(): Promise<void> {
  if (pastStreamsRefreshing) return;
  pastStreamsRefreshing = true;

  try {
    const sql = getDb();

    // Fetch from both platforms in parallel
    const results = await Promise.allSettled([
      process.env.NEXT_PUBLIC_TWITCH_USERNAME && process.env.TWITCH_CLIENT_ID
        ? fetchTwitchPastStreams(process.env.NEXT_PUBLIC_TWITCH_USERNAME)
        : Promise.resolve([]),
      process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID && process.env.YOUTUBE_API_KEY
        ? fetchYouTubePastStreams(process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID)
        : Promise.resolve([]),
    ]);

    const allStreams = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchTwitchPastStreams>>> => r.status === 'fulfilled')
      .flatMap(r => r.value);

    // Upsert each stream into the database
    for (const stream of allStreams) {
      await sql`
        INSERT INTO past_streams (platform, platform_id, title, url, thumbnail_url, duration, view_count, streamed_at)
        VALUES (${stream.platform}, ${stream.id}, ${stream.title}, ${stream.url}, ${stream.thumbnailUrl}, ${stream.duration}, ${stream.viewCount}, ${stream.createdAt})
        ON CONFLICT (platform, platform_id)
        DO UPDATE SET view_count = ${stream.viewCount}, title = ${stream.title}, thumbnail_url = ${stream.thumbnailUrl}
      `;
    }

  } catch (error) {
    console.error('Failed to refresh past streams:', error);
  } finally {
    pastStreamsRefreshing = false;
  }
}

export async function refreshPlaylists(): Promise<void> {
  if (playlistsRefreshing) return;

  const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;
  if (!channelId || !process.env.YOUTUBE_API_KEY) return;

  playlistsRefreshing = true;

  try {
    const sql = getDb();

    const playlists = await fetchYouTubePlaylists(channelId);

    for (const playlist of playlists.slice(0, MAX_PLAYLISTS)) {
      let items: Awaited<ReturnType<typeof fetchYouTubePlaylistItems>> = [];
      try {
        items = await fetchYouTubePlaylistItems(playlist.id, MAX_ITEMS_PER_PLAYLIST);
      } catch (error) {
        console.error(`Failed to fetch items for playlist ${playlist.id}:`, error);
        continue;
      }

      await sql`
        INSERT INTO youtube_playlists (playlist_id, title, thumbnail_url, item_count, position, updated_at)
        VALUES (${playlist.id}, ${playlist.title}, ${playlist.thumbnailUrl}, ${playlist.itemCount}, ${playlist.position}, NOW())
        ON CONFLICT (playlist_id)
        DO UPDATE SET title = ${playlist.title}, thumbnail_url = ${playlist.thumbnailUrl}, item_count = ${playlist.itemCount}, position = ${playlist.position}, updated_at = NOW()
      `;

      let position = 0;
      for (const item of items) {
        await sql`
          INSERT INTO youtube_playlist_items (playlist_id, video_id, title, thumbnail_url, duration, view_count, published_at, position)
          VALUES (${playlist.id}, ${item.id}, ${item.title}, ${item.thumbnailUrl}, ${item.duration}, ${item.viewCount}, ${item.createdAt}, ${position})
          ON CONFLICT (playlist_id, video_id)
          DO UPDATE SET title = ${item.title}, thumbnail_url = ${item.thumbnailUrl}, duration = ${item.duration}, view_count = ${item.viewCount}, position = ${position}
        `;
        position++;
      }
    }
  } catch (error) {
    console.error('Failed to refresh playlists:', error);
  } finally {
    playlistsRefreshing = false;
  }
}
