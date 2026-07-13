# Bootstrap-Guide.md

> Project Bootstrap Guide
>
> Step-by-step guide to create a new project using this architecture.

Version: 1.0

---

# Goal

Create a production-ready monorepo with:

- Next.js (Landing)
- React + Vite (CRM)
- Expo (Mobile)

Sharing:

- Design System
- Types
- Contracts
- Business Logic
- Utilities

---

# Step 1 — Create Repository

Create a new Git repository.

Main branch:

```
main
```

Initialize:

- Git
- pnpm
- Turborepo

---

# Step 2 — Create Workspace

Recommended structure:

```
apps/
packages/
tooling/
docs/
```

Do not create additional top-level folders.

---

# Step 3 — Create Applications

Create:

```
apps/

landing/
crm/
mobile/
```

Each application must compile independently.

---

# Step 4 — Create Shared Packages

Create only the required packages.

Recommended:

```
packages/

ui/
design/
contracts/
types/
utils/
config/
```

Do not add business packages.

---

# Step 5 — Configure TypeScript

Use one shared base configuration.

Applications extend it.

Packages extend it.

Avoid duplicated configuration.

---

# Step 6 — Configure Linting

One ESLint configuration.

One formatting configuration.

Rules must be identical across all applications.

---

# Step 7 — Configure Design System

Create design tokens first.

Examples:

- colors
- spacing
- typography
- radius
- shadows
- motion

Never hardcode repeated values.

---

# Step 8 — Configure Routing

Landing

- Next.js App Router

CRM

- React Router

Mobile

- Expo Router

Keep business routes aligned.

---

# Step 9 — Configure Data Layer

Architecture:

```
UI
↓
TanStack Query
↓
Repository
↓
DataSource
↓
Backend
```

Never skip a layer.

---

# Step 10 — Configure State

Server State

- TanStack Query

Shared Client State

- Zustand

Component State

- useState

Forms

- React Hook Form

Validation

- Zod

---

# Step 11 — Configure Backend

Initial backend:

Supabase

Future backend:

NestJS

Only DataSource implementations should change.

---

# Step 12 — Create First Feature

Recommended:

```
students/

api/

ui/

validation/

types/

utils/

constants/

index.ts
```

Do not create folders unless needed.

---

# Step 13 — Configure Testing

Enable:

- Unit tests
- Integration tests
- End-to-End tests

Follow Testing.md.

---

# Step 14 — Configure CI

Every Pull Request should execute:

- install
- typecheck
- lint
- test
- build

Merging must be blocked if any step fails.

---

# Step 15 — Documentation

Before writing business code ensure the repository contains:

- README.md
- AGENTS.md
- ARCHITECTURE.md
- CONTRIBUTING.md
- Engineering-Specification.md

Documentation is part of the architecture.

---

# Bootstrap Checklist

Before development begins:

- [ ] Monorepo created
- [ ] Applications created
- [ ] Shared packages created
- [ ] TypeScript configured
- [ ] Lint configured
- [ ] Design tokens created
- [ ] Routing configured
- [ ] Data layer configured
- [ ] State management configured
- [ ] Backend configured
- [ ] First feature created
- [ ] CI configured
- [ ] Documentation committed

The project is now ready for feature development.
