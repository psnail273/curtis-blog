import type { FileRecord } from '@/types/file';
import { FileIcon } from '@/components/files/FileIcon';
import { formatDate, formatFileSize, capitalizeType } from '@/components/files/utils';

interface FileListProps {
  files: FileRecord[];
  onFileClick: (fileId: string) => void;
}

export function FileList({ files, onFileClick }: FileListProps) {
  return (
    <ul className="flex flex-col" role="list">
      {files.map((file, index) => (
        <li
          key={file.id}
          className={
            index < files.length - 1
              ? 'pb-6 mb-6 border-b border-border'
              : ''
          }
        >
          <button
            type="button"
            onClick={() => onFileClick(file.id)}
            aria-label={`View file details: ${file.name}`}
            className="group block w-full text-left rounded-lg min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* File type icon */}
              <div className="shrink-0 mt-1 text-accent">
                <FileIcon type={file.type} size={24} />
              </div>

              {/* File details */}
              <div className="min-w-0 flex-1">
                {/* Name and type badge row */}
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <span className="text-foreground font-medium text-base group-hover:text-accent transition-colors duration-200 truncate">
                    {file.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent shrink-0">
                    {capitalizeType(file.type)}
                  </span>
                </div>

                {/* Description */}
                {file.description && (
                  <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-1.5">
                    {file.description}
                  </p>
                )}

                {/* Metadata row: path, size, date */}
                <div className="flex items-center text-xs text-caption flex-wrap gap-y-1">
                  <span className="truncate max-w-[200px]" title={file.path}>
                    {file.path}
                  </span>
                  <span className="mx-2" aria-hidden="true">&middot;</span>
                  <span>{formatFileSize(file.size)}</span>
                  <span className="mx-2" aria-hidden="true">&middot;</span>
                  <span>{formatDate(file.uploadDate, 'short')}</span>
                </div>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
