# Curtis Israel's Blog

A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router with React 19
- [TypeScript](https://www.typescriptlang.org) — Type safety
- [Tailwind CSS 4](https://tailwindcss.com) — Utility-first styling
- [shadcn/ui](https://ui.shadcn.com) — Component primitives (button, card)
- [Drizzle ORM](https://orm.drizzle.team) — Type-safe database queries
- [Neon](https://neon.tech) — Serverless Postgres database
- [NextAuth.js](https://next-auth.js.org) — Google OAuth authentication
- [react-markdown](https://github.com/remarkjs/react-markdown) — Markdown rendering with syntax highlighting
- [@vercel/blob](https://vercel.com/docs/storage/vercel-blob) — File storage
- [mammoth](https://github.com/mwilliamson/mammoth.js) — DOCX parsing and conversion
- [Vercel](https://vercel.com) — Hosting and deployment

## Features

- **Editorial design** — Mobile-first responsive layout with a warm Mid-Century Modern aesthetic
- **Interactive terminal** — A terminal widget on the home page with custom commands (`whoami`, `ls`, `cat`, `help`, etc.)
- **Article system** — Category filtering, search with dropdown results, individual article pages with Markdown support
- **Comments system** — Google OAuth login, per-article comments with likes and admin moderation
- **Admin dashboard** — Article CRUD operations, about page editing, file management
- **File browser** — Upload and manage files via Vercel Blob storage
- **Streams page** — Dedicated page for live streaming content
- **Live streaming integration** — Twitch/YouTube live status indicator in the header
- **SEO & accessibility** — Open Graph/Twitter Card metadata, skip-to-content link, WCAG AA color contrast, semantic HTML
- **Dark mode** — Automatic based on OS preference via `prefers-color-scheme`

## Getting Started

```bash
npm install
cp env.example .env.local  # Configure environment variables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment Variables

See `env.example` for all required variables:

- **Database** — `DATABASE_URL` (Neon Postgres connection string)
- **Authentication** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`
- **Admin** — `ADMIN_PASSWORD` (for admin dashboard access)
- **Streaming** — `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `YOUTUBE_API_KEY` (optional, for live status)

Generate `AUTH_SECRET` with: `openssl rand -base64 32`

## Database

- **Neon Serverless Postgres** with Drizzle ORM
- **Schema** defined in `db/schema.ts`
- **Tables**: `articles`, `files`, `about_page`, `users`, `comments`, `comment_likes`
- **Migrations** located in `db/migrations/` (run with Drizzle Kit)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/                    # Next.js App Router pages
  (home)/               # Home page route group
  about/                # About page
  admin/                # Admin dashboard
  api/                  # API routes (articles, auth, comments, files, streams, admin)
  articles/             # Articles listing and [slug] pages
  files/                # File browser page
  streams/              # Streams page
  support/              # Support page
  terminal/             # Terminal page
  globals.css           # Theme variables and global styles
  layout.tsx            # Root layout with metadata and fonts
components/
  articles/             # Article items, category filter
  comments/             # Comment system components
  files/                # File browser components
  footer/               # Site footer
  header/               # Site header, mobile nav, live indicator
  home/                 # Home page components
  providers/            # Auth and context providers
  search/               # Search box and dropdown
  streaming/            # Live streaming status
  streams/              # Streams page components
  terminal/             # Interactive terminal widget
  ui/                   # shadcn/ui components (button, card)
contexts/               # React context providers (LiveStatus)
db/                     # Database schema, migrations, seed data
lib/                    # Utilities (cn), auth helpers, services
scripts/                # Database migration scripts
types/                  # TypeScript type definitions
```

## Deployment

Deployed automatically on Vercel. Push to `main` to deploy.
