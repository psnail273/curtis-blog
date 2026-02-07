import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

/**
 * Get the Neon serverless SQL tagged-template function.
 * Lazily initialized on first call to avoid errors during build
 * when DATABASE_URL is not available.
 *
 * Usage:
 *   import { getDb } from '@/lib/db';
 *   const sql = getDb();
 *   const rows = await sql`SELECT * FROM files WHERE type = ${type}`;
 */
export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Please add it to your .env.local file. ' +
        'See .env.local.example for instructions.'
      );
    }
    _sql = neon(url);
  }
  return _sql;
}
