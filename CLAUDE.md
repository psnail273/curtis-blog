# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Curtis Israel's personal blog. Next.js 16 (App Router, React 19), TypeScript, Tailwind CSS 4, shadcn/ui, Drizzle ORM over Neon serverless Postgres, NextAuth v5 (Google OAuth). Hosts articles, comments, an admin dashboard, a file browser, and live-streaming status (Twitch/YouTube).

## Commands

```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build (output: 'standalone')
npm run start        # Serve production build
npm run lint         # ESLint (eslint-config-next + @stylistic)

npm run db:generate  # Generate Drizzle migration from db/schema.ts
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema directly (dev)
npm run db:studio    # Drizzle Studio
```

- DB scripts load env via `dotenv -e .env.local`. Copy `env.example` → `.env.local` first.
- No test framework is configured — there are no test commands.
- Lint style is enforced: **2-space indentation, single quotes** (`@stylistic`). `react-hooks/set-state-in-effect` is intentionally off.
- Path alias: `@/*` → repo root (e.g. `@/lib/db`).

## Architecture

### Authentication — two separate, unrelated systems
- **Public users (commenters):** NextAuth v5 with Google OAuth, JWT session strategy (no session table) — `lib/auth.ts`. On sign-in it upserts the Google profile into the `users` table; the JWT/session callbacks attach our DB user UUID as `session.user.id`. Route handler: `app/api/auth/[...nextauth]/route.ts`.
- **Admin:** a custom HMAC-signed cookie session (`lib/admin-auth.ts`) gated by the `ADMIN_PASSWORD` env var — NOT Google OAuth. `middleware.ts` enforces it on every `/api/admin/*` request (returns 401 if the cookie is missing/invalid), except the login endpoint `/api/admin/auth`. The `/admin` page itself renders login-vs-content client-side.

### Database access — two patterns, same Neon DB
- **Runtime queries** use `getDb()` from `lib/db.ts`: the raw `neon` tagged-template SQL function, lazily initialized so production builds don't fail when `DATABASE_URL` is absent. Most API routes use raw SQL via this helper.
- **Drizzle ORM** (`db/schema.ts`, `db/index.ts`) is used **only by drizzle-kit for migrations** — `db/index.ts` is documented as such. `db/schema.ts` is still the source of truth for table shapes. Tables: `articles`, `files`, `about_page`, `users`, `comments`, `comment_likes`, `past_streams`, `live_status`. Migrations live in `drizzle/`.

### App structure (Next.js App Router)
- `app/(home)`, `app/articles/[slug]`, `app/about`, `app/admin`, `app/files`, `app/streams`, `app/support`, `app/terminal` — page routes.
- `app/api/*` — route handlers. Public: `articles`, `articles/[slug]/comments`, `comments/[id]`, `files`, `streams`, `live-status/[platform]/[username]`, `auth`. Admin (middleware-protected): `app/api/admin/{auth,articles,about,files,upload}`.
- `components/` — feature-grouped UI (`articles`, `comments`, `header`, `terminal`, `streaming`, `ui` = shadcn primitives, etc.).
- `lib/` — shared logic: `db.ts` (runtime SQL), `auth.ts` / `admin-auth.ts` / `auth-helpers.ts`, `*-utils.ts` validators/formatters, `category-colors.ts`, `cloudinary.ts`, and `lib/services/{twitch,youtube,stream-refresh,stream-utils}.ts` for live-status polling.
- `contexts/` — React context (e.g. `LiveStatus`).

### Content & rendering
- Articles are stored in Postgres (`articles.content` is Markdown text), not files. Rendered with `react-markdown` + `remark-gfm` + `rehype-slug` and `react-syntax-highlighter`. `mammoth` converts uploaded DOCX → Markdown. File uploads go to Vercel Blob and/or Cloudinary.

### Security headers
- `next.config.ts` sets CSP and other security headers globally. Note the documented tech-debt: `style-src` allows `unsafe-inline` because category colors and shadcn use inline styles.

## Deployment

Do not assume Vercel despite the README. CI is **Gitea Actions** (`.gitea/workflows/dev.yaml`): on push to `dev` it builds a standalone Docker image, pushes it to the self-hosted registry `git.stuffworks.net`, deletes the previous patch version, and redeploys the `curtis-blog-dev` container on `caddy-network`. Runtime secrets (`DATABASE_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`, Google/Twitch/YouTube/Cloudinary creds) are injected as container env vars. `NEXT_PUBLIC_*` streaming vars (`NEXT_PUBLIC_TWITCH_USERNAME`, `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID`, `NEXT_PUBLIC_YOUTUBE_HANDLE`) are **build-args** — they are baked into the bundle at build time, so changing them requires a rebuild.

## Notes
- Env files are protected: `.claude/settings.json` denies reading/editing `.env*`.
- Design docs and prior plans live under `docs/plans/` and `docs/superpowers/`.
