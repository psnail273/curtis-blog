import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { getDb } from '@/lib/db';
import { refreshPastStreams } from '@/lib/services/stream-refresh';

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = 12;

    // Read from DB with offset-based pagination
    const rows = await sql`
      SELECT
        id, platform, platform_id, title, url, thumbnail_url,
        duration, view_count, streamed_at, created_at
      FROM past_streams
      ORDER BY streamed_at DESC
      LIMIT ${limit + 1} OFFSET ${offset}
    `;

    const hasMore = rows.length > limit;
    const streams = rows.slice(0, limit).map(row => ({
      id: row.platform_id,
      title: row.title,
      url: row.url,
      thumbnailUrl: row.thumbnail_url,
      duration: row.duration,
      viewCount: row.view_count,
      createdAt: row.streamed_at,
      platform: row.platform,
    }));

    // If no data or stale (>30 min since newest created_at), trigger background refresh
    const newest = await sql`SELECT MAX(created_at) as latest FROM past_streams`;
    const latestCreatedAt = newest[0]?.latest;
    const isStale = !latestCreatedAt || (Date.now() - new Date(latestCreatedAt).getTime()) > 30 * 60 * 1000;

    if (isStale) {
      after(() => refreshPastStreams());
    }

    return NextResponse.json(
      { streams, hasMore },
      {
        headers: {
          'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json(
      { streams: [], hasMore: false, error: 'Failed to fetch streams.' },
      { status: 200 }
    );
  }
}
