# Comment Replies Design

## Summary

Add threaded reply support to the comments section and match comments width to the article width.

## Requirements

- Unlimited nesting depth for replies
- Desktop: indented threads with vertical thread lines
- Mobile: flat layout with "Replying to @Username" context labels (scrollable link to parent)
- Inline reply form appears below the comment being replied to
- Only one reply form open at a time
- Comments section matches article width (remove `max-w-prose` constraint)

## Database

Add `parentId` (nullable UUID, self-referencing FK) to `comments` table in `db/schema.ts`.

- `NULL` = top-level comment
- UUID = reply to that comment
- `ON DELETE CASCADE` so deleting a parent removes all descendants
- Index on `parentId` for child lookups
- Migration via drizzle-kit (`db:generate` + `db:migrate`)

## API

**GET /api/articles/[slug]/comments**
- Return `parentId` and `parentUserName` in each comment
- Continue fetching flat (tree built client-side)

**POST /api/articles/[slug]/comments**
- Accept optional `parentId` in body
- Validate parent exists and belongs to same article

## UI Components

**CommentsSection** — remove `max-w-prose mx-auto`, manage active reply state (which comment has reply form open).

**CommentList** — build tree from flat comment array, render recursively.

**CommentItem** — add Reply button (authenticated only), accept `onReply` callback. On desktop (`md:+`), indent children with `pl-6` per level and a left border thread line. On mobile, render flat with "Replying to @Username" label.

**CommentForm** — accept optional `parentId` prop. When replying, show "Replying to @Username" header with cancel button.

## Delete Behavior

Cascading delete: removing a comment removes it and all descendants. UI refreshes full list after deletion.

## Type Changes

Add `parentId: string | null` and `parentUserName: string | null` to the `Comment` type.
