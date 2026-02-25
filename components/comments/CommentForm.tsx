'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor } from '@/lib/comment-helpers';

interface CommentFormProps {
  articleSlug: string;
  userId: string;
  userName: string;
  userImage: string | null;
  onCommentAdded: () => void;
  parentId?: string;
  replyingToName?: string;
  onCancel?: () => void;
}

const MAX_CHARS = 2000;

export function CommentForm({
  articleSlug,
  userId,
  userName,
  userImage,
  onCommentAdded,
  parentId,
  replyingToName,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isEmpty = content.trim().length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEmpty || isOverLimit || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          ...(parentId && { parentId }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      // Success
      setContent('');
      onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border rounded-lg p-4 md:p-6 mb-6 md:mb-8 bg-card"
    >
      {/* Reply header */}
      {replyingToName && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
          <span className="text-xs text-muted">
            Replying to <span className="font-medium text-foreground">@{replyingToName}</span>
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-muted hover:text-foreground transition-colors"
              aria-label="Cancel reply"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* User info */}
      <div className="flex items-center gap-3 mb-3">
        {userImage ? (
          <Image
            src={userImage}
            alt=""
            width={32}
            height={32}
            className="rounded-full border border-border"
          />
        ) : (
          <div
            className="rounded-full border border-border w-8 h-8 flex items-center justify-center text-white font-medium text-xs"
            style={{ backgroundColor: getAvatarColor(userId) }}
            aria-hidden="true"
          >
            {getInitials(userName)}
          </div>
        )}
        <span className="text-sm font-medium text-foreground">{userName}</span>
      </div>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={replyingToName ? `Reply to ${replyingToName}...` : 'Share your thoughts...'}
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border bg-background text-foreground',
          'placeholder:text-muted',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
          'resize-none',
          parentId ? 'min-h-[60px] max-h-[150px]' : 'min-h-[80px] max-h-[200px]',
        )}
        disabled={isSubmitting}
        aria-label="Comment text"
      />

      {/* Error message */}
      {error && (
        <div
          className="mt-3 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mt-3">
        <span
          className={cn(
            'text-xs',
            isOverLimit ? 'text-destructive' : 'text-muted',
          )}
          aria-live="polite"
        >
          {charCount} / {MAX_CHARS}
        </span>
        <button
          type="submit"
          disabled={isEmpty || isOverLimit || isSubmitting}
          className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
