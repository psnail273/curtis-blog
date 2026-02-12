import type { Metadata } from 'next';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { AboutPageMarkdown } from './AboutPageMarkdown';

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
    <div className="space-y-16">
      {/* Header section */}
      <section>
        {/* Decorative accent line */}
        <div className="w-12 h-1 rounded-full mb-8 bg-accent" />

        {/* Page heading - serif font from global h1 styles */}
        <h1 className="mb-4">About</h1>

        {/* Tagline */}
        <p className="text-lg text-muted">
          Writer, streamer, and professional opinion-haver.
        </p>
      </section>

      {/* Markdown Content */}
      {content ? (
        <section className="max-w-3xl">
          <AboutPageMarkdown content={content} />
        </section>
      ) : (
        <section className="max-w-3xl">
          <p className="text-muted">About page content coming soon.</p>
        </section>
      )}

      {/* CTA Section */}
      <section>
        <div className="border-t border-border pt-12">
          <p className="text-body text-lg leading-relaxed">
            Curious?{' '}
            <Link href="/articles">
              Check out the articles
            </Link>{' '}
            and see if anything catches your eye.
          </p>
        </div>
      </section>
    </div>
  );
}
