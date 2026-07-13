# Atena School Monorepo

Welcome to the unified **Atena School** monorepo. This repository contains the entire ecosystem of applications, services, and shared libraries that power the school management platform.

## Architecture & Layout

This repository is managed using **pnpm workspaces** for package management and **Turborepo** for build caching and pipeline execution.

```
atena_school/
├── apps/                 # Application projects (isolated runtimes)
│   ├── crm/              # React + Vite + TanStack Start (Admin Dashboard)
│   ├── landing/          # Next.js 15 + Supabase (Public & Landing pages)
│   ├── backend/          # NestJS Fastify + Prisma (Core REST API)
│   └── mobile/           # React Native + Expo (Mobile application)
│
├── packages/             # Shared npm modules (reused across apps)
│   ├── ui/               # Shared Design Components (React)
│   ├── design/           # Design System & Design Tokens
│   ├── api/              # Shared API Client wrappers
│   ├── contracts/        # API Request/Response schema contracts
│   ├── types/            # Shared TypeScript type definitions
│   └── utils/            # Shared helpers and helper modules
│
└── tooling/              # Common compiler & linter configurations
    ├── eslint/           # Reusable ESLint rulesets
    ├── prettier/         # Reusable Prettier rulesets
    └── typescript/       # Shared base tsconfig files
```

---

## 📂 Sub-Project Guides & Documentation

For detailed information, installation, and deployment steps of each individual application, please refer to their respective guides:

*   **[CRM Dashboard README](file:///Users/krimson/PROJECTS/atena_school/apps/crm/README.md)** — Frontend CRM dashboard for administrators and teachers.
*   **[Next.js Landing README](file:///Users/krimson/PROJECTS/atena_school/apps/landing/README.md)** — Public marketing page and customer registration portal.
*   **[NestJS Backend README](file:///Users/krimson/PROJECTS/atena_school/apps/backend/README.md)** — Core business logic, database migrations, and REST endpoints.
*   **[Expo Mobile README](file:///Users/krimson/PROJECTS/atena_school/apps/mobile/README.md)** — Native application for students and staff.

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js** (v20+) and **pnpm** (v11+) installed. If you do not have `pnpm` installed globally, you can run all commands prefixed with `npx pnpm`.

### 2. Workspace Installation

Install dependencies for all workspace projects concurrently:

```bash
npx pnpm install
```

### 3. Local Development

To start the development servers for all projects concurrently:

```bash
npx pnpm dev
```

If you only want to work on a specific application (e.g., just the landing page or backend):

```bash
# Start only the landing page
npx pnpm --filter landing dev

# Start only the backend
npx pnpm --filter backend dev

# Start only the CRM
npx pnpm --filter crm dev
```

### 4. Building the Projects

Build all applications and packages according to the Turborepo pipeline dependency tree:

```bash
npx pnpm build
```
