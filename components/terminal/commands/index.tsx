import React from 'react';
import { helpCommand } from './help';
import { clearCommand, type ClearSignal } from './clear';
import { whoamiCommand } from './whoami';
import { lsCommand } from './ls';
import { catCommand } from './cat';
import { liveCommand } from './live';
import { contactCommand } from './contact';
import { downloadCommand } from './download';
import { cdCommand } from './cd';
import { pwdCommand } from './pwd';

export interface CommandContext {
  currentDirectory: string;
  setCurrentDirectory: (dir: string) => void;
}

// Type definitions
export type CommandResult = React.ReactNode | ClearSignal;
export type CommandHandler = (args: string[], context: CommandContext) => CommandResult;

export interface CommandDefinition {
  name: string;
  description: string;
  handler: CommandHandler;
  aliases?: string[];
}

// Command registry
export const commands: Record<string, CommandDefinition> = {
  help: {
    name: 'help',
    description: 'Show available commands',
    handler: helpCommand,
  },
  clear: {
    name: 'clear',
    description: 'Clear terminal output',
    handler: clearCommand,
  },
  whoami: {
    name: 'whoami',
    description: 'Display information about Curtis',
    handler: whoamiCommand,
  },
  ls: {
    name: 'ls',
    description: 'List articles, files, and directories',
    handler: lsCommand,
  },
  cat: {
    name: 'cat',
    description: 'Display article or file details',
    handler: catCommand,
  },
  cd: {
    name: 'cd',
    description: 'Change current directory',
    handler: cdCommand,
  },
  pwd: {
    name: 'pwd',
    description: 'Print current directory',
    handler: pwdCommand,
  },
  download: {
    name: 'download',
    description: 'Download a file',
    handler: downloadCommand,
  },
  live: {
    name: 'live',
    description: 'Show streaming status and channels',
    handler: liveCommand,
  },
  contact: {
    name: 'contact',
    description: 'Display contact information',
    handler: contactCommand,
  },
};

// Execute command function
export function executeCommand(input: string, context: CommandContext): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  const commandDef = commands[commandName];

  if (!commandDef) {
    return (
      <p className="text-muted">
        command not found: {commandName}. Type &apos;help&apos; for available commands.
      </p>
    );
  }

  return commandDef.handler(args, context);
}

// Re-export CLEAR_TERMINAL_SIGNAL for Terminal.tsx
export { CLEAR_TERMINAL_SIGNAL, type ClearSignal } from './clear';
