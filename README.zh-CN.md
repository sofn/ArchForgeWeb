# ArchForgeWeb

[English](README.md) | 中文

**ArchForge** 的 C 端（面向消费者）示例前端。基于 Next.js 15 + React 19 + Tailwind CSS v4 + shadcn/ui 构建，使用 pnpm workspaces 与 Turborepo 管理。

## 功能

- 用户登录 / 退出（基于 Sa-Token）
- 仪表盘问候语与运营指标
- 通知中心与操作日志
- 个人中心、修改密码、我的文章
- 公开文章列表与 Markdown 文章详情
- 写文章：选择分类、标题、摘要、封面图、Markdown 正文
- 响应式 PC / H5 布局：PC 顶部导航，H5 底部导航
- 国际化：默认英文，可切换中文

## 技术栈

- [Next.js 15](https://nextjs.org/)（App Router）
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [next-intl](https://next-intl.dev/) 国际化
- [Turborepo](https://turbo.build/) + [pnpm workspaces](https://pnpm.io/workspaces)

## 项目结构

```
apps/web/
├── src/
│   ├── app/                 # Next.js App Router 页面
│   ├── components/          # React 组件（Header、BottomNav、ArticleCard、LocaleSwitcher 等）
│   ├── components/providers/# Context 提供者（AuthProvider）
│   ├── components/ui/       # shadcn/ui 基础组件
│   └── lib/                 # API 客户端与工具函数
├── messages/
│   ├── en.json              # 英文翻译
│   └── zh.json              # 中文翻译
├── i18n/
│   ├── request.ts           # next-intl 请求配置
│   └── routing.ts           # next-intl 路由配置
├── middleware.ts            # next-intl 中间件
├── next.config.ts
└── package.json
```

## 快速开始

1. 创建环境变量文件：

```bash
cp .env.example .env.local
# 或手动创建 apps/web/.env.local
```

`apps/web/.env.local`：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

2. 安装依赖：

```bash
pnpm install
```

3. 启动后端服务：

```bash
# 在 ArchForge 后端仓库
./gradlew :server-admin:bootRun   # 端口 8080
./gradlew :server-web:bootRun     # 端口 8081
```

4. 启动开发服务器：

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

默认开发账号与 ArchForge 后台管理员一致（例如 `admin / admin123`）。

## 可用脚本

```bash
pnpm dev        # 启动开发服务器
pnpm build      # 生产构建
pnpm start      # 启动生产服务器
pnpm typecheck  # TypeScript 类型检查
pnpm lint       # Next.js 代码检查
```

## 国际化

- 默认语言：**英文（`en`）**
- 支持语言：`en`、`zh`
- 翻译文件位于 `apps/web/messages/`
- 顶部导航栏的 **Language** 按钮通过 `NEXT_LOCALE` Cookie 切换语言并刷新页面
- `next-intl` 配置为 `localePrefix: 'never'`，不同语言共享同一 URL

## 协议

MIT
