# Monorepo.md

# Monorepo Guide

Purpose: define the repository layout, ownership and dependency rules.

---

# Goals

- Single repository
- Shared business logic
- Independent applications
- Fast builds
- Clear ownership
- Minimal duplication

---

# Tooling

Package Manager

- pnpm

Build System

- Turborepo

Language

- TypeScript

---

# Repository Layout

```
apps/
    landing/
    crm/
    mobile/

packages/
    ui/
    design/
    api/
    contracts/
    types/
    utils/
    config/

tooling/
    eslint/
    prettier/
    typescript/

docs/
```

Keep top-level folders stable.

---

# Applications

## landing

Technology:

- Next.js

Responsibilities:

- marketing website
- authentication entry
- course catalog
- public pages

Must not contain CRM business logic.

---

## crm

Technology:

- React
- Vite

Responsibilities:

- administration
- dashboards
- management

---

## mobile

Technology:

- Expo

Responsibilities:

- mobile experience
- native integrations

Business logic should be shared whenever possible.

---

# Dependency Rules

Applications MAY depend on packages.

Packages MUST NOT depend on applications.

Features MUST NOT import internal files from other features.

---

# Import Strategy

Always prefer aliases.

Good

```
@/features/students
@repo/ui
@repo/types
```

Avoid

```
../../../../
```

---

# Ownership

apps/

Own platform implementation.

packages/

Own reusable implementation.

docs/

Own project knowledge.

tooling/

Own development configuration.

---

# Configuration

Centralize:

- eslint
- prettier
- tsconfig
- biome (if adopted)

Avoid duplicate configuration.

---

# Environment Variables

Each application owns its own environment.

Shared packages must not directly read environment variables.

Pass configuration through application boundaries.

---

# Assets

Platform-specific assets remain inside applications.

Shared assets may live in packages/assets if truly reused.

---

# Adding a New Package

Create a package only if:

- reused by multiple applications or features;
- independent from business domain;
- has a clear responsibility.

Otherwise keep the code inside the feature.

---

# Adding a New Application

Requirements:

- independent runtime;
- independent entry point;
- clear purpose.

Examples:

- admin
- mobile
- landing

Do not create applications to organize code.

---

# Build Philosophy

Every application should be buildable independently.

Packages should compile independently.

Broken packages must fail CI.

---

# Versioning

Prefer keeping packages versioned together inside the monorepo.

Avoid unnecessary internal package publishing.

---

# Checklist

Before creating a package ask:

- Is it reused?
- Is it domain independent?
- Does it simplify the architecture?
- Can it stay inside a feature instead?

If uncertain, keep it inside the feature.
