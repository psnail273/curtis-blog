import { config } from 'dotenv';
import { getDb } from '../lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function runMigration() {
  try {
    const sql = getDb();

    // Read the migration file
    const migrationPath = join(process.cwd(), 'db/migrations/002_add_cover_image_to_articles.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    // Extract just the SQL commands (skip comments)
    const sqlCommands = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n');

    console.log('Running migration: 002_add_cover_image_to_articles');
    console.log('SQL:', sqlCommands);

    // Run the migration
    await sql`ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image TEXT`;

    console.log('✅ Migration completed successfully!');
    console.log('✅ Added cover_image column to articles table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
