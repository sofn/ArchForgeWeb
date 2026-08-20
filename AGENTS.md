# AGENTS.md

## Git Commit Rules

- Do NOT append `Co-Authored-By` lines to commit messages.

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
- Backend: `../ArchForge` → `server-web` (port **8081**). Do **not** call `server-admin` :8080 from here.
- Contracts are owned by `../ArchForgeSpec` (`api/openapi.yaml` OpenAPI 3.1). If an API does not fit, raise the change in Spec — do not hack around it here.
- Errors from server-web are RFC 9457 **ProblemDetail** (`detail`). Success bodies may still wrap `{code, message, data}`.
- Auth: sa-token. Cookies `token`, `tokenName`, `refreshToken`. Header `Authorization: Bearer <token>`.
- API base: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8081`).
- Scope of this repository (`can_modify` in `repos.yaml`): web-ui only.
- Never introduce Git submodules.

See `CLAUDE.md` for scripts, layout, and local setup.
