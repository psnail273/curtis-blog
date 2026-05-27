import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { toFileRecord } from '@/lib/file-utils';
import { FileRecord, FileRow, FILE_TYPES, FileType } from '@/types/file';

/**
 * GET /api/files
 *
 * Returns an array of file records. Supports optional query params:
 *   - type: Filter by file type (code, video, pdf, image, document, other)
 *   - path: Filter by path prefix (matches files whose path starts with the value)
 */
export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const path = searchParams.get('path');

    // Validate type param if provided
    if (type && !FILE_TYPES.includes(type as FileType)) {
      return NextResponse.json(
        { error: `Invalid type parameter. Must be one of: ${FILE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    let rows: FileRow[];

    if (type && path) {
      rows = await sql`
        SELECT * FROM files
        WHERE type = ${type} AND path LIKE ${path + '%'}
        ORDER BY upload_date DESC
      ` as FileRow[];
    } else if (type) {
      rows = await sql`
        SELECT * FROM files WHERE type = ${type}
        ORDER BY upload_date DESC
      ` as FileRow[];
    } else if (path) {
      rows = await sql`
        SELECT * FROM files WHERE path LIKE ${path + '%'}
        ORDER BY upload_date DESC
      ` as FileRow[];
    } else {
      rows = await sql`
        SELECT * FROM files ORDER BY upload_date DESC
      ` as FileRow[];
    }

    const files: FileRecord[] = rows.map(toFileRecord);
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}
