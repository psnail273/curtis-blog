'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  commentId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
  onToggle: (commentId: string) => Promise<void>;
}

export function LikeButton({
  commentId,
  initialLiked,
  initialCount,
  isAuthenticated,
  onToggle,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      // Could show a toast here
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousLiked = liked;
    const previousCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setIsLoading(true);

    try {
      await onToggle(commentId);
    } catch (error) {
      // Revert on error
      setLiked(previousLiked);
      setCount(previousCount);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAuthenticated || isLoading}
      className={cn(
        'inline-flex items-center gap-1.5 transition-all duration-200',
        !isAuthenticated && 'cursor-not-allowed opacity-50',
        isAuthenticated && !isLoading && 'hover:scale-105',
      )}
      aria-label={liked ? 'Unlike this comment' : 'Like this comment'}
      aria-pressed={liked}
      title={!isAuthenticated ? 'Sign in to like comments' : undefined}
    >
      <Heart
        className={cn(
          'size-4 transition-colors duration-200',
          liked ? 'fill-accent stroke-accent' : 'stroke-muted',
          isAuthenticated && !isLoading && 'group-hover:stroke-accent',
        )}
        aria-hidden="true"
      />
      <span className="text-xs md:text-sm text-muted">
        {count}
      </span>
    </button>
  );
}
