'use client';

import { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import type { Comment } from '@/types/comment';

/** A comment with its nested children. */
export interface CommentNode extends Comment {
  children: CommentNode[];
}

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
  replyingTo: string | null;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  onCommentAdded: () => void;
  articleSlug: string;
  session: { user?: { id?: string; name?: string | null; image?: string | null } } | null;
}

/** Build a tree from a flat comment array using parentId. */
function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  // Create nodes
  for (const comment of comments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  // Link parents to children
  for (const comment of comments) {
    const node = map.get(comment.id)!;
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function CommentList({
  comments,
  currentUserId,
  isAdmin,
  isAuthenticated,
  onDelete,
  onToggleLike,
  replyingTo,
  onReply,
  onCancelReply,
  onCommentAdded,
  articleSlug,
  session,
}: CommentListProps) {
  const tree = useMemo(() => buildCommentTree(comments), [comments]);

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
      {tree.map((node) => (
        <CommentThread
          key={node.id}
          node={node}
          depth={0}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          onDelete={onDelete}
          onToggleLike={onToggleLike}
          replyingTo={replyingTo}
          onReply={onReply}
          onCancelReply={onCancelReply}
          onCommentAdded={onCommentAdded}
          articleSlug={articleSlug}
          session={session}
        />
      ))}
    </div>
  );
}

interface CommentThreadProps {
  node: CommentNode;
  depth: number;
  currentUserId?: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
  replyingTo: string | null;
  onReply: (commentId: string) => void;
  onCancelReply: () => void;
  onCommentAdded: () => void;
  articleSlug: string;
  session: { user?: { id?: string; name?: string | null; image?: string | null } } | null;
}

function CommentThread({
  node,
  depth,
  currentUserId,
  isAdmin,
  isAuthenticated,
  onDelete,
  onToggleLike,
  replyingTo,
  onReply,
  onCancelReply,
  onCommentAdded,
  articleSlug,
  session,
}: CommentThreadProps) {
  const isReplyFormOpen = replyingTo === node.id;

  return (
    <div role="listitem">
      <div id={`comment-${node.id}`}>
        <CommentItem
          comment={node}
          depth={depth}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          onDelete={onDelete}
          onToggleLike={onToggleLike}
          onReply={() => onReply(node.id)}
        />
      </div>

      {/* Inline reply form */}
      {isReplyFormOpen && isAuthenticated && session?.user && (
        <div className="mt-2 md:ml-6">
          <CommentForm
            articleSlug={articleSlug}
            userId={session.user.id || ''}
            userName={session.user.name || 'Anonymous'}
            userImage={session.user.image || null}
            onCommentAdded={onCommentAdded}
            parentId={node.id}
            replyingToName={node.user.name}
            onCancel={onCancelReply}
          />
        </div>
      )}

      {/* Children — indented on desktop, flat on mobile */}
      {node.children.length > 0 && (
        <div className="md:ml-6 md:border-l-2 md:border-border md:pl-4 mt-2 space-y-2 md:space-y-3">
          {node.children.map((child) => (
            <CommentThread
              key={child.id}
              node={child}
              depth={depth + 1}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              onDelete={onDelete}
              onToggleLike={onToggleLike}
              replyingTo={replyingTo}
              onReply={onReply}
              onCancelReply={onCancelReply}
              onCommentAdded={onCommentAdded}
              articleSlug={articleSlug}
              session={session}
            />
          ))}
        </div>
      )}
    </div>
  );
}
