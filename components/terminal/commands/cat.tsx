import React, { useCallback } from 'react';
import { AsyncCommandOutput } from '../AsyncCommandOutput';
import { fetchFileByName } from '../utils/fileApi';
import { resolveFileType, formatFileSize, resolvePath, pathToArg } from '../utils/paths';
import type { CommandContext } from './index';
import type { FileRecord } from '@/types/file';
import type { Article } from '@/types/article';

/**
 * Render file metadata in terminal format.
 */
function FileDetails({ file }: { file: FileRecord }) {
  const date = new Date(file.uploadDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-2">
      <div className="text-accent text-lg font-semibold">{file.name}</div>
      <div className="space-y-1">
        <div className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Type:</span>
          <span className="text-body">{file.type}</span>
        </div>
        <div className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Size:</span>
          <span className="text-body">{formatFileSize(file.size)}</span>
        </div>
        <div className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Uploaded:</span>
          <span className="text-body">{formattedDate}</span>
        </div>
        {file.description && (
          <div className="flex gap-2 sm:gap-3 min-w-0">
            <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Desc:</span>
            <span className="text-body">{file.description}</span>
          </div>
        )}
        <FileTypeMetadata file={file} />
      </div>
      <div className="mt-3 pt-2 border-t border-border">
        <span className="text-muted">Download: </span>
        <a
          href={file.url}
          className="text-accent hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {file.url}
        </a>
      </div>
    </div>
  );
}

/**
 * Render type-specific metadata (language, duration, dimensions).
 */
function FileTypeMetadata({ file }: { file: FileRecord }) {
  const { metadata } = file;

  return (
    <>
      {file.type === 'code' && metadata.language && (
        <div className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Language:</span>
          <span className="text-body">{metadata.language}</span>
        </div>
      )}
      {file.type === 'video' && metadata.duration && (
        <div className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Duration:</span>
          <span className="text-body">{formatDuration(metadata.duration)}</span>
        </div>
      )}
      {file.type === 'image' && metadata.dimensions && (
        <div className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Dimensions:</span>
          <span className="text-body">
            {metadata.dimensions.width} x {metadata.dimensions.height}
          </span>
        </div>
      )}
      {metadata.tags && metadata.tags.length > 0 && (
        <div className="flex gap-2 sm:gap-3 min-w-0">
          <span className="text-muted shrink-0 w-20 sm:w-24 text-right">Tags:</span>
          <span className="text-body">{metadata.tags.join(', ')}</span>
        </div>
      )}
    </>
  );
}

/**
 * Format duration in seconds to a human-readable string (MM:SS or HH:MM:SS).
 */
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Async cat component for displaying file details.
 */
function CatFileAsync({ fileName, typeDirName }: { fileName: string; typeDirName: string }) {
  const loadData = useCallback(async () => {
    const fileType = resolveFileType(typeDirName);
    if (!fileType) {
      return (
        <p className="text-muted">
          cat: files/{typeDirName}/{fileName}: No such file or directory
        </p>
      );
    }

    const file = await fetchFileByName(fileName, fileType);
    if (!file) {
      return (
        <p className="text-muted">
          cat: files/{typeDirName}/{fileName}: No such file or directory
        </p>
      );
    }

    return <FileDetails file={file} />;
  }, [fileName, typeDirName]);

  return <AsyncCommandOutput loadData={loadData} />;
}

/**
 * Async cat component for displaying all articles.
 */
function CatArticlesAsync() {
  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Failed to fetch articles');
      const articles: Article[] = await res.json();

      if (articles.length === 0) {
        return <p className="text-muted">No articles found.</p>;
      }

      return (
        <div className="space-y-5">
          {articles.map((article) => {
            const date = new Date(article.publishedAt);
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={article.id} className="border-l-2 border-accent pl-3 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-accent font-semibold">{article.title}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted">{article.category}</span>
                  <span className="text-muted">&bull;</span>
                  <span className="text-muted">{formattedDate}</span>
                  <span className="text-muted">&bull;</span>
                  <span className="text-muted">{article.readTime} min read</span>
                </div>
                <p className="text-body mt-2">{article.excerpt}</p>
                <a
                  href={`/articles/${article.slug}`}
                  className="text-accent hover:underline text-sm inline-block mt-1"
                >
                  Read full article &rarr;
                </a>
              </div>
            );
          })}
        </div>
      );
    } catch {
      return <p className="text-muted">Error loading articles.</p>;
    }
  }, []);

  return <AsyncCommandOutput loadData={loadData} />;
}

/**
 * Async cat component for displaying a single article by slug.
 */
function CatArticleAsync({ slug }: { slug: string }) {
  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${slug}`);
      if (!res.ok) {
        return (
          <p className="text-muted">
            cat: articles/{slug}: No such file or directory
          </p>
        );
      }
      const article: Article = await res.json();

      const date = new Date(article.publishedAt);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return (
        <div className="space-y-3">
          <div className="text-accent text-lg font-semibold">{article.title}</div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted">{article.category}</span>
            <span className="text-muted">&bull;</span>
            <span className="text-muted">{formattedDate}</span>
            <span className="text-muted">&bull;</span>
            <span className="text-muted">{article.readTime} min read</span>
          </div>
          <p className="text-body">{article.excerpt}</p>
          <div className="text-muted mt-4">
            [Content preview truncated. Read full article at /articles/{article.slug}]
          </div>
          <a
            href={`/articles/${article.slug}`}
            className="text-accent hover:underline inline-block mt-2"
          >
            Read full article &rarr;
          </a>
        </div>
      );
    } catch {
      return (
        <p className="text-muted">
          cat: articles/{slug}: No such file or directory
        </p>
      );
    }
  }, [slug]);

  return <AsyncCommandOutput loadData={loadData} />;
}

export function catCommand(args: string[], context: CommandContext): React.ReactNode {
  const rawTarget = args[0];
  const target = rawTarget
    ? pathToArg(resolvePath(context.currentDirectory, rawTarget)).toLowerCase()
    : undefined;

  // No arguments: show usage help
  if (!target) {
    return (
      <p className="text-muted">
        cat: missing operand. Try &apos;cat articles&apos; or &apos;cat files/code/&lt;filename&gt;&apos;
      </p>
    );
  }

  // Show all articles (from database)
  if (target === 'articles' || target === 'articles/') {
    return <CatArticlesAsync />;
  }

  // Specific article by slug (from database)
  if (target.startsWith('articles/')) {
    const slug = target.replace('articles/', '');
    return <CatArticleAsync slug={slug} />;
  }

  // Cat a file: "cat files/<type>/<filename>"
  if (target.startsWith('files/')) {
    const parts = target.slice('files/'.length).split('/');

    // Need at least type directory and filename: "files/code/example.ts"
    if (parts.length < 2 || !parts[1]) {
      const typeDirName = parts[0];
      const fileType = resolveFileType(typeDirName);

      if (fileType) {
        return (
          <p className="text-muted">
            cat: specify a filename. Try &apos;cat files/{typeDirName}/&lt;filename&gt;&apos;
          </p>
        );
      }

      return (
        <p className="text-muted">
          cat: {target}: No such file or directory
        </p>
      );
    }

    const typeDirName = parts[0];
    // Rejoin remaining parts in case filename has slashes (unlikely but safe)
    const fileName = parts.slice(1).join('/');

    return <CatFileAsync fileName={fileName} typeDirName={typeDirName} />;
  }

  // Unknown file
  return (
    <p className="text-muted">
      cat: {target}: No such file or directory
    </p>
  );
}
