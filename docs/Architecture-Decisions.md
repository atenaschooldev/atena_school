# Architecture-Decisions.md

# Architecture Decisions Record (ADR)

Status: Living Document

Purpose: Record major architectural decisions and the reasoning behind them.

---

# ADR-001 — Monorepo

## Status
Accepted

## Problem

The project contains multiple applications sharing the same business domain.

## Decision

Use a single monorepo with pnpm and Turborepo.

## Why

- Shared business logic
- Shared design system
- Shared configuration
- Easier refactoring
- Simpler CI/CD

## Trade-offs

- Slightly more complex setup
- Requires dependency discipline

## Revisit

Only if applications become completely independent.

---

# ADR-002 — React + Vite for CRM

## Status
Accepted

## Problem

The CRM does not require SEO.

## Decision

Use React + Vite.

## Why

- Fast development
- Excellent HMR
- Small configuration surface
- Rich ecosystem

## Trade-offs

- No SSR

## Revisit

If SEO or server rendering becomes a CRM requirement.

---

# ADR-003 — Next.js for Landing

## Status
Accepted

## Problem

The public website requires SEO.

## Decision

Use Next.js App Router.

## Why

- SEO
- Static generation
- Metadata
- Excellent routing

## Trade-offs

- Separate application

---

# ADR-004 — Expo for Mobile

## Status
Accepted

## Problem

Need one mobile codebase with native capabilities.

## Decision

Use Expo.

## Why

- Fast iteration
- OTA updates
- Mature ecosystem
- Native APIs when needed

## Trade-offs

- Expo release cadence

---

# ADR-005 — Feature First

## Status
Accepted

## Problem

Need scalable project organization.

## Decision

Organize by business capability.

## Why

- Better ownership
- Easier navigation
- Lower coupling

## Trade-offs

- Requires discipline

---

# ADR-006 — Repository + DataSource

## Status
Accepted

## Problem

Backend will evolve from Supabase to NestJS.

## Decision

UI → Query Hook → Repository → DataSource → Backend

## Why

- Backend independence
- Easier testing
- Vendor lock avoidance

## Trade-offs

- One additional layer

---

# ADR-007 — TanStack Query

## Status
Accepted

## Problem

Need reliable server-state management.

## Decision

Use TanStack Query.

## Why

- Cache
- Retry
- Invalidation
- Optimistic updates
- Devtools

## Trade-offs

- Additional dependency

---

# ADR-008 — Zustand

## Status
Accepted

## Problem

Need lightweight client-state management.

## Decision

Use Zustand only for shared client state.

## Why

- Minimal API
- Excellent performance
- Simple mental model

## Trade-offs

- Must avoid storing server state

---

# ADR-009 — Zod

## Status
Accepted

## Problem

Need runtime validation and TypeScript inference.

## Decision

Use Zod as the single validation layer.

## Why

- Type inference
- Runtime validation
- Shared schemas

---

# ADR-010 — React Hook Form

## Status
Accepted

## Problem

Need performant forms.

## Decision

Use React Hook Form with Zod.

## Why

- Uncontrolled inputs
- Excellent performance
- Minimal rerenders

---

# ADR-011 — Design Tokens

## Status
Accepted

## Problem

Need visual consistency across Web and Mobile.

## Decision

Centralize colors, spacing, typography, radius and motion.

## Why

- Single source of truth
- Easier redesigns
- Shared UI language

---

# ADR-012 — Public API

## Status
Accepted

## Problem

Need stable module boundaries.

## Decision

Every feature exposes only index.ts.

## Why

- Hide implementation
- Easier refactoring
- Stable imports

---

# ADR-013 — Shared Packages

## Status
Accepted

## Problem

Need reusable code without creating a dumping ground.

## Decision

Move code to packages only after proven reuse.

## Why

- Avoid premature abstraction
- Keep features cohesive

---

# ADR-014 — Supabase Migration

## Status
Accepted

## Problem

Supabase is the initial backend but NestJS is planned.

## Decision

Replace only DataSource implementations.

## Why

Repositories, hooks and UI remain unchanged.

---

# ADR-015 — Simplicity First

## Status
Accepted

## Problem

Large React projects tend to accumulate unnecessary abstractions.

## Decision

Prefer simple architecture over enterprise patterns.

## Why

- Easier onboarding
- Lower maintenance
- Faster development

## Explicitly Rejected

- Full Clean Architecture
- Full DDD
- Heavy Dependency Injection
- Generic factories without a real use case
- Multiple competing architectural styles

---

# Revision Policy

Every architectural change MUST answer:

1. What problem does it solve?
2. Why is the current solution insufficient?
3. What are the alternatives?
4. What are the trade-offs?
5. Which existing documents must be updated?

If these questions cannot be answered, the architecture should not change.
