import { NextResponse } from 'next/server';
import { checkStreamStatus as checkTwitchStreamStatus } from '@/lib/services/twitch';
import { checkStreamStatus as checkYouTubeStreamStatus, YouTubeStreamStatus } from '@/lib/services/youtube';

interface CachedResponse {
  isLive: boolean;
  platform: string;
  username: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// In-memory cache for each platform/username combination
const cache = new Map<string, CachedResponse>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string; username: string }> }
) {
  try {
    const { platform, username } = await params;

    // Validate parameters
    if (!platform || !username) {
      return NextResponse.json(
        { isLive: false, error: 'Missing platform or username' },
        { status: 400 }
      );
    }

    if (platform !== 'twitch' && platform !== 'youtube') {
      return NextResponse.json(
        { isLive: false, error: 'Invalid platform. Must be "twitch" or "youtube"' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${platform}:${username}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        isLive: cached.isLive,
        platform: cached.platform,
        username: cached.username,
        metadata: cached.metadata,
      });
    }

    // Fetch fresh status
    let isLive = false;
    const metadata: Record<string, unknown> = {};

    if (platform === 'twitch') {
      // Validate Twitch credentials
      if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
        console.warn('Twitch API credentials not configured');
        return NextResponse.json(
          { isLive: false, error: 'Twitch API not configured' },
          { status: 500 }
        );
      }

      isLive = await checkTwitchStreamStatus(username);
    } else if (platform === 'youtube') {
      // Validate YouTube credentials
      if (!process.env.YOUTUBE_API_KEY) {
        console.warn('YouTube API key not configured');
        return NextResponse.json(
          { isLive: false, error: 'YouTube API not configured' },
          { status: 500 }
        );
      }

      const youtubeStatus: YouTubeStreamStatus = await checkYouTubeStreamStatus(username);
      isLive = youtubeStatus.isLive;
      if (youtubeStatus.videoId) {
        metadata.videoId = youtubeStatus.videoId;
      }
    }

    // Update cache
    const response: CachedResponse = {
      isLive,
      platform,
      username,
      timestamp: Date.now(),
      metadata,
    };
    cache.set(cacheKey, response);

    return NextResponse.json({
      isLive: response.isLive,
      platform: response.platform,
      username: response.username,
      metadata: response.metadata,
    });
  } catch (error) {
    console.error('Live status API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch status';
    return NextResponse.json(
      { isLive: false, error: errorMessage },
      { status: 500 }
    );
  }
}
