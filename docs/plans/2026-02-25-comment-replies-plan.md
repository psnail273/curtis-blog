# Comment Replies Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add threaded reply support to the comments section and match comments width to the article width.

**Architecture:** Adjacency list pattern — add nullable `parent_id` column to `comments` table. API returns flat list with `parentId`/`parentUserName`; tree is built client-side. Desktop uses indented threads with vertical lines; mobile uses flat layout with "Replying to @Username" labels.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, Neon Postgres, Drizzle (schema only), raw SQL queries.

**Note:** No test framework is configured. Each task includes a manual verification step instead.

---

### Task 1: Update database schema and run migration

**Files:**
- Modify: `db/schema.ts:62-72`

**Step 1: Add `parentId` column to comments table**

In `db/schema.ts`, update the `comments` table definition to add a self-referencing `parentId` column and an index on it:

```typescript
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_comments_article_id').on(table.articleId, table.createdAt.asc()),
  index('idx_comments_user_id').on(table.userId),
  index('idx_comments_parent_id').on(table.parentId),
])
```

Note: We use a plain `uuid('parent_id')` without `.references()` because drizzle-orm's self-referencing FK syntax can be tricky. We'll add the FK constraint in the generated migration SQL manually if drizzle doesn't produce it.

**Step 2: Generate migration**

Run: `npm run db:generate`

**Step 3: Review and fix the generated migration**

Read the generated SQL file in `drizzle/`. It should contain an `ALTER TABLE` adding the `parent_id` column. If it does NOT include a foreign key constraint with `ON DELETE CASCADE`, manually edit the generated SQL to add:

```sql
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE;
```

**Step 4: Apply migration**

Run: `npm run db:migrate`

**Step 5: Verify**

Run: `npm run db:push` (should report no changes needed, confirming schema is in sync)

**Step 6: Commit**

```bash
git add db/schema.ts drizzle/
git commit -m "feat: add parent_id column to comments table for reply threading"
```

---

### Task 2: Update TypeScript types and row mappers

**Files:**
- Modify: `types/comment.ts`
- Modify: `lib/comment-utils.ts`

**Step 1: Add reply fields to Comment type**

In `types/comment.ts`, add two fields to the `Comment` interface after `articleId`:

```typescript
export interface Comment {
  id: string;
  articleId: string;
  parentId: string | null;
  parentUserName: string | null;
  user: CommentUser;
  content: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}
```

**Step 2: Update database row types and mapper**

In `lib/comment-utils.ts`, add `parent_id` to `CommentRow`:

```typescript
export interface CommentRow {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}
```

Add `parent_id` and `parent_user_name` to `CommentWithUserRow`:

```typescript
export interface CommentWithUserRow {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  parent_user_name: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_image: string | null;
  like_count: number;
  liked_by_current_user?: boolean;
}
```

Update `toComment()` to map the new fields:

```typescript
export function toComment(row: CommentWithUserRow): Comment {
  return {
    id: row.id,
    articleId: row.article_id,
    parentId: row.parent_id,
    parentUserName: row.parent_user_name,
    user: {
      id: row.user_id,
      name: row.user_name,
      image: row.user_image,
    },
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    likeCount: row.like_count,
    likedByCurrentUser: row.liked_by_current_user ?? false,
  };
}
```

**Step 3: Verify**

Run: `npx tsc --noEmit` — should pass (or have only pre-existing errors, not new ones from these changes).

**Step 4: Commit**

```bash
git add types/comment.ts lib/comment-utils.ts
git commit -m "feat: add parentId and parentUserName to comment types"
```

---

### Task 3: Update GET API to return parent info

**Files:**
- Modify: `app/api/articles/[slug]/comments/route.ts` (GET handler)

**Step 1: Update the SQL query**

In the GET handler, update the SQL to join the parent comment's user name and select `parent_id`. Replace the existing query (lines 38-60) with:

```typescript
    const rows = await sql`
      SELECT
        c.id,
        c.article_id,
        c.parent_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.image AS user_image,
        pu.name AS parent_user_name,
        COUNT(DISTINCT cl.id) AS like_count,
        ${currentUser?.id || null}::uuid IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM comment_likes
            WHERE comment_id = c.id AND user_id = ${currentUser?.id || null}::uuid
          ) AS liked_by_current_user
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      LEFT JOIN comments pc ON c.parent_id = pc.id
      LEFT JOIN users pu ON pc.user_id = pu.id
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      WHERE c.article_id = ${articleId}
      GROUP BY c.id, u.id, pu.name
      ORDER BY c.created_at ASC
    `;
```

**Step 2: Update the response mapping**

Update the mapping (lines 62-75) to include the new fields:

```typescript
    const comments: Comment[] = (rows as CommentWithUserRow[]).map((row) => ({
      id: row.id,
      articleId: row.article_id,
      parentId: row.parent_id ?? null,
      parentUserName: row.parent_user_name ?? null,
      user: {
        id: row.user_id,
        name: row.user_name,
        image: row.user_image,
      },
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      likeCount: Number(row.like_count),
      likedByCurrentUser: Boolean(row.liked_by_current_user),
    }));
```

**Step 3: Verify**

Run: `npm run build` — should compile without errors.

Test manually: `curl http://localhost:3000/api/articles/<any-slug>/comments | jq` — each comment should now have `parentId: null` and `parentUserName: null` (since no replies exist yet).

**Step 4: Commit**

```bash
git add app/api/articles/\\[slug\\]/comments/route.ts
git commit -m "feat: return parentId and parentUserName in comments GET API"
```

---

### Task 4: Update POST API to accept parentId

**Files:**
- Modify: `app/api/articles/[slug]/comments/route.ts` (POST handler)

**Step 1: Parse and validate parentId from request body**

After the content validation (after line 132), add parent comment validation:

```typescript
    // Validate parentId if provided
    const parentId = body.parentId || null;

    if (parentId) {
      const parentRows = await sql`
        SELECT id FROM comments WHERE id = ${parentId} AND article_id = ${articleId}
      `;

      if (parentRows.length === 0) {
        return NextResponse.json(
          { error: 'Parent comment not found or belongs to a different article' },
          { status: 400 }
        );
      }
    }
```

**Step 2: Include parent_id in the INSERT**

Update the INSERT statement (around line 138) to include `parent_id`:

```typescript
    const commentRows = await sql`
      INSERT INTO comments (article_id, user_id, content, parent_id)
      VALUES (${articleId}, ${user.id}, ${sanitizedContent}, ${parentId})
      RETURNING id, article_id, user_id, parent_id, content, created_at, updated_at
    `;
```

**Step 3: Include parentId in the response**

Update the response Comment object (around line 158) to include the new fields:

```typescript
    const comment: Comment = {
      id: newComment.id,
      articleId: newComment.article_id,
      parentId: newComment.parent_id ?? null,
      parentUserName: null, // Not needed for the just-created comment response
      user: {
        id: userRows[0].id,
        name: userRows[0].name,
        image: userRows[0].image,
      },
      content: newComment.content,
      createdAt: newComment.created_at,
      updatedAt: newComment.updated_at,
      likeCount: 0,
      likedByCurrentUser: false,
    };
```

**Step 4: Verify**

Run: `npm run build` — should compile without errors.

**Step 5: Commit**

```bash
git add app/api/articles/\\[slug\\]/comments/route.ts
git commit -m "feat: accept parentId in comment creation API"
```

---

### Task 5: Update CommentsSection — remove width constraint, manage reply state

**Files:**
- Modify: `components/comments/CommentsSection.tsx`

**Step 1: Remove `max-w-prose mx-auto` from the section element**

Change line 84 from:
```tsx
<section aria-label="Comments" className="max-w-prose mx-auto">
```
to:
```tsx
<section aria-label="Comments">
```

**Step 2: Add reply state management**

Add state for tracking which comment has an active reply form. After the existing state declarations (around line 19):

```typescript
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
```

Add a reply handler:

```typescript
  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };
```

**Step 3: Update handleDelete to refetch all comments**

Replace the local filter in `handleDelete` (line 58) with a full refetch, since cascading deletes may remove multiple comments:

```typescript
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
```

**Step 4: Pass new props to CommentList**

Update the `CommentList` usage to pass reply-related props and authentication info:

```tsx
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
```

**Step 5: Verify**

Run: `npx tsc --noEmit` — will have type errors until CommentList is updated (Task 6). That's expected.

**Step 6: Commit**

```bash
git add components/comments/CommentsSection.tsx
git commit -m "feat: remove width constraint and add reply state to CommentsSection"
```

---

### Task 6: Update CommentList — build tree and render recursively

**Files:**
- Modify: `components/comments/CommentList.tsx`

**Step 1: Replace the entire CommentList component**

Replace the contents of `components/comments/CommentList.tsx` with:

```tsx
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
```

**Step 2: Verify**

Run: `npx tsc --noEmit` — will have type errors until CommentItem and CommentForm are updated (Tasks 7-8). That's expected.

**Step 3: Commit**

```bash
git add components/comments/CommentList.tsx
git commit -m "feat: add tree building and recursive thread rendering to CommentList"
```

---

### Task 7: Update CommentItem — add Reply button and mobile "Replying to" label

**Files:**
- Modify: `components/comments/CommentItem.tsx`

**Step 1: Update the component props**

Add new props to the interface and component:

```typescript
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
```

Update the destructuring to include `depth`, `isAuthenticated`, and `onReply`.

**Step 2: Add Reply button and mobile "Replying to" label**

Import `Reply` icon from lucide-react (add to existing import).

Add the mobile "Replying to" label ABOVE the comment article element (only shown when `comment.parentId` is set and on mobile):

```tsx
      {/* Mobile: "Replying to @Username" label (hidden on desktop where indentation shows hierarchy) */}
      {comment.parentId && comment.parentUserName && (
        <a
          href={`#comment-${comment.parentId}`}
          className="md:hidden flex items-center gap-1 text-xs text-muted mb-1 hover:text-accent transition-colors"
        >
          <span aria-hidden="true">↩</span>
          Replying to @{comment.parentUserName}
        </a>
      )}
```

Add a Reply button next to the Delete button (inside the comment content area, after the delete button block). Only show for authenticated users:

```tsx
            {/* Action buttons */}
            <div className="mt-2 flex items-center gap-3">
              {isAuthenticated && (
                <button
                  onClick={onReply}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors duration-200"
                >
                  <Reply className="size-3.5" aria-hidden="true" />
                  Reply
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-destructive transition-colors duration-200"
                  aria-label="Delete comment"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Delete
                </button>
              )}
            </div>
```

This replaces the existing standalone delete button block (the `{canDelete && (...)}` section around lines 108-119).

**Step 3: Verify**

Run: `npx tsc --noEmit` — may still have errors until CommentForm is updated (Task 8).

**Step 4: Commit**

```bash
git add components/comments/CommentItem.tsx
git commit -m "feat: add Reply button and mobile reply-to label to CommentItem"
```

---

### Task 8: Update CommentForm — accept parentId and show "Replying to" header

**Files:**
- Modify: `components/comments/CommentForm.tsx`

**Step 1: Add new props**

Update the interface to accept optional reply props:

```typescript
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
```

Update the destructuring to include `parentId`, `replyingToName`, `onCancel`.

**Step 2: Send parentId in the POST body**

Update the `fetch` body (around line 44) to include `parentId`:

```typescript
        body: JSON.stringify({
          content: content.trim(),
          ...(parentId && { parentId }),
        }),
```

**Step 3: Add "Replying to" header when in reply mode**

Import `X` from lucide-react. Before the user info section (the `<div className="flex items-center gap-3 mb-3">` block), add a "Replying to" header that shows when `replyingToName` is set:

```tsx
      {/* Reply header (when replying to a specific comment) */}
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
```

**Step 4: Make the textarea smaller when in reply mode**

Update the textarea `className` to use a smaller min-height when replying:

```tsx
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border bg-background text-foreground',
          'placeholder:text-muted',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
          'resize-none',
          parentId ? 'min-h-[60px] max-h-[150px]' : 'min-h-[80px] max-h-[200px]',
        )}
```

**Step 5: Update placeholder text when replying**

```tsx
        placeholder={replyingToName ? `Reply to ${replyingToName}...` : 'Share your thoughts...'}
```

**Step 6: Update submit button text**

```tsx
          {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
```

**Step 7: Verify**

Run: `npx tsc --noEmit` — should now pass (all type changes are complete).

**Step 8: Commit**

```bash
git add components/comments/CommentForm.tsx
git commit -m "feat: add reply mode to CommentForm with parentId and cancel support"
```

---

### Task 9: Build verification and final commit

**Step 1: Run full build**

Run: `npm run build`

Expected: Build succeeds with no errors.

**Step 2: Run linter**

Run: `npm run lint`

Expected: No new lint errors.

**Step 3: Manual smoke test**

Start dev server: `npm run dev`

Verify:
1. Comments section is now the same width as the article (no `max-w-prose` constraint)
2. Existing comments render normally
3. "Reply" button appears on comments when signed in
4. Clicking Reply shows inline reply form with "Replying to @Username" header
5. Clicking X on reply form cancels it
6. Only one reply form can be open at a time
7. Submitting a reply creates the comment as a child
8. On desktop: replies are indented with a left border line
9. On mobile (resize browser): replies are flat with "Replying to @Username" label that links to parent
10. Deleting a parent comment removes all its replies

**Step 4: Commit any remaining fixes**

If any fixes were needed during verification, commit them:

```bash
git add -u
git commit -m "fix: address issues found during comment replies smoke test"
```
