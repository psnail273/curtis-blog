import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Curtis Israel',
  description: 'Learn more about Curtis Israel - writer, streamer, and thinker on politics, gaming, education, and tech.',
};

export default function About() {
  return (
    <div>
      {/* Header section */}
      <section className="pb-12 md:pb-16">
        {/* Decorative accent line */}
        <div className="w-12 h-1 rounded-full mb-8 bg-accent" />

        {/* Page heading - serif font from global h1 styles */}
        <h1 className="mb-4">About</h1>

        {/* Tagline */}
        <p className="text-lg text-muted">
          Writer, streamer, and professional opinion-haver.
        </p>
      </section>

      {/* Biography Content */}
      <section className="max-w-3xl space-y-10">
        {/* Opening - who Curtis is */}
        <div className="space-y-4">
          <p className="text-lg leading-relaxed text-body">
            Curtis writes about the things that interest him: politics that
            actually matter, games worth playing, education that works, and
            technology that shapes how we live. Sometimes he streams.
            Sometimes the streams are even good.
          </p>
        </div>

        {/* What the blog is for */}
        <div className="space-y-4">
          <h2>Why this blog exists</h2>
          <p className="leading-relaxed text-body">
            This blog exists because some thoughts are too long for social
            media and too short for a book. It&apos;s a place to work through
            ideas, share opinions, and occasionally be proven wrong.
          </p>
        </div>

        {/* Personal note */}
        <div className="space-y-4">
          <h2>When not writing</h2>
          <p className="leading-relaxed text-body">
            When not writing or streaming, Curtis is probably reading, gaming,
            or having a strong opinion about something. Feel free to
            disagree&mdash;that&apos;s what comments are for (once we build
            them).
          </p>
        </div>
      </section>

      {/* Topics Section */}
      <section className="pt-12 pb-8">
        <h2>What I Write About</h2>
        <div className="flex flex-wrap gap-3">
          {['Politics', 'Gaming', 'Education', 'Tech', '& More'].map(
            (topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 bg-accent/10 text-accent rounded-md text-sm font-medium"
              >
                {topic}
              </span>
            )
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-8 pb-12">
        <div className="border-t border-border pt-8">
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
