# AGENTS.md

## Git Commit Rules

- Do NOT append `Co-Authored-By` lines to commit messages.

## Directory Structure

```
apps/web/
├── middleware.ts            # locale prefix + auth guard (unauthenticated → /{locale}/login)
├── src/app/
│   ├── [locale]/            # ALL user-facing routes (locale-prefixed /en, /zh)
│   │   ├── (marketing)/     # public pages — server components, ISR (revalidate)
│   │   ├── (auth)/          # login / register / password reset (client forms)
│   │   └── (user)/          # authenticated pages — server data via @/lib/api/server
│   ├── api/og/              # dynamic OG image renderer
│   ├── rss.xml/ sitemap.ts robots.ts   # SEO surfaces (server)
│   └── not-found.tsx        # root 404 — OUTSIDE [locale], may use next/link
├── src/components/          # ui/ shared/ layout/ providers/ theme/ boundaries/
├── src/i18n/                # navigation / routing / request (colocated; import Link etc. from @/i18n/navigation)
├── src/lib/
│   ├── http/                # client.ts (browser) · server.ts (RSC) · shared.ts (pure) · cookies.ts
│   ├── api/                 # endpoint wrappers · server.ts = RSC data layer (two access modes)
│   ├── query/               # react-query hooks for CLIENT pages only
│   └── site.ts              # canonical site origin (NEXT_PUBLIC_SITE_URL)
├── src/types/               # GENERATED schema.d.ts + enums.generated.ts — regenerate, never hand-edit
└── messages/                # en.json / zh.json i18n catalogs
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| `ui/` components | kebab-case, domain-free atoms | `button.tsx` → `Button` |
| `shared/ layout/ providers/ theme/ boundaries/` | PascalCase, domain-aware | `ArticleCard.tsx`, `RouteError.tsx` |
| lib modules | lowercase directories, camelCase files | `http/shared.ts` |
| App Router files | Next specials only | `page.tsx` `layout.tsx` `error.tsx` `loading.tsx` `route.ts` |
| Tests | colocated `*.test.ts` (vitest, node env) | `lib/http/server.test.ts` |
| i18n keys | namespace per page/feature | `home.*`, `articles.myArticles.*` |
| Env vars | `NEXT_PUBLIC_*` | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL` |

Server/client split is load-bearing:
- Browser-only code (localStorage, `document`) must never be imported by server components — use `@/lib/http/server` + `@/lib/api/server` in RSC (credentials come from request cookies; absolute URLs via `API_BASE`).
- Data fetching hooks in `src/lib/query/` are for `"use client"` pages; server pages use `lib/api/server.ts` functions directly.
- i18n: `next/link` / `next/navigation` router imports are restricted by ESLint — always `@/i18n/navigation`.

## Quality Gates

- `pnpm lint` — `--max-warnings=0` (eslint-config-next + repo rules: `react-hooks/set-state-in-effect`, `no-console`, locale-aware navigation restrictions; `src/types/**` is ignored as generated).
- `pnpm typecheck` / `pnpm test` / `pnpm build` — must pass before push (husky pre-commit runs lint+typecheck+test via turbo, cached).
- Commit messages — conventional commits enforced by commitlint (root `commitlint.config.mjs`, same type vocabulary as ArchForgeAdmin). CI lints every PR commit range.

## Security Architecture (auth cookies, CSP, proxy)

- **Credentials are HttpOnly-only.** The backend returns tokens in login bodies; the BFF routes (`/api/auth/login|register|logout`) exchange them for `HttpOnly; Secure; SameSite=Lax` cookies (see `lib/http/auth-cookies.ts`). NEVER write auth tokens to localStorage or JS-readable cookies — `hasSession` is the only readable signal.
- **Browser API calls go through `/api/proxy/[...path]`** (same-origin BFF): it injects the `Authorization` header from the cookies, performs single-flight token refresh, rate-limits per IP, and blocks direct proxying of auth endpoints. The browser client (`lib/http/client.ts`) therefore has no token storage — keep it that way.
- **CSP is nonce-based** (middleware): no `unsafe-inline`/`unsafe-eval` for scripts in production; `connect-src 'self'` is enforceable because of the proxy. The nonce flows: middleware → `x-nonce` request header → `[locale]/layout.tsx` → `ThemeProvider nonce`. Any new inline script must receive the nonce or it will be blocked.
- **Session validity** is checked by the `(user)` route-group layout (one profile round-trip); middleware only checks token existence (cheap). Dead sessions bounce via `/api/auth/logout?redirect=...` (open-redirect guarded — relative paths only).
- **AI training bots** are blocked at the middleware (403) using the shared list in `lib/bots.ts` (also feeding robots.ts); AI search/referral bots stay allowed.
- Rate limiting is in-memory (`lib/http/rate-limit.ts`) — per instance; swap for Redis when running multiple replicas.

## Project Context

This repository is the **C-end web client** in the ArchForge multi-repository project (five independent Git repositories, cloned side by side, no submodules). For the machine-readable project map, read `../ArchForgeSpec/repos.yaml` first.

```
archforge/
├── ArchForge/          # backend (server-admin :8080 + server-web :8081)
├── ArchForgeWeb/       # C-end web client (this repo, Next.js) — consumes server-web :8081
├── ArchForgeAdmin/     # admin client (vue-pure-admin) — consumes server-admin :8080
├── ArchForgeDocs/      # documentation site (VitePress)
└── ArchForgeSpec/      # contracts / architecture / AI context
```

- This repo is the **C-end (consumer) client**, Next.js App Router + React + Tailwind + shadcn/ui, pnpm workspaces + Turborepo. URLs are locale-prefixed (`/en`, `/zh`).
- next-intl lives in `apps/web/src/i18n/`. Always import `Link` / `useRouter` / `usePathname` from `@/i18n/navigation`.
- Component folders: `ui/` kebab-case atoms (no domain meaning); `shared/` / `layout/` / `providers/` / `theme/` / `boundaries/` PascalCase. Full table in `CLAUDE.md`.
- Backend: `../ArchForge` → `server-web` (port **8081**). Do **not** call `server-admin` :8080 from here.
- Contracts are owned by `../ArchForgeSpec` (`api/openapi.yaml` OpenAPI 3.1). If an API does not fit, raise the change in Spec — do not hack around it here.
- Errors from server-web are RFC 9457 **ProblemDetail** (`detail`). Success bodies may still wrap `{code, message, data}`.
- Auth: sa-token. Cookies `token`, `tokenName`, `refreshToken`. Header `Authorization: Bearer <token>`.
- API base: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8081`).
- Scope of this repository (`can_modify` in `repos.yaml`): web-ui only.
- Never introduce Git submodules.

See `CLAUDE.md` for scripts, layout, and local setup.
