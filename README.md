# Curtis Israel's Blog

A personal blog by Curtis Israel covering politics, gaming, education, tech, and more.

## Tech Stack

- [Next.js 16](https://nextjs.org) — App Router with React 19
- [TypeScript](https://www.typescriptlang.org) — Type safety
- [Tailwind CSS 4](https://tailwindcss.com) — Utility-first styling
- [shadcn/ui](https://ui.shadcn.com) — Component primitives (button, card)
- [Neon](https://neon.tech) — Serverless Postgres database
- [Vercel](https://vercel.com) — Hosting and deployment

## Features

- **Editorial design** — Mobile-first responsive layout with a warm Mid-Century Modern aesthetic
- **Interactive terminal** — A terminal widget on the home page with custom commands (`whoami`, `ls`, `cat`, `help`, etc.)
- **Article system** — Category filtering, search with dropdown results, individual article pages
- **Live streaming integration** — Twitch/YouTube live status indicator in the header
- **SEO & accessibility** — Open Graph/Twitter Card metadata, skip-to-content link, WCAG AA color contrast, semantic HTML
- **Dark mode** — Automatic based on OS preference via `prefers-color-scheme`

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

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
  articles/             # Articles listing and [slug] pages
  about/                # About page
  globals.css           # Theme variables and global styles
  layout.tsx            # Root layout with metadata and fonts
components/
  terminal/             # Interactive terminal widget
  search/               # Search box and dropdown
  articles/             # Article items, category filter
  header/               # Site header, mobile nav, live indicator
  streaming/            # Live streaming status
  ui/                   # shadcn/ui components (button, card)
contexts/               # React context providers (LiveStatus)
lib/                    # Utilities (cn, services)
```

## Deployment

Deployed automatically on Vercel. Push to `main` to deploy.
