import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { TerminalFallback } from '@/components/terminal/TerminalFallback';

export const metadata: Metadata = {
  title: 'Terminal',
  description: 'Interactive terminal for Curtis Israel\'s blog.',
};

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

export default function TerminalPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Terminal
        </h1>
        <p className="text-base md:text-lg text-muted leading-relaxed">
          An interactive terminal experience. Try commands like <code className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono text-sm">help</code>, <code className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono text-sm">whoami</code>, or <code className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono text-sm">contact</code>.
        </p>
      </div>

      <Terminal />

      {/* Fallback for no-JS users */}
      <noscript>
        <TerminalFallback />
      </noscript>
    </div>
  );
}
