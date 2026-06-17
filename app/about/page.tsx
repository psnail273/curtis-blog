import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { AboutPageMarkdown } from './AboutPageMarkdown';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about Curtis Israel - writer, streamer, and thinker on politics, gaming, education, and tech.',
  openGraph: {
    title: 'About | Curtis Israel',
    description: 'Learn more about Curtis Israel - writer, streamer, and thinker on politics, gaming, education, and tech.',
    url: '/about',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About | Curtis Israel',
    description: 'Learn more about Curtis Israel - writer, streamer, and thinker on politics, gaming, education, and tech.',
  },
};

async function getAboutContent(): Promise<string> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT content FROM about_page WHERE section = 'content' LIMIT 1
    ` as { content: string }[];

    return rows[0]?.content ?? '';
  } catch (error) {
    console.error('Error fetching about content:', error);
    return '';
  }
}

export default async function About() {
  const content = await getAboutContent();

  return (
    <div className="space-y-16 pb-8">
      {/* Markdown Content */}
      {content ? (
        <section>
          <AboutPageMarkdown content={content} />
        </section>
      ) : (
        <section>
          <p className="text-muted">About page content coming soon.</p>
        </section>
      )}
    </div>
  );
}
