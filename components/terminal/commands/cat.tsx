import React from 'react';
import { mockArticles } from '@/lib/mock-articles';

export function catCommand(args: string[]): React.ReactNode {
  const target = args[0]?.toLowerCase();

  // No arguments: error
  if (!target) {
    return (
      <p className="text-muted">
        cat: missing operand. Try &apos;cat articles&apos; to see all posts
      </p>
    );
  }

  // Show all articles
  if (target === 'articles' || target === 'articles/') {
    return (
      <div className="space-y-5">
        {mockArticles.map((article) => {
          // Format date
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
  }

  // Specific article by slug
  if (target.startsWith('articles/')) {
    const slug = target.replace('articles/', '');
    const article = mockArticles.find((a) => a.slug === slug);

    if (!article) {
      return (
        <p className="text-muted">
          cat: {target}: No such file or directory
        </p>
      );
    }

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
  }

  // Unknown file
  return (
    <p className="text-muted">
      cat: {target}: No such file or directory
    </p>
  );
}
