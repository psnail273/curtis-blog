/**
 * Seed script for the files table.
 *
 * Usage:
 *   npx tsx db/seed.ts
 *
 * Requires DATABASE_URL environment variable to be set.
 * Load from .env.local:
 *   source <(grep -v '^#' .env.local | xargs -d '\n' printf 'export %s\n') && npx tsx db/seed.ts
 *
 * Or inline:
 *   DATABASE_URL="postgresql://..." npx tsx db/seed.ts
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  console.error('Set it in your .env.local file or pass it inline.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

interface SeedFile {
  name: string;
  path: string;
  type: string;
  size: number;
  category: string;
  description: string;
  url: string;
  metadata: Record<string, unknown>;
}

const seedFiles: SeedFile[] = [
  {
    name: 'utils.ts',
    path: '/code/typescript/utils.ts',
    type: 'code',
    size: 2048,
    category: 'tutorial',
    description: 'TypeScript utility functions for string manipulation and date formatting.',
    url: 'https://gist.githubusercontent.com/example/utils.ts',
    metadata: { language: 'typescript', author: 'Curtis Israel', tags: ['utilities', 'typescript'] },
  },
  {
    name: 'data_analysis.py',
    path: '/code/python/data_analysis.py',
    type: 'code',
    size: 5120,
    category: 'project',
    description: 'Python script for analyzing education technology adoption data across school districts.',
    url: 'https://gist.githubusercontent.com/example/data_analysis.py',
    metadata: { language: 'python', author: 'Curtis Israel', tags: ['data-science', 'education'] },
  },
  {
    name: 'intro-to-game-design.mp4',
    path: '/videos/gaming/intro-to-game-design.mp4',
    type: 'video',
    size: 52428800,
    category: 'tutorial',
    description: 'Introduction to game design principles covering player agency, feedback loops, and level design.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    metadata: { duration: 1245, tags: ['game-design', 'tutorial'] },
  },
  {
    name: 'web-architecture-guide.pdf',
    path: '/documents/tech/web-architecture-guide.pdf',
    type: 'pdf',
    size: 1048576,
    category: 'reference',
    description: 'Comprehensive guide to modern web application architecture patterns and best practices.',
    url: 'https://example.com/files/web-architecture-guide.pdf',
    metadata: { author: 'Curtis Israel', tags: ['architecture', 'web-dev'], pages: 42 },
  },
  {
    name: 'blog-hero-banner.png',
    path: '/images/blog/blog-hero-banner.png',
    type: 'image',
    size: 307200,
    category: 'project',
    description: 'Hero banner image for the blog homepage featuring warm terracotta and cream tones.',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    metadata: { dimensions: { width: 1920, height: 1080 }, tags: ['design', 'branding'] },
  },
  {
    name: 'terminal-icon.svg',
    path: '/images/icons/terminal-icon.svg',
    type: 'image',
    size: 4096,
    category: 'project',
    description: 'SVG icon for the terminal component in the blog header.',
    url: 'https://raw.githubusercontent.com/example/terminal-icon.svg',
    metadata: { dimensions: { width: 24, height: 24 }, tags: ['icon', 'svg'] },
  },
  {
    name: 'curriculum-proposal.md',
    path: '/documents/education/curriculum-proposal.md',
    type: 'document',
    size: 8192,
    category: 'reference',
    description: 'Markdown document outlining a proposed curriculum for integrating coding into K-12 education.',
    url: 'https://gist.githubusercontent.com/example/curriculum-proposal.md',
    metadata: { author: 'Curtis Israel', tags: ['education', 'curriculum'] },
  },
  {
    name: 'react-hooks-deep-dive.mp4',
    path: '/videos/tech/react-hooks-deep-dive.mp4',
    type: 'video',
    size: 78643200,
    category: 'tutorial',
    description: 'Deep dive into React hooks: useState, useEffect, useCallback, useMemo, and custom hooks.',
    url: 'https://www.youtube.com/watch?v=dpw9EHDh2bM',
    metadata: { duration: 2340, language: 'typescript', tags: ['react', 'hooks', 'tutorial'] },
  },
  {
    name: 'tsconfig.json',
    path: '/code/config/tsconfig.json',
    type: 'code',
    size: 512,
    category: 'reference',
    description: 'Example TypeScript configuration for a Next.js 16 project with strict mode enabled.',
    url: 'https://gist.githubusercontent.com/example/tsconfig.json',
    metadata: { language: 'json', tags: ['config', 'typescript', 'nextjs'] },
  },
  {
    name: 'political-polarization-research.pdf',
    path: '/documents/politics/political-polarization-research.pdf',
    type: 'pdf',
    size: 2097152,
    category: 'reference',
    description: 'Research paper analyzing political polarization trends in the United States from 2000-2025.',
    url: 'https://example.com/files/political-polarization-research.pdf',
    metadata: { author: 'Curtis Israel', tags: ['politics', 'research'], pages: 28 },
  },
];

async function seed() {
  console.log('Seeding files table...');

  for (const file of seedFiles) {
    await sql`
      INSERT INTO files (name, path, type, size, category, description, url, metadata)
      VALUES (
        ${file.name},
        ${file.path},
        ${file.type},
        ${file.size},
        ${file.category},
        ${file.description},
        ${file.url},
        ${JSON.stringify(file.metadata)}::jsonb
      )
    `;
    console.log(`  Inserted: ${file.name}`);
  }

  console.log(`\nDone! Seeded ${seedFiles.length} files.`);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
