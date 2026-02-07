import React from 'react';
import type { CommandContext } from './index';
import { resolvePath, isValidDirectory } from '../utils/paths';

export function cdCommand(args: string[], context: CommandContext): React.ReactNode {
  const target = args[0]?.replace(/\/+$/, '');
  const resolved = resolvePath(context.currentDirectory, target);

  if (!isValidDirectory(resolved)) {
    return (
      <p className="text-muted">
        cd: no such directory: {target || '(empty)'}
      </p>
    );
  }

  context.setCurrentDirectory(resolved);
  return null;
}
