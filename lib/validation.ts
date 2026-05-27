/**
 * UUID v4 format regex for runtime validation.
 */
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns true if the given string is a valid UUID v4.
 */
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}
