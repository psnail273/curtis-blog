'use client';

import { MessageCircle } from 'lucide-react';
import { CommentItem } from './CommentItem';
import type { Comment } from '@/types/comment';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  isAdmin: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
}

export function CommentList({
  comments,
  currentUserId,
  isAdmin,
  onDelete,
  onToggleLike,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 md:py-12 text-center">
        <MessageCircle className="size-8 text-muted mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-muted">Be the first to share your thoughts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6" role="list">
      {comments.map((comment) => (
        <div key={comment.id} role="listitem">
          <CommentItem
            comment={comment}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onDelete={onDelete}
            onToggleLike={onToggleLike}
          />
        </div>
      ))}
    </div>
  );
}
