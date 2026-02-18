'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/file-utils';
import { FileIcon } from '@/components/files/FileIcon';
import type { Article } from '@/types/article';
import type { FileRecord } from '@/types/file';

type Tab = 'articles' | 'about' | 'files';

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  status: 'draft' | 'published';
  author: string;
}

const CATEGORIES = ['Education', 'Gaming', 'Politics', 'Tech', 'Other'];

const EMPTY_FORM: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Tech',
  readTime: 5,
  status: 'draft',
  author: 'Curtis Israel',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Login gate component
// ---------------------------------------------------------------------------

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed.');
      }

      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto pt-16">
      <div className="w-12 h-1 rounded-full mb-6 bg-accent" />
      <h1 className="mb-2">Admin</h1>
      <p className="text-muted mb-8">Enter the admin password to continue.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium mb-1.5">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            placeholder="Enter admin password"
            autoFocus
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main admin content component
// ---------------------------------------------------------------------------

export function AdminPageContent() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('articles');

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        setAuthenticated(data.authenticated === true);
      } catch {
        setAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {
      // Clear local state even if the request fails
    }
    setAuthenticated(false);
  }

  // Loading state while checking session
  if (authenticated === null) {
    return (
      <div className="max-w-5xl mx-auto pb-16">
        <p className="text-muted py-16 text-center">Checking session...</p>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!authenticated) {
    return <LoginGate onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <header className="mb-8">
        <div className="w-12 h-1 rounded-full mb-6 bg-accent" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2">Admin</h1>
            <p className="text-muted">Manage articles, about page content, and files.</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-accent/5 transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="flex gap-1 mb-8 border-b border-border" aria-label="Admin sections">
        <button
          onClick={() => setActiveTab('articles')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors relative',
            activeTab === 'articles'
              ? 'text-accent'
              : 'text-muted hover:text-foreground'
          )}
          aria-selected={activeTab === 'articles'}
          role="tab"
        >
          Articles
          {activeTab === 'articles' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors relative',
            activeTab === 'about'
              ? 'text-accent'
              : 'text-muted hover:text-foreground'
          )}
          aria-selected={activeTab === 'about'}
          role="tab"
        >
          About
          {activeTab === 'about' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors relative',
            activeTab === 'files'
              ? 'text-accent'
              : 'text-muted hover:text-foreground'
          )}
          aria-selected={activeTab === 'files'}
          role="tab"
        >
          Files
          {activeTab === 'files' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
          )}
        </button>
      </nav>

      {/* Tab content */}
      {activeTab === 'articles' && <ArticlesManager />}
      {activeTab === 'about' && <AboutManager />}
      {activeTab === 'files' && <FilesManager />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Articles manager
// ---------------------------------------------------------------------------

function ArticlesManager() {
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

  async function handleTogglePin(id: string, pinned: boolean) {
    try {
      const res = await fetch(`/api/admin/articles/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update pin status');
      }
      await fetchArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update pin status');
    }
  }

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
        <div>
          <h2 className="text-xl">Articles</h2>
          {articles.filter(a => a.pinned).length > 0 && (
            <p className="text-xs text-muted mt-1">
              {articles.filter(a => a.pinned).length} of 6 hero slots filled
            </p>
          )}
        </div>
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
                <th className="py-3 pr-4 font-medium text-muted hidden md:table-cell">Pinned</th>
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
                      {article.pinned && ' \u00B7 Pinned'}
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
                  <td className="py-3 pr-4 hidden md:table-cell">
                    <button
                      onClick={() => handleTogglePin(article.id, !article.pinned)}
                      className={cn(
                        'px-2 py-0.5 rounded-md text-xs font-medium transition-colors',
                        article.pinned
                          ? 'bg-accent/10 text-accent hover:bg-accent/20'
                          : 'bg-muted/50 text-muted hover:bg-muted/80'
                      )}
                      aria-label={article.pinned ? `Unpin "${article.title}"` : `Pin "${article.title}"`}
                    >
                      {article.pinned ? 'Pinned' : 'Pin'}
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-muted hidden lg:table-cell">
                    {article.publishedAt ? formatDate(article.publishedAt) : '\u2014'}
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

// ---------------------------------------------------------------------------
// Article form (create / edit)
// ---------------------------------------------------------------------------

interface ArticleFormProps {
  article: Article | null;
  onSave: () => void;
  onCancel: () => void;
}

function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
  const isEditing = article !== null;

  const [form, setForm] = useState<ArticleFormData>(() => {
    if (article) {
      return {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        readTime: article.readTime,
        status: (article.status as 'draft' | 'published') || 'draft',
        author: article.author,
      };
    }
    return { ...EMPTY_FORM };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.slug.trim()) errors.slug = 'Slug is required';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
    if (!form.excerpt.trim()) errors.excerpt = 'Excerpt is required';
    if (!form.content.trim()) errors.content = 'Content is required';
    if (!form.category) errors.category = 'Category is required';
    if (!form.readTime || form.readTime < 1) errors.readTime = 'Read time must be at least 1 minute';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError(null);

    try {
      const url = isEditing
        ? `/api/admin/articles/${article.id}`
        : '/api/admin/articles';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save article');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  // Auto-generate slug from title when creating
  function handleTitleChange(value: string) {
    updateField('title', value);
    if (!isEditing) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      updateField('slug', autoSlug);
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-6">
        {isEditing ? 'Edit Article' : 'Create Article'}
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1.5">
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm',
              fieldErrors.title ? 'border-destructive' : 'border-border'
            )}
            placeholder="Article title"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1.5">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            id="slug"
            type="text"
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm font-mono',
              fieldErrors.slug ? 'border-destructive' : 'border-border'
            )}
            placeholder="article-slug"
          />
          {fieldErrors.slug && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.slug}</p>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1.5">
            Excerpt <span className="text-destructive">*</span>
          </label>
          <textarea
            id="excerpt"
            value={form.excerpt}
            onChange={(e) => updateField('excerpt', e.target.value)}
            rows={3}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm resize-y',
              fieldErrors.excerpt ? 'border-destructive' : 'border-border'
            )}
            placeholder="Brief summary of the article"
          />
          {fieldErrors.excerpt && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.excerpt}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1.5">
            Content (Markdown) <span className="text-destructive">*</span>
          </label>
          <textarea
            id="content"
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            rows={20}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm font-mono resize-y',
              fieldErrors.content ? 'border-destructive' : 'border-border'
            )}
            placeholder="Article content in Markdown"
          />
          {fieldErrors.content && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.content}</p>
          )}
        </div>

        {/* Category + Read Time + Status row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1.5">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm',
                fieldErrors.category ? 'border-destructive' : 'border-border'
              )}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="readTime" className="block text-sm font-medium mb-1.5">
              Read Time (min) <span className="text-destructive">*</span>
            </label>
            <input
              id="readTime"
              type="number"
              min={1}
              value={form.readTime}
              onChange={(e) => updateField('readTime', parseInt(e.target.value, 10) || 0)}
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm',
                fieldErrors.readTime ? 'border-destructive' : 'border-border'
              )}
            />
            {fieldErrors.readTime && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.readTime}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1.5">
              Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value as 'draft' | 'published')}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium mb-1.5">
            Author
          </label>
          <input
            id="author"
            type="text"
            value={form.author}
            onChange={(e) => updateField('author', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            placeholder="Curtis Israel"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEditing ? 'Update Article' : 'Create Article'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// About page manager (single Markdown editor)
// ---------------------------------------------------------------------------

function AboutManager() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/about');
      if (!res.ok) throw new Error('Failed to fetch about content');
      const data = await res.json();
      setContent(data.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch about content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/about', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save content');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-6">About Page</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted py-8 text-center">Loading content...</p>
      ) : (
        <div className="border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="about-content" className="text-sm font-medium">
              Content (Markdown)
            </label>
            <span className="text-xs text-muted">
              Supports headings, lists, links, bold, italic, and more
            </span>
          </div>
          <textarea
            id="about-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono resize-y mb-3"
            placeholder="Write your about page content in Markdown..."
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {success && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved successfully
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Files manager
// ---------------------------------------------------------------------------

const FILE_TYPE_COLORS: Record<string, string> = {
  code: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  video: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  pdf: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  image: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  document: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

function FilesManager() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/files');
      if (!res.ok) throw new Error('Failed to fetch files');
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  async function handleUpload(file: File) {
    clearMessages();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (description.trim()) formData.append('description', description.trim());

      const res = await fetch('/api/admin/files', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSuccessMessage(`"${file.name}" uploaded successfully.`);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }

  async function handleDelete(id: string) {
    clearMessages();

    try {
      const res = await fetch(`/api/admin/files/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete file');
      }
      setDeleteConfirm(null);
      setSuccessMessage('File deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
      setDeleteConfirm(null);
    }
  }

  function startEditing(file: FileRecord) {
    setEditingFileId(file.id);
    setEditDescription(file.description || '');
    setDeleteConfirm(null);
    clearMessages();
  }

  function cancelEditing() {
    setEditingFileId(null);
    setEditDescription('');
  }

  async function handleEditSave(id: string) {
    clearMessages();
    setEditSaving(true);

    try {
      const res = await fetch(`/api/admin/files/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editDescription,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update file');
      }

      const updatedFile: FileRecord = await res.json();

      // Update the file in the list without refetching
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? updatedFile : f))
      );

      setEditingFileId(null);
      setEditDescription('');
      setSuccessMessage('File updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file');
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-6">Files</h2>

      {/* Feedback messages */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm" role="status">
          {successMessage}
        </div>
      )}

      {/* Upload area */}
      <div className="mb-8 border border-border rounded-lg p-5">
        <h3 className="text-sm font-medium mb-4">Upload File</h3>

        {/* Drag-and-drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors mb-4',
            dragOver
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-accent/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted">Uploading...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted mb-2">
                Drag and drop a file here, or
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Browse files
              </button>
              <p className="text-xs text-muted mt-2">Max file size: 4.5 MB</p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Select file to upload"
              />
            </>
          )}
        </div>

        {/* Optional metadata */}
        <div>
          <label htmlFor="file-description" className="block text-sm font-medium mb-1.5">
            Description <span className="text-xs text-muted">(optional)</span>
          </label>
          <input
            id="file-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"
            placeholder="Brief description of the file"
            disabled={uploading}
          />
        </div>
      </div>

      {/* File list */}
      {loading ? (
        <p className="text-muted py-8 text-center">Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-muted py-8 text-center">
          No files uploaded yet. Drag files here to upload.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 pr-4 font-medium text-muted">Name</th>
                <th className="py-3 pr-4 font-medium text-muted hidden sm:table-cell">Type</th>
                <th className="py-3 pr-4 font-medium text-muted hidden md:table-cell">Size</th>
                <th className="py-3 pr-4 font-medium text-muted hidden lg:table-cell">Uploaded</th>
                <th className="py-3 font-medium text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-border/50">
                  {editingFileId === file.id ? (
                    /* Inline edit row */
                    <td colSpan={5} className="py-3 pr-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FileIcon type={file.type} size={16} className="shrink-0 text-muted" />
                          <span className="font-medium text-foreground text-sm">{file.name}</span>
                        </div>
                        <div>
                          <label
                            htmlFor={`edit-description-${file.id}`}
                            className="block text-xs font-medium mb-1 text-muted"
                          >
                            Description
                          </label>
                          <input
                            id={`edit-description-${file.id}`}
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
                            placeholder="Brief description of the file"
                            disabled={editSaving}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSave(file.id)}
                            disabled={editSaving}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-accent text-accent-foreground hover:bg-accent-hover transition-colors disabled:opacity-50"
                          >
                            {editSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={editSaving}
                            className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent/5 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    /* Normal display row */
                    <>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FileIcon type={file.type} size={16} className="shrink-0 text-muted" />
                          <div className="min-w-0">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-foreground hover:text-accent transition-colors truncate block"
                              title={file.name}
                            >
                              {file.name}
                            </a>
                            {/* Mobile condensed info */}
                            <span className="block text-xs text-muted sm:hidden mt-0.5">
                              {file.type}
                              {' \u00B7 '}
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-xs font-medium',
                            FILE_TYPE_COLORS[file.type] || FILE_TYPE_COLORS.other
                          )}
                        >
                          {file.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted hidden md:table-cell">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-3 pr-4 text-muted hidden lg:table-cell">
                        {formatDate(file.uploadDate)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEditing(file)}
                            className="px-3 py-1 text-xs font-medium rounded-md border border-border hover:bg-accent/5 transition-colors"
                          >
                            Edit
                          </button>
                          {deleteConfirm === file.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(file.id)}
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
                              onClick={() => setDeleteConfirm(file.id)}
                              className="px-3 py-1 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
