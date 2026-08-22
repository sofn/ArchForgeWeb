# ArchForgeWeb

[English](README.md) | 中文

[![CI](https://github.com/sofn/ArchForgeWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/sofn/ArchForgeWeb/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ArchForge 的 **C 端 Next.js 客户端**。只消费 **`server-web`（端口 8081）**，不要指向管理端 8080。

文档：[https://archforge.lesofn.com](https://archforge.lesofn.com)

## 五仓地图

```
archforge/
├── ArchForge/          # 后端 :8080 / :8081
├── ArchForgeAdmin/     # 管理端 :8848 → :8080
├── ArchForgeWeb/       # 本仓库 :3000 → :8081
├── ArchForgeDocs/
└── ArchForgeSpec/
```

基于 Next.js（App Router）+ React + Tailwind CSS v4 + shadcn/ui，使用 pnpm workspaces 与 Turborepo。

## 架构

本仓库在五仓体系中的位置，以及类型的来源：

```mermaid
flowchart LR
  U(["C 端访问者"]) --> B["浏览器<br/>SSR/RSC 页面 · TanStack Query"]
  subgraph next["ArchForgeWeb —— 本仓库 :3000"]
    PAGES["App Router 页面<br/>/en /zh 语言前缀"]
    SDK["lib/api —— openapi-fetch<br/>类型来自 schema.d.ts"]
  end
  SA["server-web :8081<br/>REST + SSE · ProblemDetail"]
  SPEC["ArchForgeSpec<br/>openapi.yaml · enums.yaml"]

  B --> PAGES --> SDK -->|"REST"| SA
  SPEC -.|"pnpm gen:api"| SDK
```

公开内容走服务端组件（`revalidate = 60`）；个人数据走 TanStack Query hooks；认证态在 `AuthProvider`。

## 契约先行：生成类型

API 与枚举类型**全部生成，不手写**：

```bash
pnpm gen:api   # schema.d.ts，来自 ../ArchForgeSpec/api/openapi.yaml
```

- `src/types/schema.d.ts` —— 全部请求/响应结构（openapi-typescript）
- `src/types/enums.generated.ts` —— 共享枚举与文案（enums.yaml）
- `lib/api/*` 通过 `openapi-fetch` 调用，路径与载荷受 schema 类型约束
- CI 重新生成两个文件并校验漂移（`sdk-sync`）

## 功能

- 登录 / 注册 / 重置密码（Sa-Token）
- 仪表盘问候语与运营指标
- 通知中心与操作日志
- 个人中心、修改密码、我的文章
- 公开文章列表 / 详情、搜索、分页、分享、RSS
- SEO：sitemap、robots、JSON-LD、OG 图
- 写文章：分类、标题、摘要、封面、Markdown
- 响应式 PC / H5，URL 带语言前缀（`/en`、`/zh`）
- 暗色模式、TanStack Query、RHF + zod

## 数据规范

- 公开内容 → 服务端组件 + `revalidate = 60`
- 个人数据 → TanStack Query hooks
- 认证态 → `AuthProvider` / `useAuth()`
- 公开路径 → `src/lib/routes.ts` 单一事实源

## 快速开始

```bash
cp apps/web/.env.example apps/web/.env.local
pnpm install
# 在 ArchForge 仓库启动 ./gradlew :archforge-server-web:bootRun
pnpm dev
```

打开 [http://localhost:3000/en](http://localhost:3000/en)。

## 限制

评论、点赞、标签、保存昵称/头像需要后端接口，当前契约没有这些能力。资料页可以演示上传，但不能持久化头像。

## 协议

MIT
