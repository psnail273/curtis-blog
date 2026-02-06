export const CLEAR_TERMINAL_SIGNAL = Symbol('CLEAR_TERMINAL');

export type ClearSignal = typeof CLEAR_TERMINAL_SIGNAL;

export function clearCommand(): ClearSignal {
  return CLEAR_TERMINAL_SIGNAL;
}
