# Engineering-Specification.md

> Project Constitution
>
> This document is the single source of truth for architecture and engineering standards.

Version: 2.1

---

# 1. Scope

This specification is mandatory for:

- Web (React + Vite)
- Mobile (Expo)
- Landing (Next.js)
- Shared packages
- AI agents
- Human contributors

If another document conflicts with this specification, this document wins.

---

# 2. Engineering Principles

## SPEC-001

Prefer consistency over cleverness.

## SPEC-002

One problem must have one preferred solution.

## SPEC-003

Business logic must be platform independent.

## SPEC-004

Keep the architecture simple.

## SPEC-005

Reuse before creating.

---

# 3. Architecture Rules

## ARCH-001

Feature First is mandatory.

## ARCH-002

A Feature represents a business capability.

Examples:

- students
- teachers
- payments
- authentication

## ARCH-003

Every Feature exposes only its public API (`index.ts`).

## ARCH-004

Features MUST NOT import private files from other Features.

## ARCH-005

Shared packages MUST NOT depend on Features.

## ARCH-006

Business logic MUST NOT depend on React.

---

# 4. Feature Structure

Recommended:

```
feature/

├── api/
├── ui/
│   ├── pages/
│   ├── components/
│   └── forms/
├── validation/
├── types/
├── utils/
├── constants/
└── index.ts
```

Folders are created only when needed.

Do not create empty architecture.

---

# 5. Layer Architecture

```
UI
 │
 ▼
TanStack Query
 │
 ▼
Repository
 │
 ▼
DataSource
 │
 ▼
Backend
```

Every layer has exactly one responsibility.

Skipping layers is forbidden.

---

# 6. State Rules

## STATE-001

Server state → TanStack Query

## STATE-002

Shared client state → Zustand

## STATE-003

Component state → useState

## STATE-004

Forms → React Hook Form

## STATE-005

Validation → Zod

## STATE-006

Server state MUST NOT be copied into Zustand.

---

# 7. UI Rules

## UI-001

Pages compose screens.

## UI-002

Components render UI.

## UI-003

Forms collect input.

## UI-004

Business logic is forbidden inside UI.

## UI-005

Backend access is forbidden inside UI.

---

# 8. API Rules

## API-001

Repositories expose the application-facing API.

## API-002

DataSources expose backend implementations.

## API-003

Changing backend must require replacing only DataSources.

---

# 9. Backend Strategy

Current backend:

Supabase

Future backend:

NestJS

Migration strategy:

Only DataSources change.

Repositories, hooks and UI remain unchanged.

---

# 10. Shared Packages

Move code to packages only when:

- reused
- stable
- domain independent

Do not create shared code preemptively.

---

# 11. Routing

Landing

- Next.js App Router

CRM

- React Router

Mobile

- Expo Router

Business routes should remain semantically identical.

---

# 12. Design System

Single source of truth:

- colors
- spacing
- typography
- radius
- shadows
- motion
- icons

No hardcoded design values.

---

# 13. Performance

See Performance.md.

Mandatory:

PERF-001 Measure before optimizing.

PERF-002 Virtualize large lists.

PERF-003 Lazy load route-level screens.

PERF-004 Avoid unnecessary memoization.

---

# 14. Naming

See Naming.md.

Every new file, folder and symbol must follow the project naming convention.

---

# 15. Testing

See Testing.md.

Business logic should always be testable.

---

# 16. Code Review

See Code-Review.md.

Every Pull Request must satisfy review checklist.

---

# 17. AI Rules

See:

- AGENTS.md

AI-generated code follows the same standards as human-written code.

---

# 18. Anti-Patterns

See Anti-Patterns.md.

Forbidden practices are part of the specification.

---

# 19. Architecture Decisions

See Architecture-Decisions.md.

Architectural changes require an ADR update.

---

# 20. Authentication & Authorization

See Auth.md.

Mandatory:

AUTH-001 Authentication MUST go through Repository → DataSource, never accessed directly from UI.

AUTH-002 Tokens MUST NOT be stored in component state or Zustand.

AUTH-003 Token refresh is centralized inside the DataSource layer.

AUTH-004 Authentication and authorization are separate concerns and MUST NOT be conflated.

---

# 21. Error Handling

See Error-Handling.md.

Mandatory:

ERR-001 Raw stack traces, SQL errors, or provider messages MUST NOT reach the user.

ERR-002 Every async boundary MUST handle both success and error paths explicitly.

ERR-003 Each application MUST have a global fallback error boundary.

---

# 22. Environments & Configuration

See Environments.md.

Mandatory:

ENV-001 Secrets MUST NOT be committed to the repository.

ENV-002 Every environment variable MUST be documented in `.env.example`.

ENV-003 Public and secret variables MUST be clearly distinguished.

ENV-004 Shared packages MUST NOT read environment variables directly; configuration flows through `packages/config`.

---

# 23. API Contracts

See API-Contracts.md.

Mandatory:

CONTRACT-001 One DTO per concept. Never create near-duplicate DTOs for the same shape.

CONTRACT-002 DTOs MUST NOT leak past the Repository; UI only consumes mapped domain types.

CONTRACT-003 Validation schemas (Zod) and DTOs must stay consistent, derived from one another where they represent the same data.

---

# 24. Database & Migrations

See Database-Migrations.md.

Mandatory:

DB-001 Every schema change MUST be captured as a migration file; no manual edits against staging/production.

DB-002 Migrations are named with a timestamp and a descriptive action.

DB-003 One migration equals one logical change.

DB-004 Destructive migrations require a prior deprecation step.

---

# 25. CI/CD

See CI-CD.md.

Mandatory:

CI-001 Turborepo scopes pipeline runs to affected packages/apps only.

CI-002 Each application builds independently.

CI-003 Merging to `main` triggers the full pipeline and auto-deploys to staging; production requires explicit approval.

CI-004 Database migrations run as a distinct pipeline step, before the application deploy.

---

# 26. Definition of Done

A task is complete only if:

- architecture preserved
- tests pass
- typecheck passes
- lint passes
- no duplicated logic
- no secrets or unhandled errors introduced
- documentation updated when required

---

# 27. Evolution Policy

Architecture evolves only when:

- a real limitation is identified;
- alternatives have been evaluated;
- trade-offs are documented;
- an ADR is updated.

Avoid architecture changes driven by trends.