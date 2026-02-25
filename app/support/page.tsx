import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Support Curtis Israel\'s writing on politics, gaming, education, and tech. Help keep the blog going through Patreon.',
  openGraph: {
    title: 'Support | Curtis Israel',
    description: 'Support Curtis Israel\'s writing on politics, gaming, education, and tech. Help keep the blog going through Patreon.',
    url: '/support',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Support | Curtis Israel',
    description: 'Support Curtis Israel\'s writing on politics, gaming, education, and tech. Help keep the blog going through Patreon.',
  },
};

export default function Support() {
  return (
    <div className="space-y-10 pb-8">
      <section className="border-l-4 border-accent pl-6">
        <h1 className="mb-4">Support</h1>
        <p className="text-lg text-muted">
          If you enjoy what you read here, consider helping keep it going.
        </p>
      </section>

      <section className="space-y-8">
        <div className="space-y-4">
          <h2>Why support matters</h2>
          <p className="text-lg leading-relaxed text-body">
            Writing takes time. Good writing takes more. Every article on this
            blog is researched, drafted, revised, and published because someone
            thought it was worth reading. Your support helps make that possible
            and signals that independent writing still has a place.
          </p>
        </div>

        <div className="space-y-4">
          <h2>What your support enables</h2>
          <p className="leading-relaxed text-body">
            Contributions go directly toward keeping the lights on: hosting,
            tools, and the time it takes to produce thoughtful content instead of
            hot takes. No paywalls, no gated content&mdash;just better writing,
            more often.
          </p>
        </div>

        <div className="space-y-6">
          <h2>Become a supporter</h2>
          <p className="leading-relaxed text-body">
            The easiest way to support this blog is through Patreon. Pick a tier
            that works for you, or just drop by to say thanks. Every bit counts.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent-hover text-base font-semibold px-8 py-3 h-auto"
          >
            <a
              href="https://patreon.com/curtisisrael"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support on Patreon
            </a>
          </Button>
          <p className="text-sm text-caption">
            Opens in a new tab. No account required to browse.
          </p>
        </div>
      </section>

      <section>
        <div className="border-t border-border pt-12 space-y-4">
          <h2>What&apos;s ahead</h2>
          <p className="leading-relaxed text-body">
            As this blog grows, supporters may get early access to drafts,
            behind-the-scenes notes, and a say in what topics get covered next.
            For now, your support is its own reward&mdash;and deeply appreciated.
          </p>
          <p className="text-body text-lg leading-relaxed">
            Want to read first?{' '}
            <Link href="/articles">
              Check out the articles
            </Link>{' '}
            and see what this is all about.
          </p>
        </div>
      </section>
    </div>
  );
}
