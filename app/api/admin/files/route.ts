import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { getDb } from '@/lib/db';
import { detectFileType } from '@/lib/file-utils';
import type { FileRow, FileRecord } from '@/types/file';

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
 * GET /api/admin/files
 *
 * Returns all files ordered by upload_date DESC.
 */
export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM files ORDER BY upload_date DESC
    ` as FileRow[];

    return NextResponse.json(rows.map(toFileRecord));
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/files
 *
 * Accepts multipart form data with:
 *   - file (required): The file to upload
 *   - description (optional): File description text
 *
 * Uploads to Vercel Blob, inserts metadata into files table.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const description = formData.get('description') as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided. Please select a file to upload.' },
        { status: 400 }
      );
    }

    // Validate file size (4.5 MB limit for Vercel Blob free tier)
    const MAX_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 4.5 MB.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty. Please select a valid file.' },
        { status: 400 }
      );
    }

    // Detect file type from extension and MIME type
    const fileType = detectFileType(file.name, file.type);

    // Sanitize filename to prevent path traversal
    const sanitizedName = file.name.replace(/^.*[\\\/]/, '').replace(/\.\./g, '');

    // Upload to Vercel Blob
    let blob;
    try {
      blob = await put(sanitizedName, file, {
        access: 'public',
      });
    } catch (uploadError) {
      console.error('Blob upload failed:', uploadError);
      return NextResponse.json(
        { error: 'File upload failed. Please try again.' },
        { status: 502 }
      );
    }

    // Insert file metadata into database
    const sql = getDb();

    try {
      const rows = await sql`
        INSERT INTO files (name, path, type, size, description, url, metadata)
        VALUES (
          ${file.name},
          ${blob.pathname},
          ${fileType},
          ${file.size},
          ${description || null},
          ${blob.url},
          ${JSON.stringify({})}
        )
        RETURNING *
      ` as FileRow[];

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create file record.' },
          { status: 500 }
        );
      }

      return NextResponse.json(toFileRecord(rows[0]), { status: 201 });
    } catch (dbError) {
      console.error('Database insertion failed:', dbError);
      // Clean up orphaned blob
      try { await del(blob.url); } catch { /* best effort */ }
      return NextResponse.json(
        { error: 'File uploaded but failed to save record. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload. Please try again.' },
      { status: 500 }
    );
  }
}
