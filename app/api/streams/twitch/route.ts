import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/services/twitch';
import { type PastStream, formatTwitchDuration, createCache } from '@/lib/services/stream-utils';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
}

interface TwitchVideo {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: unknown[] | null;
}

interface TwitchVideosResponse {
  data: TwitchVideo[];
  pagination: {
    cursor?: string;
  };
}

interface TwitchUsersResponse {
  data: TwitchUser[];
}

interface TwitchStreamsResponse {
  streams: PastStream[];
  cursor: string | null;
}

// 5-minute cache for past streams
const streamsCache = createCache<TwitchStreamsResponse>(5 * 60 * 1000);

/**
 * GET /api/streams/twitch?cursor={pagination_cursor}
 *
 * Fetches past broadcasts (VODs) from Twitch Helix API.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || '';

    // Check for required env vars
    if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
      return NextResponse.json(
        {
          streams: [],
          cursor: null,
          error: 'Twitch is not configured. Missing API credentials.',
        },
        { status: 200 }
      );
    }

    const username = process.env.NEXT_PUBLIC_TWITCH_USERNAME;
    if (!username) {
      return NextResponse.json(
        {
          streams: [],
          cursor: null,
          error: 'Twitch username not configured.',
        },
        { status: 200 }
      );
    }

    // Check cache
    const cacheKey = `twitch:${username}:${cursor}`;
    const cached = streamsCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Get access token
    const token = await getAccessToken();

    // Step 1: Resolve username to user_id
    const usersResponse = await fetch(
      `https://api.twitch.tv/helix/users?login=${username}`,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!usersResponse.ok) {
      throw new Error(`Twitch users API error: ${usersResponse.status}`);
    }

    const usersData: TwitchUsersResponse = await usersResponse.json();

    if (usersData.data.length === 0) {
      return NextResponse.json(
        {
          streams: [],
          cursor: null,
          error: 'Twitch user not found.',
        },
        { status: 200 }
      );
    }

    const userId = usersData.data[0].id;

    // Step 2: Fetch videos (past broadcasts)
    const videosUrl = new URL('https://api.twitch.tv/helix/videos');
    videosUrl.searchParams.set('user_id', userId);
    videosUrl.searchParams.set('type', 'archive');
    videosUrl.searchParams.set('first', '12');
    if (cursor) {
      videosUrl.searchParams.set('after', cursor);
    }

    const videosResponse = await fetch(videosUrl.toString(), {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!videosResponse.ok) {
      throw new Error(`Twitch videos API error: ${videosResponse.status}`);
    }

    const videosData: TwitchVideosResponse = await videosResponse.json();

    // Transform to normalized format
    const streams: PastStream[] = videosData.data.map((video) => ({
      id: video.id,
      title: video.title,
      url: video.url,
      thumbnailUrl: video.thumbnail_url.replace('%{width}', '640').replace('%{height}', '360'),
      duration: formatTwitchDuration(video.duration),
      viewCount: video.view_count,
      createdAt: video.created_at,
      platform: 'twitch',
    }));

    const result: TwitchStreamsResponse = {
      streams,
      cursor: videosData.pagination.cursor || null,
    };

    // Cache the result
    streamsCache.set(cacheKey, result);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching Twitch streams:', error);
    return NextResponse.json(
      {
        streams: [],
        cursor: null,
        error: 'Failed to fetch Twitch streams.',
      },
      { status: 200 }
    );
  }
}
