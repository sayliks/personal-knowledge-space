# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Next.js version warning

This project uses Next.js 16.2.6 — a version with breaking changes from earlier Next.js. Before writing any Next.js code, consult the docs bundled in `node_modules/next/dist/docs/`. Key differences vs training data may include APIs, conventions, and file structure.

## Commands

```bash
npm run dev      # Start development server (default: http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Prisma:
```bash
npx prisma db push       # Push schema to database
npx prisma db migrate dev # Create and apply migrations
npx prisma studio         # Open Prisma Studio GUI
```

## Architecture

Standard Next.js 16 App Router project (`app/` directory) with the following stack:

- **Database**: PostgreSQL on Supabase with Prisma 7 (custom client output at `app/generated/prisma/`)
- **Styling**: Tailwind CSS v4 (uses `@import "tailwindcss"` and `@theme inline` — not the legacy `@tailwind` directives)
- **Linting**: ESLint 9 flat config (`eslint.config.mjs`)
- **Path alias**: `@/*` maps to project root (`./*`)

### Database connections (Supabase)

Two environment variables for different purposes:
- `DATABASE_URL` — pooled connection (PgBouncer, port 6543), used at runtime
- `DIRECT_URL` — direct connection (port 5432), used for migrations

### Prisma generator output

The Prisma client is configured to output to `../app/generated/prisma` (not the default `node_modules/.prisma/client`). It's gitignored at `/app/generated/prisma`. Import from `../../generated/prisma` or use the generated path when working from app files.
