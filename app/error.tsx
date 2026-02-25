'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16 md:py-24 text-center">
      <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-3">
        Something went wrong
      </h2>
      <p className="font-sans text-base text-muted mb-8">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent-hover transition-colors duration-200"
      >
        Try again
      </button>
    </div>
  );
}
