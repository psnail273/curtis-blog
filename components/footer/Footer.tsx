import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-accent mt-10 md:mt-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand section */}
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground tracking-tight uppercase mb-2">
              Curtis Israel
            </h2>
            <p className="font-serif text-sm text-muted italic mb-4">
              Analysis and commentary on politics, gaming, education, and tech.
            </p>
            <p className="font-sans text-xs text-caption">
              &copy; 2026 Curtis Israel
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <h3 className="font-sans text-xs font-medium text-secondary uppercase tracking-wide mb-4">
              Navigate
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/streams" className="text-muted hover:text-accent transition-colors">
                  Streams
                </Link>
              </li>
              <li>
                <Link href="/files" className="text-muted hover:text-accent transition-colors">
                  Files
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-muted hover:text-accent transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </nav>

          {/* More */}
          <div>
            <h3 className="font-sans text-xs font-medium text-secondary uppercase tracking-wide mb-4">
              More
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#main-content"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Back to top
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
