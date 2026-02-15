import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-accent mt-10 md:mt-16">
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
          {/* Brand section */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
              Curtis Israel
            </h2>
            <p className="font-sans text-sm text-muted mb-4">
              Personal blog on politics, gaming, education, and tech.
            </p>
            <p className="font-sans text-xs text-caption">
              © 2026 Curtis Israel
            </p>
          </div>

          {/* Navigation section */}
          <nav
            className="flex flex-col gap-2"
            aria-label="Footer navigation"
          >
            <Link
              href="/about"
              className="font-sans text-sm text-secondary hover:text-accent transition-colors duration-200"
            >
              About
            </Link>
            <Link
              href="/files"
              className="font-sans text-sm text-secondary hover:text-accent transition-colors duration-200"
            >
              Files
            </Link>
            <Link
              href="/support"
              className="font-sans text-sm text-secondary hover:text-accent transition-colors duration-200"
            >
              Support
            </Link>
            <a
              href="https://patreon.com/curtisisrael"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-sm text-accent hover:text-accent-hover transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
              </svg>
              Patreon
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
