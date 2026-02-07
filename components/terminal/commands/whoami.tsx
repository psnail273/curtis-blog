import React from 'react';
import type { CommandContext } from './index';

export function whoamiCommand(_args: string[], _context: CommandContext): React.ReactNode {
  return (
    <div className="space-y-3">
      <div className="text-accent">Curtis Israel</div>
      <p className="text-body">
        I stream, I write, I have opinions about politics, games, education,
        and whatever else catches my attention. Sometimes those opinions are
        even correct.
      </p>
      <p className="text-muted">
        This is where I put the longer thoughts that don&apos;t fit in a
        Twitch chat or a tweet. Expect posts about tech, education policy,
        gaming hot takes, and the occasional deep dive into something nobody
        asked about.
      </p>
    </div>
  );
}
