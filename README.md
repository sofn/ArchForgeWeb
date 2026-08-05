# ArchForgeWeb

English | [中文](README.zh-CN.md)

A C-end (consumer-facing) demo frontend for the **ArchForge** backend. Built with Next.js 15 + React 19 + Tailwind CSS v4 + shadcn/ui, managed by pnpm workspaces and Turborepo.

## Features

- User login / logout (Sa-Token based)
- Dashboard with greeting and operation metrics
- Notification center and operation logs
- Profile, password change and article list
- Public article list and article detail with Markdown rendering
- Write article with category, title, summary, cover image and Markdown content
- Responsive PC / H5 layout with top navigation on desktop and bottom navigation on mobile
- Internationalization: English by default, switchable to Chinese

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-intl](https://next-intl.dev/) for i18n
- [Turborepo](https://turbo.build/) + [pnpm workspaces](https://pnpm.io/workspaces)

## Project Structure

```
apps/web/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components (Header, BottomNav, ArticleCard, LocaleSwitcher, ...)
│   ├── components/providers/# Context providers (AuthProvider)
│   ├── components/ui/       # shadcn/ui primitives
│   └── lib/                 # API client and utilities
├── messages/
│   ├── en.json              # English translations
│   └── zh.json              # Chinese translations
├── i18n/
│   ├── request.ts           # next-intl request config
│   └── routing.ts           # next-intl routing config
├── middleware.ts            # next-intl middleware
├── next.config.ts
└── package.json
```

## Quick Start

1. Create the environment file:

```bash
cp .env.example .env.local
# or manually create apps/web/.env.local
```

`apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the backend services:

```bash
# ArchForge backend (in the ArchForge repo)
./gradlew :server-admin:bootRun   # port 8080
./gradlew :server-web:bootRun     # port 8081
```

4. Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Default dev credentials are the same as the ArchForge admin user (e.g. `admin / admin123`).

## Available Scripts

```bash
pnpm dev        # Start Next.js dev server
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # TypeScript type checking
pnpm lint       # Next.js lint
```

## Internationalization

- Default locale: **English (`en`)**
- Supported locales: `en`, `zh`
- Translations are stored in `apps/web/messages/`
- The **Language** button in the header switches locale via a `NEXT_LOCALE` cookie and refreshes the page
- `next-intl` is configured with `localePrefix: 'never'`, so URLs stay the same across languages

## License

MIT
