const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format a date string as "January 1, 2024" (full month name).
 * Uses UTC to produce identical output on server and client (avoids hydration mismatches).
 */
export function formatDateLong(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return `${MONTHS_LONG[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return dateString;
  }
}

/**
 * Format a date string as "Jan 1, 2024" (abbreviated month name).
 * Uses UTC to produce identical output on server and client (avoids hydration mismatches).
 */
export function formatDateShort(dateString: string): string {
  try {
    const d = new Date(dateString);
    return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return dateString;
  }
}
