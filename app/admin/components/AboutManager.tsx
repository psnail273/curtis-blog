'use client';

import { useState, useEffect, useCallback } from 'react';

export function AboutManager() {
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
            rows={10}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-mono resize-y min-h-[240px] md:min-h-[400px] mb-3"
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
