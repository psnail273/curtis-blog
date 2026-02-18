export function Footer() {
  return (
    <footer className="w-full border-t-2 border-accent mt-10 md:mt-16">
      <div className="mx-auto max-w-4xl px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
          {/* Brand section */}
          <div>
            <h2 className="font-serif text-xl font-bold text-foreground tracking-tight uppercase mb-2">
              Curtis Israel
            </h2>
            <p className="font-serif text-sm text-muted italic mb-4">
              Analysis and commentary on politics, gaming, education, and tech.
            </p>
            <p className="font-sans text-xs text-caption">
              © 2026 Curtis Israel
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
