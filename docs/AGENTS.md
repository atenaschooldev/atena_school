# AGENTS.md

> **Project AI Operating Manual**
>
> This document is the entry point for every AI coding agent working in this repository (Claude Code, Codex, ChatGPT, Cursor, GitHub Copilot, Gemini CLI, or any future coding agent).

---

# Mission

Your primary objective is **to preserve the architecture of this project**.

Priorities (highest → lowest):

1. Correctness
2. Architecture consistency
3. Maintainability
4. Performance
5. Speed

Never invent a second way to solve an existing problem. Extend the project — do not redesign it.

---

# Context Loading

Before making changes, read documents in this order:

1. AGENTS.md
2. Engineering-Specification.md
3. ARCHITECTURE.md
4. Feature-Template.md
5. The target feature
6. Related feature(s), if any

Do not start coding before understanding the existing implementation.

---

# Task Classification

Determine the task type before changing code.

- Bug Fix
- New Feature
- Refactor
- Documentation
- Performance
- Architecture

Each task should stay within its scope.

---

# Approved Technology Stack

MUST use:

- React 19
- React Router
- Vite
- Next.js (Landing only)
- Expo
- TypeScript
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Tailwind CSS
- NativeWind
- pnpm
- Turborepo

MUST NOT introduce alternatives without an approved Architecture Decision.

---

# Mandatory Rules

## ARCH-001

Every Feature MUST expose only its public API through `index.ts`.

## ARCH-002

Features MUST NOT import private files from another Feature.

Allowed:

Feature → Feature/index.ts

Forbidden:

Feature → Feature/ui/components/...

## ARCH-003

Business logic MUST remain platform independent.

## ARCH-004

Business logic MUST NOT exist inside UI components.

## ARCH-005

Prefer extending existing architecture over creating new abstractions.

---

# UI Rules

## UI-001

Pages compose screens.

## UI-002

Components render UI.

## UI-003

Forms collect user input.

## UI-004

UI MUST NOT call:

- fetch
- axios
- Supabase
- SQL

---

# API Rules

All backend communication MUST follow:

UI

↓

TanStack Query

↓

Repository

↓

DataSource

↓

Backend

UI MUST NEVER bypass Repository.

---

# State Rules

STATE-001

Server State → TanStack Query

STATE-002

Shared Client State → Zustand

STATE-003

Local Component State → useState

STATE-004

Forms → React Hook Form

STATE-005

Validation → Zod

STATE-006

Server State MUST NOT be duplicated inside Zustand.

---

# Feature Rules

A Feature represents a business capability.

Examples:

- auth
- students
- teachers
- courses
- payments

Do not create Features for reusable UI.

---

# Import Rules

Use aliases.

Good:

@/features/students

@repo/ui

Avoid:

../../../../../

---

# Performance Rules

PERF-001

Measure before optimizing.

PERF-002

Large lists MUST be virtualized.

PERF-003

Do not use memoization without evidence.

PERF-004

Prefer route-level lazy loading.

---

# Refactoring Rules

Refactor only when:

- requested;
- fixing a bug;
- reducing duplication;
- preserving behavior.

Avoid large unrelated refactors.

---

# Forbidden Behaviour

Never:

- invent architecture
- create duplicate patterns
- add another state manager
- add another validation library
- bypass Repository
- place business logic into UI
- create helper dumping grounds
- duplicate DTOs
- duplicate Zod schemas
- duplicate business rules

---

# AI Workflow

1. Understand the task.
2. Read the relevant documentation.
3. Inspect existing implementation — search for an existing component, hook, repository, utility, schema, or type before creating a new one.
4. Reuse before creating.
5. Implement.
6. Self-review.
7. Return the smallest correct change.

---

# Self Review Checklist

Before finishing verify:

- [ ] Architecture respected
- [ ] Feature boundaries respected
- [ ] No business logic in UI
- [ ] Repository pattern respected
- [ ] Correct state management
- [ ] Naming follows Naming.md
- [ ] No duplicated logic
- [ ] No unnecessary dependency
- [ ] Documentation updated if required

If any item fails, fix it before completing the task.

---

# References

- ARCHITECTURE.md
- Engineering-Specification.md
- Feature-Template.md
- Performance.md
- Naming.md
- Routing.md
- Monorepo.md
- Project-Structure.md
- Testing.md
- Code-Review.md
- Anti-Patterns.md
- Architecture-Decisions.md
- Auth.md
- Error-Handling.md
- Environments.md
- API-Contracts.md
- Database-Migrations.md
- CI-CD.md