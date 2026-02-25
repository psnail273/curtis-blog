import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 md:py-24 max-w-2xl mx-auto">
      {/* 404 number */}
      <h1 className="font-serif text-6xl md:text-8xl font-bold text-accent mb-4">
        404
      </h1>

      {/* Heading */}
      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
        Page Not Found
      </h2>

      {/* Body text */}
      <p className="font-sans text-base md:text-lg text-muted leading-relaxed mb-8">
        Looks like you&apos;ve wandered into uncharted territory. Let&apos;s get you back on track.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Back to Home button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground hover:bg-accent-hover rounded-lg font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Home
        </Link>

        {/* Browse Articles button */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Browse Articles
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
