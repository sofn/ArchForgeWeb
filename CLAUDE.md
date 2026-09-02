# CLAUDE.md

Guidance for agents working in **ArchForgeWeb**, the C-end Next.js client.

## Overview

Consumer-facing frontend for ArchForge. Talks only to **server-web** (`http://localhost:8081`). It is not the admin console.

## Scripts

Root `package.json` (pnpm + Turborepo):

| Command | What |
|---------|------|
| `pnpm dev` | Next.js dev server — [http://localhost:3000](http://localhost:3000) |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Vitest unit tests |
| `pnpm lint` | ESLint |

App-level (`apps/web`):

| Command | What |
|---------|------|
| `pnpm start` | Start the production server (`next start`) |
| `pnpm test:e2e` | Playwright |
| `pnpm test:e2e:ui` | Playwright UI |
| `pnpm test:e2e:debug` | Playwright debug |

Requires Node.js >= 22 and pnpm >= 9.

## `apps/web` layout

```
apps/web/
├── src/
│   ├── app/[locale]/{(marketing)|(auth)|(user)}
│   ├── components/{ui,layout,shared,providers,theme,boundaries}
│   ├── i18n/                    # next-intl, localePrefix=always
│   └── lib/{api,http,query,validation,routes.ts}
├── messages/                # en.json, zh.json
├── e2e/
├── middleware.ts
└── next.config.ts
```

Import locale-aware `Link` / `useRouter` from `@/i18n/navigation` (not relative `../` walks). `src/app/rss.xml/route.ts` is the App Router trick for `GET /rss.xml` — Next has no `rss.ts` convention file.

### Component directories

| Directory | Naming | Purpose | Rule of thumb |
|-----------|--------|---------|----------------|
| `ui/` | kebab-case | Atomic, no business meaning | Would work in any project (`button`, `input`) — shadcn/ui convention |
| `shared/` | PascalCase | Composite with business meaning | Tied to ArchForge domain (`ArticleCard`) |
| `layout/` | PascalCase | Page chrome | `Header`, `Footer`, `Nav` |
| `providers/` | PascalCase | React Context providers | State injection only, no UI |
| `theme/` | PascalCase | Theme plumbing | `ThemeProvider`, `ThemeToggle` |
| `boundaries/` | PascalCase | Route-level error/loading UI | Reused by `error.tsx` / `loading.tsx` |

Do not put a new `Button` in `shared/` — that belongs in `ui/`. Do not put `ArticleCard` in `ui/` — that is domain UI.
## Auth cookies

sa-token session (not admin JWT):

- `token` — access token
- `tokenName` — header name (usually `Authorization`)
- `refreshToken` — refresh via `POST /web/refresh-token`

Mirrored in `localStorage` with the same keys. `httpClient` sends `Authorization: Bearer <token>` and refreshes on HTTP 401.

Public routes live in `src/lib/routes.ts` and are served under `/en` and `/zh`.

## ProblemDetail errors

Non-2xx bodies from server-web are RFC 9457:

```json
{
  "type": "about:blank",
  "title": "Unauthorized",
  "status": 401,
  "detail": "…"
}
```

Read `detail` first, then `message`. Do not assume every error is `{code, message, data}`.

Success JSON may still be `{ "code": 0, "message": "ok", "data": … }` — `httpClient` unwraps `data` when `code === 0`.

## `NEXT_PUBLIC_API_BASE_URL`

```env
# apps/web/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

Default in code: `http://localhost:8081`. Never point this at admin `:8080`.

## Contract

Paths are `/web/*`. Source of truth: `../ArchForgeSpec/api/openapi.yaml`.
