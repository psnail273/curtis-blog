'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Article } from '@/types/article';

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  status: 'draft' | 'published';
  author: string;
  coverImage: string;
}

export const CATEGORIES = ['Education', 'Gaming', 'Politics', 'Tech', 'Other'];

export const EMPTY_FORM: ArticleFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Tech',
  readTime: 5,
  status: 'draft',
  author: 'Curtis Israel',
  coverImage: '',
};

interface ArticleFormProps {
  article: Article | null;
  onSave: () => void;
  onCancel: () => void;
}

export function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
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
        coverImage: article.coverImage || '',
      };
    }
    return { ...EMPTY_FORM };
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [uploadingCover, setUploadingCover] = useState(false);
  const [draggingContent, setDraggingContent] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const contentValueRef = useRef(form.content);
  useEffect(() => {
    contentValueRef.current = form.content;
  }, [form.content]);

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Upload failed');
    }

    const data = await res.json();
    return data.url;
  }

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
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

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

  function insertTextAtCursor(textarea: HTMLTextAreaElement, text: string) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const newValue = before + text + after;
    contentValueRef.current = newValue;
    updateField('content', newValue);
    // Restore cursor position after the inserted text
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    });
  }

  async function handleContentImageUpload(file: File) {
    const textarea = contentRef.current;
    if (!textarea) return;

    // Insert placeholder at cursor
    const placeholder = `![Uploading ${file.name}...](uploading)`;
    insertTextAtCursor(textarea, placeholder);

    try {
      const url = await uploadFile(file);
      if (url) {
        // Read from ref — always has the latest content including placeholder
        const current = contentValueRef.current;
        const markdown = `![${file.name}](${url})`;
        const updated = current.replace(placeholder, markdown);
        contentValueRef.current = updated;
        updateField('content', updated);
      }
    } catch (err) {
      // Read from ref for error case too
      const current = contentValueRef.current;
      const updated = current.replace(placeholder, '');
      contentValueRef.current = updated;
      updateField('content', updated);
      setError(err instanceof Error ? err.message : 'Image upload failed');
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

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Cover Image
          </label>
          {form.coverImage ? (
            <div className="relative rounded-lg border border-border overflow-hidden">
              <img
                src={form.coverImage}
                alt="Cover preview"
                className="w-full max-h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => updateField('coverImage', '')}
                className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-md bg-background/80 border border-border hover:bg-background transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <label
              className={cn(
                'flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
                uploadingCover
                  ? 'border-accent/50 bg-accent/5'
                  : 'border-border hover:border-accent/30 hover:bg-accent/5'
              )}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files[0];
                if (!file || !file.type.startsWith('image/')) return;
                try {
                  setUploadingCover(true);
                  const url = await uploadFile(file);
                  if (url) updateField('coverImage', url);
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Upload failed');
                } finally {
                  setUploadingCover(false);
                }
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploadingCover(true);
                    const url = await uploadFile(file);
                    if (url) updateField('coverImage', url);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Upload failed');
                  } finally {
                    setUploadingCover(false);
                  }
                }}
              />
              <span className="text-sm text-muted">
                {uploadingCover ? 'Uploading...' : 'Drop an image or click to browse'}
              </span>
            </label>
          )}
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1.5">
            Content (Markdown) <span className="text-destructive">*</span>
          </label>
          <textarea
            id="content"
            ref={contentRef}
            value={form.content}
            onChange={(e) => updateField('content', e.target.value)}
            rows={10}
            className={cn(
              'w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm font-mono resize-y min-h-[240px] md:min-h-[400px]',
              fieldErrors.content ? 'border-destructive' :
                draggingContent ? 'border-accent' : 'border-border'
            )}
            placeholder="Article content in Markdown, drag photos to automatically upload them inline"
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingContent(true);
            }}
            onDragLeave={() => setDraggingContent(false)}
            onDrop={async (e) => {
              setDraggingContent(false);
              const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
              if (file) {
                e.preventDefault();
                handleContentImageUpload(file);
              }
            }}
            onPaste={async (e) => {
              const items = Array.from(e.clipboardData.items);
              const imageItem = items.find(item => item.type.startsWith('image/'));
              if (imageItem) {
                e.preventDefault();
                const file = imageItem.getAsFile();
                if (file) handleContentImageUpload(file);
              }
            }}
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
