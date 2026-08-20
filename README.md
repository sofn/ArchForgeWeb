# ArchForgeWeb

English | [中文](README.zh-CN.md)

[![CI](https://github.com/sofn/ArchForgeWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/sofn/ArchForgeWeb/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

C-end (consumer) **Next.js** client for ArchForge. It consumes **`server-web` on port 8081** only — not the admin API on 8080.

Docs: [https://archforge.lesofn.com](https://archforge.lesofn.com)

## Five-repo map

```
archforge/
├── ArchForge/          # backend :8080 / :8081
├── ArchForgeAdmin/     # admin :8848 → :8080
├── ArchForgeWeb/       # this repo :3000 → :8081
├── ArchForgeDocs/
└── ArchForgeSpec/
```

Built with Next.js (App Router) + React + Tailwind CSS v4 + shadcn/ui, managed by pnpm workspaces and Turborepo.

## Features

- User login / register / reset password (Sa-Token)
- Dashboard with greeting and operation metrics
- Notification center and operation logs
- Profile, password change and article list
- Public article list / detail with Markdown, search, pagination, share and RSS
- SEO: sitemap, robots, JSON-LD, Open Graph image
- Write article with category, title, summary, cover image and Markdown content
- Responsive PC / H5 layout with locale-prefixed URLs (`/en`, `/zh`)
- Dark mode, TanStack Query cache, RHF + zod forms

## Tech Stack

- Next.js 16.2.12 (App Router)
- React 19 + TypeScript 5.8
- Tailwind CSS v4 + shadcn/ui
- next-intl (`localePrefix: always`)
- TanStack Query + React Hook Form + zod
- Turborepo + pnpm workspaces
- Vitest + Playwright

## Project Structure

```
apps/web/
├── src/
│   ├── app/[locale]/(marketing|auth|user)/
│   ├── components/{ui,layout,shared,providers,theme}
│   └── lib/{api,http,query,validation,routes.ts}
├── messages/
├── i18n/
├── e2e/
└── middleware.ts
```

Data rules:

- Public content → server component fetch (`revalidate = 60`)
- Personal data → TanStack Query hooks
- Auth state → `AuthProvider` / `useAuth()`
- Public-path list → `src/lib/routes.ts` (single source)

## Quick Start

```bash
cp apps/web/.env.example apps/web/.env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
pnpm install
# in ArchForge: ./gradlew :archforge-server-web:bootRun
pnpm dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

## Scripts

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## Limits

Comments, likes, tags and persisted profile edits need backend APIs that do not exist yet. The profile page can upload an image, but it cannot save avatar/nickname.

## License

MIT
