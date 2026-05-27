'use client';

import { useState } from 'react';
import { FileIcon } from '@/components/files/FileIcon';
import type { FileRecord } from '@/types/file';

interface VideoPreviewProps {
  file: FileRecord;
}

/**
 * Renders a video file using the native HTML5 <video> element.
 * Supports MP4 and WebM formats. Falls back to metadata card on error.
 */
export function VideoPreview({ file }: VideoPreviewProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-6 rounded-lg border border-border bg-background text-center">
        <div className="text-accent mb-3">
          <FileIcon type="video" size={48} />
        </div>
        <p className="text-sm text-muted">
          Video preview could not be loaded.
        </p>
        <p className="text-xs text-caption mt-1">
          Use the buttons below to download or open externally.
        </p>
      </div>
    );
  }

  const poster = typeof file.metadata.poster === 'string'
    ? file.metadata.poster
    : undefined;

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      <video
        src={file.url}
        controls
        preload="metadata"
        poster={poster}
        className="w-full max-h-[300px] md:max-h-[500px] object-contain bg-black"
        onError={() => setHasError(true)}
        aria-label={`Video: ${file.name}`}
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}
