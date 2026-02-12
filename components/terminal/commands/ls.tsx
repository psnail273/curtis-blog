import React, { useCallback } from 'react';
import { AsyncCommandOutput } from '../AsyncCommandOutput';
import { fetchFiles } from '../utils/fileApi';
import { FILE_TYPE_DIRS, resolveFileType, formatFileSize, getFileTypeIndicator, resolvePath, pathToArg } from '../utils/paths';
import type { CommandContext } from './index';
import type { FileRecord, FileType } from '@/types/file';
import type { Article } from '@/types/article';

/**
 * Render a list of files in terminal format.
 */
function FileList({ files, type }: { files: FileRecord[]; type: FileType }) {
  return (
    <div className="space-y-1">
      <div className="text-muted mb-2">
        {files.length} file{files.length !== 1 ? 's' : ''} found:
      </div>
      {files.map((file) => (
        <div key={file.id} className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 text-xs sm:text-sm w-12 sm:w-14 text-right">
            {formatFileSize(file.size)}
          </span>
          <span className="text-muted shrink-0 text-xs sm:text-sm">
            {getFileTypeIndicator(type)}
          </span>
          <span className="text-body truncate">{file.name}</span>
        </div>
      ))}
      <div className="text-muted mt-3">
        Use &apos;cat files/{FILE_TYPE_DIRS[type]}/&lt;filename&gt;&apos; to see details
      </div>
    </div>
  );
}

/**
 * Show the virtual subdirectories under /files.
 */
function FilesDirectoryListing() {
  const dirs = Object.values(FILE_TYPE_DIRS).filter((d) => d !== 'other');
  return (
    <div className="space-y-1">
      {dirs.map((dir) => (
        <div key={dir} className="text-accent">{dir}/</div>
      ))}
      <div className="text-muted mt-2">
        Tip: Try &apos;ls files/code&apos; to see code files
      </div>
    </div>
  );
}

/**
 * Async ls component for listing files by type.
 */
function LsFilesAsync({ type }: { type: FileType }) {
  const loadData = useCallback(async () => {
    const files = await fetchFiles(type);
    if (files.length === 0) {
      return (
        <p className="text-muted">No files found in {FILE_TYPE_DIRS[type]}/</p>
      );
    }
    return <FileList files={files} type={type} />;
  }, [type]);

  return <AsyncCommandOutput loadData={loadData} />;
}

/**
 * Async ls component for listing articles from the database.
 */
function LsArticlesAsync() {
  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Failed to fetch articles');
      const articles: Article[] = await res.json();

      if (articles.length === 0) {
        return <p className="text-muted">No articles found.</p>;
      }

      return (
        <div className="space-y-2">
          <div className="text-muted mb-2">
            {articles.length} article{articles.length !== 1 ? 's' : ''} found:
          </div>
          {articles.map((article) => (
            <div key={article.id} className="flex gap-3">
              <span className="text-accent w-24 text-right">{article.category}</span>
              <span className="text-body">{article.title}</span>
            </div>
          ))}
          <div className="text-muted mt-3">
            Use &apos;cat articles&apos; to see article excerpts
          </div>
        </div>
      );
    } catch {
      return <p className="text-muted">Error loading articles.</p>;
    }
  }, []);

  return <AsyncCommandOutput loadData={loadData} />;
}

export function lsCommand(args: string[], context: CommandContext): React.ReactNode {
  const rawTarget = args[0]?.replace(/\/+$/, '');
  let target: string | undefined;
  if (rawTarget) {
    target = pathToArg(resolvePath(context.currentDirectory, rawTarget)).toLowerCase();
  } else if (context.currentDirectory !== '~') {
    target = pathToArg(context.currentDirectory).toLowerCase();
  }

  // No arguments and at home: show top-level "directories"
  if (!target) {
    return (
      <div className="space-y-1">
        <div className="text-accent">articles/</div>
        <div className="text-accent">files/</div>
        <div className="text-accent">about/</div>
        <div className="text-accent">contact/</div>
        <div className="text-muted mt-2">
          Tip: Try &apos;ls articles&apos; or &apos;ls files&apos; to explore
        </div>
      </div>
    );
  }

  // List articles from database
  if (target === 'articles') {
    return <LsArticlesAsync />;
  }

  // List files top-level: show subdirectories
  if (target === 'files') {
    return <FilesDirectoryListing />;
  }

  // List files by type: e.g. "ls files/code", "ls files/videos"
  if (target.startsWith('files/')) {
    const subDir = target.slice('files/'.length).split('/')[0];
    const fileType = resolveFileType(subDir);

    if (fileType) {
      return <LsFilesAsync type={fileType} />;
    }

    return (
      <p className="text-muted">
        ls: cannot access &apos;{target}&apos;: No such file or directory
      </p>
    );
  }

  // Unknown directory
  return (
    <p className="text-muted">
      ls: cannot access &apos;{target}&apos;: No such file or directory
    </p>
  );
}
