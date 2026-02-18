'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getInitials, getAvatarColor, formatRelativeTime } from '@/lib/comment-helpers';
import { LikeButton } from './LikeButton';
import type { Comment } from '@/types/comment';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  isAdmin: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
}

export function CommentItem({
  comment,
  currentUserId,
  isAdmin,
  onDelete,
  onToggleLike,
}: CommentItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
                alt=""
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

            {/* Delete button (if authorized) */}
            {canDelete && (
              <div className="mt-2">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-destructive transition-colors duration-200"
                  aria-label="Delete comment"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="delete-modal-title"
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
