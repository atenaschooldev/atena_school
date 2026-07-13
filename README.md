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

## 📘 Developer Handbook (docs/)

This repository includes a comprehensive developer handbook inside the [docs/](file:///Users/krimson/PROJECTS/atena_school/docs) folder. Refer to these files to understand the project's engineering standards, policies, and architecture:

### ⚙️ Core Architecture & Spec
*   **[Engineering Specification](file:///Users/krimson/PROJECTS/atena_school/docs/Engineering-Specification.md)** — The complete product and technical spec.
*   **[System Architecture](file:///Users/krimson/PROJECTS/atena_school/docs/ARCHITECTURE.md)** — The overall technical architecture and design system.
*   **[Monorepo Architecture Guide](file:///Users/krimson/PROJECTS/atena_school/docs/Monorepo.md)** — Guidelines, workspace layouts, and packaging rules.
*   **[Project Directory Structure](file:///Users/krimson/PROJECTS/atena_school/docs/Project-Structure.md)** — Visual mapping of the files and directories.

### 🔐 Security & Database
*   **[Authentication & Authorization Guide](file:///Users/krimson/PROJECTS/atena_school/docs/Auth.md)** — Supabase auth integration details.
*   **[Database Schema & Migrations](file:///Users/krimson/PROJECTS/atena_school/docs/Database-Migrations.md)** — Prisma schemas, database structure, and migration steps.
*   **[Environments Configuration](file:///Users/krimson/PROJECTS/atena_school/docs/Environments.md)** — Handling local env files and secrets securely.

### 🛠️ Developer Workflow
*   **[Workspace Onboarding & Bootstrapping](file:///Users/krimson/PROJECTS/atena_school/docs/Bootstrap-Guide.md)** — Quick start guide for new developers.
*   **[API Contracts](file:///Users/krimson/PROJECTS/atena_school/docs/API-Contracts.md)** — Schema structures for client-server communication.
*   **[Client & Server Routing](file:///Users/krimson/PROJECTS/atena_school/docs/Routing.md)** — Navigation schemas for Next.js and TanStack Start.
*   **[Feature Template](file:///Users/krimson/PROJECTS/atena_school/docs/Feature-Template.md)** — Scaffold structure for implementing new features.
*   **[Error Handling Policies](file:///Users/krimson/PROJECTS/atena_school/docs/Error-Handling.md)** — Rules for wrapping and throwing errors safely.
*   **[Testing Strategy](file:///Users/krimson/PROJECTS/atena_school/docs/Testing.md)** — Writing unit, integration, and E2E tests.

### 📋 Quality, Standards & Operations
*   **[Contribution Guide](file:///Users/krimson/PROJECTS/atena_school/docs/CONTRIBUTING.md)** — Process for proposing changes.
*   **[Code Review Standard](file:///Users/krimson/PROJECTS/atena_school/docs/Code-Review.md)** — Pull request review checklist.
*   **[Anti-Patterns Checklist](file:///Users/krimson/PROJECTS/atena_school/docs/Anti-Patterns.md)** — Coding traps and patterns to avoid.
*   **[Decision Trees](file:///Users/krimson/PROJECTS/atena_school/docs/Decision-Trees.md)** — Reference trees for architectural tradeoffs.
*   **[Naming Conventions](file:///Users/krimson/PROJECTS/atena_school/docs/Naming.md)** — Strict naming rules for classes, methods, and files.
*   **[Performance Guidelines](file:///Users/krimson/PROJECTS/atena_school/docs/Performance.md)** — Render optimizations and database query constraints.
*   **[CI/CD Pipelines](file:///Users/krimson/PROJECTS/atena_school/docs/CI-CD.md)** — Workflow setups for deployment.
*   **[Architecture Decisions Record (ADR)](file:///Users/krimson/PROJECTS/atena_school/docs/Architecture-Decisions.md)** — Log of historical architectural choices.
*   **[AI Agent Rules (AGENTS.md)](file:///Users/krimson/PROJECTS/atena_school/docs/AGENTS.md)** — Constraints and protocols for AI coding assistants.

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
