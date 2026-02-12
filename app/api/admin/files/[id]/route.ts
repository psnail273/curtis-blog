import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getDb } from '@/lib/db';
import type { FileRow } from '@/types/file';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Map a database row (snake_case) to a FileRecord (camelCase).
 */
function toFileRecord(row: FileRow) {
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
 * PATCH /api/admin/files/[id]
 *
 * Updates file description by UUID.
 * Returns the updated file record on success.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid file ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    let body: { description?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const { description } = body;

    if (description === undefined) {
      return NextResponse.json(
        { error: 'description must be provided.' },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id FROM files WHERE id = ${id}
    ` as { id: string }[];

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'File not found.' },
        { status: 404 }
      );
    }

    const descVal = description.trim() || null;

    const rows = await sql`
      UPDATE files
      SET description = ${descVal}
      WHERE id = ${id}
      RETURNING *
    ` as FileRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update file record.' },
        { status: 500 }
      );
    }

    return NextResponse.json(toFileRecord(rows[0]));
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to update file. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/files/[id]
 *
 * Deletes a file by UUID. Removes from Vercel Blob storage first,
 * then deletes the database record.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json(
        { error: 'Invalid file ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Fetch file record to get blob URL
    const rows = await sql`
      SELECT id, url FROM files WHERE id = ${id}
    ` as FileRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'File not found.' },
        { status: 404 }
      );
    }

    const fileUrl = rows[0].url;

    // Delete from Vercel Blob (warn on failure but proceed with DB deletion)
    try {
      await del(fileUrl);
    } catch (blobError) {
      console.warn(
        `Failed to delete blob for file ${id} at URL ${fileUrl}:`,
        blobError
      );
      // Proceed with database deletion to avoid orphan records
    }

    // Delete from database
    const deleted = await sql`
      DELETE FROM files WHERE id = ${id} RETURNING id
    ` as { id: string }[];

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete file record.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: deleted[0].id });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file. Please try again.' },
      { status: 500 }
    );
  }
}
