# Admin Comment Moderation via /admin Login

## Problem

The current system uses `ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_EMAIL` environment variables to determine who can delete comments. This requires configuring email-based checks across server and client, Dockerfile, and CI workflows. The user wants to simplify: logging into `/admin` (password-based) should grant comment deletion powers.

## Goals

1. Remove `ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_EMAIL` from the system
2. Grant comment deletion ability to anyone with a valid `/admin` session (password-based auth)
3. Show a shield icon in the header when admin is logged in, linking to `/admin`
4. Implement soft delete for comments that have replies

## Design

### Database: Soft Delete

Add a nullable `deletedAt` timestamp column to the `comments` table.

- **Comment with replies deleted:** Set `deletedAt = NOW()`. Row stays in database. Likes for the comment are hard-deleted.
- **Comment with no replies deleted:** Hard delete the row and its likes (current behavior).
- **Querying:** Soft-deleted comments are returned in queries but rendered as a placeholder. Content and user info are hidden; the response indicates `deleted: true`.

### Server-Side: Admin Status and Delete Authorization

**Admin status endpoint:** Reuse existing `GET /api/admin/auth` — already returns `{ authenticated: boolean }`.

**Comment delete endpoint (`DELETE /api/comments/[id]`):** Replace the current `requireAuth()` + `isAdmin(email)` pattern with conditional logic:
1. Attempt to get the current user via `getCurrentUser()` (non-throwing)
2. Check admin status via `isAdminAuthenticated()` from `lib/admin-auth.ts` (handles cookie extraction automatically)
3. If no OAuth user AND no valid admin session: return 401
4. Authorization:
   - Allow if the OAuth-authenticated user is the comment author, OR
   - Allow if the request has a valid `admin_session` cookie (no OAuth required)

**Soft delete logic in the delete endpoint:**
1. Check if the comment has any replies (child comments with matching `parentId`)
2. If yes: UPDATE the comment, setting `deletedAt = NOW()`, and delete associated likes
3. If no: DELETE the comment row and associated likes (existing behavior)
4. After hard-deleting a comment, check if its parent is soft-deleted and now has zero remaining children — if so, hard-delete the parent too (recursive cleanup of orphaned placeholders)

### Client-Side: `useAdminStatus` Hook

Create a `useAdminStatus()` hook in `lib/hooks/use-admin-status.ts`:
- Calls `GET /api/admin/auth` on mount
- Returns `{ isAdmin: boolean, loading: boolean }`
- Caches result in module-level variable to avoid repeated calls across page navigations

### Comment UI Changes

**CommentsSection:** Uses `useAdminStatus()` instead of comparing session email to `NEXT_PUBLIC_ADMIN_EMAIL`. Passes `isAdmin` down to child components.

**CommentItem:** Delete button shows if:
- `isAdmin` is true (from hook, regardless of OAuth session), OR
- The current OAuth user is the comment author

**Soft-deleted comment rendering:** When a comment has `deleted: true`:
- Render a placeholder: "This comment has been deleted"
- No avatar, username, like button, or reply button
- Child replies render normally beneath the placeholder

### Header: Admin Shield Icon

In `header.tsx`, when `useAdminStatus()` returns `isAdmin: true`:
- Render a shield icon in the top-right area (alongside existing search/hamburger controls on mobile, near search on desktop)
- The icon is an `<a>` linking to `/admin`
- Subtle styling, not overly prominent

When `isAdmin` is false or loading: nothing renders.

### Cleanup

Remove all references to `ADMIN_EMAIL` and `NEXT_PUBLIC_ADMIN_EMAIL` from:
- `lib/auth-helpers.ts` — remove the `isAdmin()` function
- `components/comments/CommentsSection.tsx` — remove email comparison
- `env.example`
- `Dockerfile` — remove both `NEXT_PUBLIC_ADMIN_EMAIL` build arg/env AND `ADMIN_EMAIL` secret mount
- CI workflow files (`.gitea/workflows/`) — remove build-arg, secret, and runtime `-e` references
- `README.md` — remove `ADMIN_EMAIL` reference
- `.env.prod` or any other env files

## Files Affected

| File | Change |
|------|--------|
| Database migration (new) | Add `deletedAt` column to `comments` |
| `lib/hooks/use-admin-status.ts` (new) | `useAdminStatus()` hook |
| `app/api/comments/[id]/route.ts` | Soft delete logic + admin cookie check |
| `app/api/articles/[slug]/comments/route.ts` | Return `deleted` flag for soft-deleted comments |
| `components/comments/CommentsSection.tsx` | Use `useAdminStatus()`, remove email check |
| `components/comments/CommentItem.tsx` | Deleted comment placeholder, admin delete button |
| `components/header/header.tsx` | Shield icon for admin |
| `lib/auth-helpers.ts` | Remove `isAdmin()` function |
| `env.example` | Remove `ADMIN_EMAIL`, `NEXT_PUBLIC_ADMIN_EMAIL` |
| `types/comment.ts` | Add optional `deleted: boolean` field |
| `Dockerfile` | Remove `NEXT_PUBLIC_ADMIN_EMAIL` build arg/env and `ADMIN_EMAIL` secret mount |
| `.gitea/workflows/*.yaml` | Remove admin email build-arg, secret, and runtime `-e` references |
| `README.md` | Remove `ADMIN_EMAIL` reference |

## Non-Goals

- Multiple admin support
- Audit trail for deletions
- Admin role management
- Changing the admin password auth system
