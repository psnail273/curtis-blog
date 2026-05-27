import { NextResponse, after } from 'next/server';
import { getDb } from '@/lib/db';
import { refreshLiveStatus } from '@/lib/services/stream-refresh';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ platform: string; username: string }> }
) {
  try {
    const { platform, username } = await params;

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

    const sql = getDb();

    // Read from DB
    const rows = await sql`
      SELECT is_live, metadata, checked_at
      FROM live_status
      WHERE platform = ${platform} AND username = ${username}
    `;
    const row = rows[0];

    // If stale (>5 min) or missing, trigger background refresh
    const isStale = !row || (Date.now() - new Date(row.checked_at).getTime()) > 5 * 60 * 1000;
    if (isStale) {
      after(() => refreshLiveStatus());
    }

    return NextResponse.json({
      isLive: row?.is_live ?? false,
      platform,
      username,
      metadata: row?.metadata ?? {},
    });
  } catch (error) {
    console.error('Live status API error:', error);
    return NextResponse.json(
      { isLive: false, error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
