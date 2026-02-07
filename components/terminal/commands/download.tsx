'use client';

import React, { useCallback } from 'react';
import type { CommandContext } from './index';
import { AsyncCommandOutput } from '../AsyncCommandOutput';
import { fetchFileByName } from '../utils/fileApi';
import { resolvePath, pathToArg, resolveFileType, formatFileSize } from '../utils/paths';

function DownloadFileAsync({ filePath }: { filePath: string }) {
  const loadData = useCallback(async () => {
    const parts = filePath.split('/');

    if (parts.length < 3 || parts[0] !== 'files') {
      return (
        <p className="text-muted">
          download: invalid path. Usage: download files/code/&lt;filename&gt;
        </p>
      );
    }

    const typeDirName = parts[1];
    const fileName = parts.slice(2).join('/');
    const fileType = resolveFileType(typeDirName);

    if (!fileType) {
      return (
        <p className="text-muted">
          download: {filePath}: No such file or directory
        </p>
      );
    }

    const file = await fetchFileByName(fileName, fileType);

    if (!file) {
      return (
        <p className="text-muted">
          download: {filePath}: No such file or directory
        </p>
      );
    }

    if (typeof window !== 'undefined') {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return (
      <div className="space-y-1">
        <p className="text-body">
          Downloading {file.name} ({formatFileSize(file.size)})...
        </p>
        <p className="text-muted text-sm">
          If the download did not start, visit:{' '}
          <a
            href={file.url}
            className="text-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {file.url}
          </a>
        </p>
      </div>
    );
  }, [filePath]);

  return <AsyncCommandOutput loadData={loadData} />;
}

export function downloadCommand(args: string[], context: CommandContext): React.ReactNode {
  const target = args[0]?.replace(/\/+$/, '');

  if (!target) {
    return (
      <div className="space-y-1">
        <p className="text-muted">download: missing filename.</p>
        <p className="text-muted">Usage: download files/code/&lt;filename&gt;</p>
        <p className="text-muted">Try: ls files/code to see available files</p>
      </div>
    );
  }

  const resolved = resolvePath(context.currentDirectory, target);
  const filePath = pathToArg(resolved);

  if (!filePath.startsWith('files/')) {
    return (
      <p className="text-muted">
        download: can only download from files/ directory. Try: download files/code/&lt;filename&gt;
      </p>
    );
  }

  return <DownloadFileAsync filePath={filePath} />;
}
