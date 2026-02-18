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
    const migrationPath = join(process.cwd(), 'db/migrations/003_add_pinned_articles.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('Running migration: 003_add_pinned_articles');
    console.log('Adding pinned and pinned_at columns to articles table...\n');

    // Run the migration commands
    // Add columns
    await sql`
      ALTER TABLE articles
        ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ DEFAULT NULL
    `;
    console.log('✅ Added pinned and pinned_at columns');

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_articles_pinned ON articles (pinned, pinned_at DESC NULLS LAST)
        WHERE status = 'published'
    `;
    console.log('✅ Created index idx_articles_pinned');

    // Verify the migration
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'articles'
        AND column_name IN ('pinned', 'pinned_at')
      ORDER BY column_name
    `;

    console.log('\n✅ Migration completed successfully!');
    console.log('✅ Verified columns:');
    result.forEach((col: any) => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
