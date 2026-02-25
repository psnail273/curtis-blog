'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle } from 'lucide-react';
import { CommentList } from './CommentList';
import { CommentForm } from './CommentForm';
import { SignInPrompt } from './SignInPrompt';
import type { Comment } from '@/types/comment';

interface CommentsSectionProps {
  slug: string;
}

export function CommentsSection({ slug }: CommentsSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const isAuthenticated = status === 'authenticated';
  const currentUserId = session?.user?.id;
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${slug}/comments`);
      if (!response.ok) {
        throw new Error('Failed to load comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDelete = async (commentId: string) => {
    const response = await fetch(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete comment');
    }

    // Refetch all comments since cascading delete may remove descendants
    fetchComments();
  };

  const handleToggleLike = async (commentId: string) => {
    const response = await fetch(`/api/comments/${commentId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to toggle like');
    }

    const { liked, likeCount } = await response.json();

    // Update local state
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likedByCurrentUser: liked, likeCount }
          : comment
      )
    );
  };

  return (
    <section aria-label="Comments">
      {/* Section heading */}
      <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-6 md:mb-8 pb-4 border-b border-border">
        Comments ({comments.length})
      </h2>

      {/* Comment form or sign-in prompt */}
      {isAuthenticated && session.user ? (
        <CommentForm
          articleSlug={slug}
          userId={currentUserId || ''}
          userName={session.user.name || 'Anonymous'}
          userImage={session.user.image || null}
          onCommentAdded={fetchComments}
        />
      ) : (
        <SignInPrompt />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4 md:space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-border rounded-lg p-4 md:p-5 bg-card animate-pulse"
            >
              <div className="flex gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/6" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-6 text-center border border-border rounded-lg bg-card">
          <AlertCircle className="size-6 text-destructive mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-base font-medium text-foreground mb-2">
            Unable to load comments
          </h3>
          <p className="text-sm text-muted mb-4">
            Please check your connection and try again.
          </p>
          <button
            onClick={fetchComments}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Comments list */}
      {!isLoading && !error && (
        <CommentList
          comments={comments}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          onDelete={handleDelete}
          onToggleLike={handleToggleLike}
          replyingTo={replyingTo}
          onReply={handleReply}
          onCancelReply={handleCancelReply}
          onCommentAdded={() => { setReplyingTo(null); fetchComments(); }}
          articleSlug={slug}
          session={session}
        />
      )}
    </section>
  );
}
