import dynamic from 'next/dynamic';
import Link from 'next/link';
import StreamingStatus from '@/components/streaming/StreamingStatus';
import { TerminalFallback } from '@/components/terminal/TerminalFallback';

// Dynamically import Terminal for code splitting
const Terminal = dynamic(
  () => import('@/components/terminal/Terminal').then(mod => ({ default: mod.Terminal })),
  {
    loading: () => (
      <div className="py-12 md:py-16 animate-pulse">
        <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] bg-border/50 rounded-lg" />
      </div>
    ),
  }
);

export default function Home() {
  return (
    <div className="flex flex-col gap-12 md:gap-16 py-8 md:py-12">
      {/* Hidden h1 for semantic structure and screen readers */}
      <h1 className="sr-only">Curtis Israel&apos;s Blog</h1>

      {/* Terminal: Signature brand element replacing IntroSection */}
      <Terminal />

      {/* Fallback for no-JS users */}
      <noscript>
        <TerminalFallback />
      </noscript>

      {/* Streaming Status: Prominent and actionable */}
      <StreamingStatus />

      {/* Support CTA: Subtle encouragement */}
      <section className="border-t border-border pt-8">
        <p className="text-body text-lg leading-relaxed">
          Enjoy what you read here?{' '}
          <Link href="/support">
            Consider supporting the blog
          </Link>{' '}
          and help keep it going.
        </p>
      </section>
    </div>
  );
}
