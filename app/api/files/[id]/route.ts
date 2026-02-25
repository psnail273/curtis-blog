import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { toFileRecord } from '@/lib/file-utils';
import { UUID_REGEX } from '@/lib/validation';
import { FileRecord, FileRow } from '@/types/file';

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
