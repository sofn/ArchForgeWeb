# AGENTS.md

## Git Commit Rules

- Do NOT append `Co-Authored-By` lines to commit messages.

## Project Context

This repository is part of the **ArchForge multi-repository project** (five
independent Git repositories, cloned side by side, no submodules). For the
machine-readable project map, read `../ArchForgeSpec/repos.yaml` first.

```
archforge/
├── ArchForge/          # backend (server-admin :8080 + server-web :8081)
├── ArchForgeWeb/       # C-end web client (Next.js)
├── ArchForgeAdmin/     # admin client (this repo, vue-pure-admin) — consumes server-admin :8080
├── ArchForgeDocs/      # documentation site (VitePress)
└── ArchForgeSpec/      # contracts / architecture / AI context
```

- This repo is the **admin client**, based on `vue-pure-admin` 7.0
  (Vue 3.5 + Vite 8 + Element Plus + Pinia + vue-router 5).
- Backend: `../ArchForge` → `server-admin` (port 8080). Do **not** modify backend
  source from this repository.
- Contracts are owned by `../ArchForgeSpec` (`api/openapi.yaml` OpenAPI 3.1).
  If an API does not fit a need, check the contract first and raise the change in
  `ArchForgeSpec` — do not hack around it here.
- Scope of this repository (`can_modify` in `repos.yaml`): admin-ui only.
- Never introduce Git submodules.
