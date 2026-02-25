import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { getDb } from '@/lib/db';
import { StreamsPageContent } from './StreamsPageContent';

export const metadata: Metadata = {
  title: 'Streams',
  description: 'Watch live streams and past broadcasts from Curtis Israel on Twitch and YouTube.',
  openGraph: {
    title: 'Streams | Curtis Israel',
    description: 'Watch live streams and past broadcasts.',
  },
};

const getCachedStreams = unstable_cache(
  async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT platform, platform_id, title, url, thumbnail_url,
             duration, view_count, streamed_at
      FROM past_streams
      ORDER BY streamed_at DESC
      LIMIT 12
    `;
    return rows.map(row => ({
      id: row.platform_id,
      title: row.title,
      url: row.url,
      thumbnailUrl: row.thumbnail_url,
      duration: row.duration,
      viewCount: row.view_count,
      createdAt: row.streamed_at,
      platform: row.platform,
    }));
  },
  ['past-streams'],
  { tags: ['past-streams'], revalidate: 1800 }
);

export default async function StreamsPage() {
  let initialStreams: Awaited<ReturnType<typeof getCachedStreams>> = [];
  try {
    initialStreams = await getCachedStreams();
  } catch {
    // DB not available during build or cold start — empty is fine
  }

  return (
    <div className="py-4 md:py-6">
      <h1 className="sr-only">Streams</h1>
      <StreamsPageContent initialStreams={initialStreams} />
    </div>
  );
}
