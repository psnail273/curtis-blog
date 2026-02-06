export function TerminalFallback() {
  return (
    <section
      className="terminal-window rounded-lg border border-border overflow-hidden"
      aria-label="About Curtis"
    >
      {/* Title bar */}
      <div className="terminal-title-bar flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm font-terminal text-muted">
            curtis@blog ~ %
          </span>
        </div>
        <div className="w-[52px]" aria-hidden="true" />
      </div>

      {/* Static terminal content */}
      <div className="terminal-content p-4 md:p-6 min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
        <div className="font-terminal space-y-4">
          <div className="text-accent text-xs sm:text-sm">
            <span className="hidden sm:inline">visitor@curtis.blog $ whoami</span>
            <span className="sm:hidden">visitor $ whoami</span>
          </div>
          <div className="text-body space-y-2">
            <p>Curtis Israel</p>
            <p>
              Welcome! I&apos;m Curtis—a passionate educator, gamer, and tech enthusiast sharing
              thoughts on politics, education, gaming, and technology. This blog is where I
              explore ideas, review games, discuss educational trends, and dive into the
              intersection of technology and society.
            </p>
            <p className="text-muted">
              JavaScript is required for the interactive terminal. Type &apos;help&apos; for available
              commands.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
