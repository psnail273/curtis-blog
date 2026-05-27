'use client';

import { useState } from 'react';
import { FileIcon } from '@/components/files/FileIcon';
import type { FileRecord } from '@/types/file';

interface PdfPreviewProps {
  file: FileRecord;
}

/**
 * Renders a PDF file using a native <iframe> embed.
 * Falls back to metadata card if the iframe fails to load.
 */
export function PdfPreview({ file }: PdfPreviewProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 rounded-lg border border-border bg-background text-center">
        <div className="text-accent mb-3">
          <FileIcon type="pdf" size={48} />
        </div>
        <p className="text-sm text-muted">
          PDF preview could not be loaded.
        </p>
        <p className="text-xs text-caption mt-1">
          Use the buttons below to download or open externally.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <iframe
        src={file.url}
        title={`PDF preview: ${file.name}`}
        className="w-full h-[300px] md:h-[500px] border-0"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
