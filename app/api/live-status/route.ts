import { NextResponse } from 'next/server';
import { checkStreamStatus } from '@/lib/services/twitch';

interface CachedResponse {
  isLive: boolean;
  timestamp: number;
}

let cache: CachedResponse | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET() {
  try {
    // Check cache first
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ isLive: cache.isLive });
    }

    // Validate environment variables
    const channelName = process.env.TWITCH_CHANNEL_NAME;
    if (!channelName) {
      console.warn('TWITCH_CHANNEL_NAME not configured');
      return NextResponse.json({ isLive: false, error: 'Not configured' });
    }

    // Fetch fresh status
    const isLive = await checkStreamStatus(channelName);

    // Update cache
    cache = { isLive, timestamp: Date.now() };

    return NextResponse.json({ isLive });
  } catch (error) {
    console.error('Live status API error:', error);
    return NextResponse.json(
      { isLive: false, error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
