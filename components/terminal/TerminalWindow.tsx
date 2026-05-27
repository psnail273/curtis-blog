import React from 'react';

interface TerminalWindowProps {
  children: React.ReactNode;
}

export function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <section
      className="terminal-window rounded-lg border border-border overflow-hidden"
      aria-label="Terminal interface"
    >
      {/* Skip link for keyboard users */}
      <a
        href="#streaming-status"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-accent focus:text-white focus:rounded"
      >
        Skip terminal
      </a>

      {/* Title bar */}
      <div className="terminal-title-bar flex items-center justify-between px-4 py-3 border-b border-border">
        {/* Window control dots */}
        <div className="flex items-center gap-2" aria-hidden="true">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
        </div>

        {/* Window title */}
        <div className="flex-1 text-center">
          <span className="text-sm font-terminal text-muted">
            curtis@blog ~ %
          </span>
        </div>

        {/* Spacer for centering */}
        <div className="w-[52px]" aria-hidden="true" />
      </div>

      {/* Terminal content area */}
      <div className="terminal-content p-4 md:p-6 min-h-[200px] sm:min-h-[300px] md:min-h-[400px]">
        {children}
      </div>
    </section>
  );
}
