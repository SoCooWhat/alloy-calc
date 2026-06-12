# 钛镁铝合金算料系统

合金材料计算与订单管理系统 - 基于 Next.js 14 + Supabase + shadcn/ui

## 快速开始

### 1. 安装依赖

```bash
npm install @supabase/supabase-js @supabase/ssr zustand @tanstack/react-table react-to-print
```

### 2. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建项目
2. 复制 `.env.local.example` 为 `.env.local`
3. 填入你的 Supabase URL 和 Anon Key

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `supabase-schema.sql`

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── app/              # Next.js App Router 页面
├── components/       # React 组件
├── lib/              # 工具库和配置
├── stores/           # Zustand 状态管理
└── types/            # TypeScript 类型定义
```

## 功能模块

- ✅ 用户认证（Supabase Auth）
- ✅ 工作台仪表盘
- ✅ 订单管理
- ✅ 快捷模板
- ✅ 型材管理
- ✅ 配件管理
- ✅ 客户管理
- ✅ 系统设置

## 技术栈

- **框架**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **状态管理**: Zustand
- **认证**: Supabase Auth

## 开发阶段

- **Phase 1** ✅ 项目初始化 + Supabase + 登录
- **Phase 2** 🚧 型材 + 配件 + 客户 CRUD
- **Phase 3** 🚧 模板管理
- **Phase 4** 🚧 算料核心引擎
- **Phase 5** 🚧 订单管理
- **Phase 6** 🚧 Dashboard + 打印 + 余料
- **Phase 7** 🚧 系统设置 + 响应式适配
