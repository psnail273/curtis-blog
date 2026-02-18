import Link from 'next/link';

export function CTABanner() {
  return (
    <section className="my-6 lg:my-8 py-6 md:py-8 px-6 md:px-10 border-t border-border text-center">
      <p className="font-serif text-xl md:text-2xl text-foreground mb-2 leading-snug">
        Enjoy the writing?
      </p>
      <p className="font-sans text-sm text-muted mb-6 md:mb-8">
        Your support helps keep the analysis independent and the content free.
      </p>
      <Link
        href="/support"
        className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors text-sm tracking-wide uppercase"
      >
        Support This Publication
      </Link>
    </section>
  );
}
