import { clearFileCache } from '../utils/fileApi';

export const CLEAR_TERMINAL_SIGNAL = Symbol('CLEAR_TERMINAL');

export type ClearSignal = typeof CLEAR_TERMINAL_SIGNAL;

export function clearCommand(_args: string[], _context: import('./index').CommandContext): ClearSignal {
  clearFileCache();
  return CLEAR_TERMINAL_SIGNAL;
}
