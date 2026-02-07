import React from 'react';
import type { CommandContext } from './index';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-body">{title}</p>
      {children}
    </div>
  );
}

function Cmd({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex gap-2 sm:gap-4">
      <span className="text-accent w-16 sm:w-24 shrink-0">{name}</span>
      <span className="text-muted flex-1 min-w-0">{desc}</span>
    </div>
  );
}

export function helpCommand(_args: string[], _context: CommandContext): React.ReactNode {
  return (
    <div className="space-y-3">
      <Section title="Navigation">
        <Cmd name="cd" desc="Change current directory" />
        <Cmd name="pwd" desc="Print current directory" />
      </Section>

      <Section title="File Browsing">
        <Cmd name="ls" desc="List articles, files, and directories" />
        <Cmd name="cat" desc="Display article or file details" />
        <Cmd name="download" desc="Download a file" />
      </Section>

      <Section title="Information">
        <Cmd name="whoami" desc="Display information about Curtis" />
        <Cmd name="help" desc="Show this help message" />
      </Section>

      <Section title="Utilities">
        <Cmd name="clear" desc="Clear terminal output" />
        <Cmd name="live" desc="Show streaming status and channels" />
        <Cmd name="contact" desc="Display contact information" />
      </Section>

      <div className="text-muted text-sm mt-2">
        <p>Example: cd files → ls code → cat code/utils.ts → download code/utils.ts</p>
      </div>
    </div>
  );
}
