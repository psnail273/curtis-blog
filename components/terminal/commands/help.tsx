import React from 'react';
import { commands } from './index';

export function helpCommand(): React.ReactNode {
  return (
    <div className="space-y-1">
      <p className="text-body mb-2">Available commands:</p>
      {Object.values(commands).map((cmd) => (
        <div key={cmd.name} className="flex gap-2 sm:gap-4">
          <span className="text-accent w-16 sm:w-24 shrink-0">{cmd.name}</span>
          <span className="text-muted flex-1 min-w-0">{cmd.description}</span>
        </div>
      ))}
    </div>
  );
}
