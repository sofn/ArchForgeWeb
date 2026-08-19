# CLAUDE.md

ArchForgeWeb is the **consumer (C-end)** Next.js app for ArchForge.

## Commands

- `pnpm dev` — turbo dev (apps/web)
- `pnpm build` / `pnpm typecheck` / `pnpm lint`
- Node >= 22, pnpm >= 9

## Layout

```
apps/web/src/
├── app/            # App Router pages
├── components/
├── lib/            # API client
└── messages/       # en.json / zh.json
```

## Integration

- API: `NEXT_PUBLIC_API_BASE_URL` → `http://localhost:8081`
- Auth: sa-token session on the web API (`/web/login`)
- Errors: ProblemDetail (`status`, `detail`, optional `code`)
- Contracts: `../ArchForgeSpec/api/openapi.yaml` and `enums/enums.yaml`
