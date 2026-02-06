import React from 'react';
import { mockArticles } from '@/lib/mock-articles';

export function lsCommand(args: string[]): React.ReactNode {
  const target = args[0]?.toLowerCase();

  // No arguments: show top-level "directories"
  if (!target) {
    return (
      <div className="space-y-1">
        <div className="text-accent">articles/</div>
        <div className="text-accent">about/</div>
        <div className="text-accent">contact/</div>
        <div className="text-muted mt-2">
          Tip: Try &apos;ls articles&apos; to see all posts
        </div>
      </div>
    );
  }

  // List articles
  if (target === 'articles' || target === 'articles/') {
    return (
      <div className="space-y-2">
        <div className="text-muted mb-2">
          {mockArticles.length} article{mockArticles.length !== 1 ? 's' : ''} found:
        </div>
        {mockArticles.map((article) => (
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
  }

  // Unknown directory
  return (
    <p className="text-muted">
      ls: cannot access &apos;{target}&apos;: No such file or directory
    </p>
  );
}
