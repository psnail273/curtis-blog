import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FileRecord, FileRow } from '@/types/file';

/**
 * UUID v4 format regex for validation.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Map a database row (snake_case) to a FileRecord (camelCase).
 */
function toFileRecord(row: FileRow): FileRecord {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    type: row.type,
    size: row.size,
    uploadDate: row.upload_date,
    description: row.description,
    url: row.url,
    metadata: row.metadata,
  };
}

/**
 * GET /api/files/[id]
 *
 * Returns a single file record by UUID.
 * Returns 400 for invalid UUID format, 404 if file not found.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid file ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT * FROM files WHERE id = ${id}
    ` as FileRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const file: FileRecord = toFileRecord(rows[0]);
    return NextResponse.json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}
