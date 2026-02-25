// This file is used by drizzle-kit for migrations only (drizzle.config.ts).
// Production code uses lib/db.ts (dynamic import) instead of this module.
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, { schema })
