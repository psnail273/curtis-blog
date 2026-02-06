import React from 'react';
import { helpCommand } from './help';
import { clearCommand, type ClearSignal } from './clear';
import { whoamiCommand } from './whoami';
import { lsCommand } from './ls';
import { catCommand } from './cat';
import { liveCommand } from './live';
import { contactCommand } from './contact';

// Type definitions
export type CommandResult = React.ReactNode | ClearSignal;
export type CommandHandler = (args: string[]) => CommandResult;

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
    description: 'List articles and directories',
    handler: lsCommand,
  },
  cat: {
    name: 'cat',
    description: 'Display article details',
    handler: catCommand,
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
export function executeCommand(input: string): CommandResult {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Parse command: split by spaces, first word is command name, rest are args
  const parts = trimmed.split(/\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Look up command in registry
  const commandDef = commands[commandName];

  if (!commandDef) {
    // Unknown command error
    return (
      <p className="text-muted">
        command not found: {commandName}. Type &apos;help&apos; for available commands.
      </p>
    );
  }

  // Execute command handler
  return commandDef.handler(args);
}

// Re-export CLEAR_TERMINAL_SIGNAL for Terminal.tsx
export { CLEAR_TERMINAL_SIGNAL, type ClearSignal } from './clear';
