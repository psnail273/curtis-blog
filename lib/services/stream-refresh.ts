import { getDb } from '@/lib/db';
import { checkStreamStatus as checkTwitchStreamStatus } from './twitch';
import { checkStreamStatus as checkYouTubeStreamStatus, fetchPastStreams as fetchYouTubePastStreams } from './youtube';
import { fetchPastStreams as fetchTwitchPastStreams } from './twitch';

// In-memory flags to prevent concurrent refreshes (thundering herd protection)
let liveRefreshing = false;
let pastStreamsRefreshing = false;

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
