'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/format-utils';
import { ArticleForm } from './ArticleForm';
import type { Article } from '@/types/article';

export function ArticlesManager() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/articles');
      if (!res.ok) throw new Error('Failed to fetch articles');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  function handleCreate() {
    setEditingArticle(null);
    setShowForm(true);
  }

  function handleEdit(article: Article) {
    setEditingArticle(article);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingArticle(null);
  }

  async function handleFormSave() {
    setShowForm(false);
    setEditingArticle(null);
    await fetchArticles();
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete article');
      }
      setDeleteConfirm(null);
      await fetchArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
      setDeleteConfirm(null);
    }
  }

  // ArticleForm is rendered as conditional return within ArticlesManager
  if (showForm) {
    return (
      <ArticleForm
        article={editingArticle}
        onSave={handleFormSave}
        onCancel={handleFormClose}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl">Articles</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Create Article
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted py-8 text-center">Loading articles...</p>
      ) : articles.length === 0 ? (
        <p className="text-muted py-8 text-center">No articles yet. Create your first article.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 font-medium text-muted">Title</th>
                <th className="py-3 pr-4 font-medium text-muted hidden sm:table-cell">Category</th>
                <th className="py-3 pr-4 font-medium text-muted hidden md:table-cell">Status</th>
                <th className="py-3 pr-4 font-medium text-muted hidden lg:table-cell">Published</th>
                <th className="py-3 font-medium text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-border/50">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-foreground">{article.title}</span>
                    <span className="block text-xs text-muted sm:hidden mt-0.5">
                      {article.category}
                      {' \u00B7 '}
                      {article.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span className="px-2 py-0.5 rounded-md text-xs bg-accent/10 text-accent">
                      {article.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-xs font-medium',
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      )}
                    >
                      {article.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted hidden lg:table-cell">
                    {article.publishedAt ? formatDateShort(article.publishedAt) : '\u2014'}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent/5 transition-colors"
                      >
                        Edit
                      </button>
                      {deleteConfirm === article.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-destructive text-white hover:opacity-90 transition-opacity"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent/5 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(article.id)}
                          className="px-3 py-1 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
