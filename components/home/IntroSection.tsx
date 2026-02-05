export function IntroSection() {
  return (
    <section className="py-12 md:py-16 animate-fade-in-up">
      {/* Decorative accent line */}
      <div className="w-12 h-1 bg-accent rounded-full mb-8" aria-hidden="true" />

      {/* Heading - uses serif font from global h2 styles */}
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
        Hey, I&apos;m Curtis
      </h2>

      {/* Bio copy */}
      <div className="max-w-xl space-y-4">
        <p className="text-lg leading-relaxed text-body">
          I stream, I write, I have opinions about politics, games, education,
          and whatever else catches my attention. Sometimes those opinions are
          even correct.
        </p>
        <p className="text-base leading-relaxed text-muted">
          This is where I put the longer thoughts that don&apos;t fit in a
          Twitch chat or a tweet. Expect posts about tech, education policy,
          gaming hot takes, and the occasional deep dive into something nobody
          asked about.
        </p>
      </div>
    </section>
  );
}
