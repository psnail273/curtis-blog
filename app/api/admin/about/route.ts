import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

interface AboutRow {
  id: string;
  section: string;
  content: string;
  order: number;
  updated_at: string;
}

/**
 * Consolidate multiple about_page sections into a single Markdown blob.
 * This handles migration from the old multi-section model.
 */
function consolidateSections(rows: AboutRow[]): string {
  const sectionHeadings: Record<string, string> = {
    bio: '',
    why: '## Why This Blog Exists',
    when: '## When Not Writing',
    topics: '## What I Write About',
  };

  const parts: string[] = [];

  for (const row of rows) {
    const heading = sectionHeadings[row.section];
    if (heading === undefined) {
      // Unknown section, include with a generic heading
      parts.push(`## ${row.section}\n\n${row.content}`);
    } else if (heading === '') {
      // Bio section has no heading
      parts.push(row.content);
    } else {
      parts.push(`${heading}\n\n${row.content}`);
    }
  }

  return parts.join('\n\n');
}

/**
 * GET /api/admin/about
 *
 * Returns the about page content as a single Markdown string.
 * If the database still has the old multi-section format, consolidates them
 * into one Markdown blob and migrates to the new single-content format.
 */
export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM about_page ORDER BY "order" ASC
    ` as AboutRow[];

    if (rows.length === 0) {
      return NextResponse.json({ content: '', updatedAt: null });
    }

    // Check if we have the new single-content model (section = 'content')
    const contentRow = rows.find((r) => r.section === 'content');
    if (contentRow) {
      return NextResponse.json({
        content: contentRow.content,
        updatedAt: contentRow.updated_at,
      });
    }

    // Old multi-section model: consolidate into one Markdown blob
    const consolidated = consolidateSections(rows);

    // Migrate: delete old rows and insert new single row
    const now = new Date().toISOString();
    await sql`DELETE FROM about_page`;
    await sql`
      INSERT INTO about_page (section, content, "order", updated_at)
      VALUES ('content', ${consolidated}, 1, ${now})
    `;

    return NextResponse.json({
      content: consolidated,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/about
 *
 * Updates the about page content.
 * Body: { content: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();

    const { content } = body;

    if (content === undefined || content === null) {
      return NextResponse.json(
        { error: 'Missing required field: content' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Upsert: update if 'content' row exists, otherwise insert
    const existing = await sql`
      SELECT id FROM about_page WHERE section = 'content'
    ` as { id: string }[];

    let rows: AboutRow[];

    if (existing.length > 0) {
      rows = await sql`
        UPDATE about_page
        SET content = ${content}, updated_at = ${now}
        WHERE section = 'content'
        RETURNING *
      ` as AboutRow[];
    } else {
      // First save: delete any old-format rows and insert new
      await sql`DELETE FROM about_page WHERE section != 'content'`;
      rows = await sql`
        INSERT INTO about_page (section, content, "order", updated_at)
        VALUES ('content', ${content}, 1, ${now})
        RETURNING *
      ` as AboutRow[];
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to save about content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: rows[0].content,
      updatedAt: rows[0].updated_at,
    });
  } catch (error) {
    console.error('Error updating about content:', error);
    return NextResponse.json(
      { error: 'Failed to update about content' },
      { status: 500 }
    );
  }
}
