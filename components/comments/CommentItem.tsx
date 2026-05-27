'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor, formatRelativeTime } from '@/lib/comment-helpers';
import { LikeButton } from './LikeButton';
import type { Comment } from '@/types/comment';

interface CommentItemProps {
  comment: Comment;
  depth: number;
  currentUserId?: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
  onReply: () => void;
}

export function CommentItem({
  comment,
  depth,
  currentUserId,
  isAdmin,
  isAuthenticated,
  onDelete,
  onToggleLike,
  onReply,
}: CommentItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for delete confirmation modal
  useEffect(() => {
    if (!showDeleteConfirm) return;

    const modal = deleteModalRef.current;
    if (!modal) return;

    // Focus first button in modal
    const firstButton = modal.querySelector<HTMLButtonElement>('button');
    firstButton?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const focusable = modal!.querySelectorAll<HTMLElement>('button:not([disabled])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm]);

  // Restore focus when modal closes
  useEffect(() => {
    if (!showDeleteConfirm) {
      deleteButtonRef.current?.focus();
    }
  }, [showDeleteConfirm]);

  // Render placeholder for soft-deleted comments (must be after all hooks)
  if (comment.deleted) {
    return (
      <article
        className="border border-border rounded-lg p-4 md:p-5 bg-card/50"
        aria-label="Deleted comment"
      >
        <p className="text-sm text-muted italic">This comment has been deleted</p>
      </article>
    );
  }

  const isAuthor = currentUserId === comment.user.id;
  const canDelete = isAuthor || isAdmin;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete comment:', error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Mobile: "Replying to @Username" label */}
      {comment.parentId && comment.parentUserName && (
        <a
          href={`#comment-${comment.parentId}`}
          className="md:hidden flex items-center gap-1 text-xs text-muted mb-1 hover:text-accent transition-colors"
        >
          <span aria-hidden="true">↩</span>
          Replying to @{comment.parentUserName}
        </a>
      )}
      <article
        className={cn(
          'border border-border rounded-lg p-4 md:p-5 bg-card transition-all duration-200',
          isDeleting && 'opacity-50',
        )}
        aria-label={`Comment by ${comment.user.name}`}
      >
        <div className="flex gap-3 md:gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {comment.user.image ? (
              <Image
                src={comment.user.image}
                alt={`${comment.user.name}'s avatar`}
                width={48}
                height={48}
                className="rounded-full border border-border w-10 h-10 md:w-12 md:h-12"
              />
            ) : (
              <div
                className="rounded-full border border-border w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: getAvatarColor(comment.user.id) }}
                aria-hidden="true"
              >
                {getInitials(comment.user.name)}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-medium text-foreground">
                  {comment.user.name}
                </span>
                <time
                  dateTime={comment.createdAt}
                  className="text-xs text-caption"
                >
                  {formatRelativeTime(comment.createdAt)}
                </time>
              </div>

              {/* Like button */}
              <div>
                <LikeButton
                  commentId={comment.id}
                  initialLiked={comment.likedByCurrentUser}
                  initialCount={comment.likeCount}
                  isAuthenticated={!!currentUserId}
                  onToggle={onToggleLike}
                />
              </div>
            </div>

            {/* Comment text */}
            <p className="text-sm md:text-base text-body leading-relaxed whitespace-pre-line">
              {comment.content}
            </p>

            {/* Action buttons */}
            <div className="mt-2 flex items-center gap-1">
              {isAuthenticated && (
                <button
                  onClick={onReply}
                  className="inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-2 py-2 rounded-md text-xs text-muted hover:text-accent hover:bg-accent/5 transition-colors duration-200"
                >
                  <Reply className="size-3.5" aria-hidden="true" />
                  Reply
                </button>
              )}
              {canDelete && (
                <button
                  ref={deleteButtonRef}
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 min-h-[44px] min-w-[44px] px-2 py-2 rounded-md text-xs text-muted hover:text-destructive hover:bg-destructive/5 transition-colors duration-200"
                  aria-label="Delete comment"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !isDeleting) setShowDeleteConfirm(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`delete-modal-title-${comment.id}`}
        >
          <div
            ref={deleteModalRef}
            className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id={`delete-modal-title-${comment.id}`}
              className="text-lg font-semibold text-foreground mb-2"
            >
              Delete Comment?
            </h3>
            <p className="text-sm text-muted mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-destructive text-white rounded-lg text-sm hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
