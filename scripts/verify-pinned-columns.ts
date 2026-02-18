import { config } from 'dotenv';
import { getDb } from '../lib/db';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function verifyMigration() {
  try {
    const sql = getDb();

    console.log('Verifying pinned columns migration...\n');

    // Check column definitions
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'articles'
        AND column_name IN ('pinned', 'pinned_at')
      ORDER BY column_name
    `;

    console.log('✅ Column definitions:');
    columns.forEach((col: any) => {
      console.log(`   ${col.column_name}:`);
      console.log(`     - Type: ${col.data_type}`);
      console.log(`     - Nullable: ${col.is_nullable}`);
      console.log(`     - Default: ${col.column_default}`);
    });

    // Check index exists
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'articles'
        AND indexname = 'idx_articles_pinned'
    `;

    console.log('\n✅ Index verification:');
    if (indexes.length > 0) {
      console.log('   idx_articles_pinned exists');
      console.log(`   Definition: ${indexes[0].indexdef}`);
    } else {
      console.log('   ❌ idx_articles_pinned not found');
    }

    // Test query - get all articles with pinned status
    const testQuery = await sql`
      SELECT id, title, pinned, pinned_at
      FROM articles
      ORDER BY published_at DESC
      LIMIT 3
    `;

    console.log('\n✅ Sample query (3 most recent articles):');
    testQuery.forEach((article: any) => {
      console.log(`   - ${article.title.substring(0, 50)}...`);
      console.log(`     Pinned: ${article.pinned}, Pinned At: ${article.pinned_at || 'null'}`);
    });

    console.log('\n✅ Migration verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyMigration();
