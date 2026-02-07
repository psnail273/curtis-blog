import React from 'react';
import type { CommandContext } from './index';

export function pwdCommand(_args: string[], context: CommandContext): React.ReactNode {
  return <p className="text-body">{context.currentDirectory}</p>;
}
