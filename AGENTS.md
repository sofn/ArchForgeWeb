# AGENTS.md

## Git Commit Rules

- Do NOT append `Co-Authored-By` lines to commit messages.

## Project Context

This repository is the **C-end web client** of the ArchForge multi-repo project.
Read `../ArchForgeSpec/repos.yaml` first.

```
archforge/
├── ArchForge/          # backend: server-admin :8080 + server-web :8081
├── ArchForgeWeb/       # this repo (Next.js) — consumes server-web :8081
├── ArchForgeAdmin/     # Vue admin — consumes server-admin :8080
├── ArchForgeDocs/      # VitePress
└── ArchForgeSpec/      # contracts / enums / architecture
```

- Backend: `../ArchForge` → `archforge-server-web` (port 8081).
- Auth: sa-token (not Spring Security JWT filters).
- Errors: RFC 9457 ProblemDetail.
- Scope (`can_modify`): web-ui only.
- Never introduce Git submodules.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm typecheck` / `pnpm lint`
- Requires Node.js >= 22, pnpm >= 9
