# ARCHITECTURE.md

> Architecture Overview
>
> This document explains how the project is organized and how all layers interact.

Version: 2.0

---

# High Level Architecture

```
                    Users
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
 Landing         CRM (Web)        Mobile
 (Next.js)      (React+Vite)      (Expo)
      │               │                │
      └───────────────┼────────────────┘
                      │
             Shared Packages
                      │
      ┌───────────────┼────────────────┐
      │               │                │
      ▼               ▼                ▼
     UI           Contracts        Design
     Types         Utilities        Config
```

Applications own platform code.

Packages own reusable code.

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
    contracts/
    types/
    utils/
    config/

tooling/

docs/
```

Top-level folders should remain stable.

---

# Layer Architecture

Every feature follows the same execution flow.

```
Page

    │

    ▼

Feature UI

    │

    ▼

TanStack Query Hook

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

No layer may skip another.

---

# Feature Structure

```
students/

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

A feature owns one business capability.

Examples:

- students
- teachers
- courses
- payments

---

# Responsibilities

## Pages

Responsible for:

- route composition
- layouts
- connecting feature UI

Never:

- fetch data directly
- implement business rules

---

## Components

Responsible for rendering.

Receive data.

Emit events.

No backend access.

---

## Query Hooks

Responsible for:

- fetching
- mutations
- cache
- invalidation

Hooks communicate with repositories only.

---

## Repository

Acts as the application API.

Responsible for:

- orchestrating data access
- hiding backend implementation

---

## DataSource

Infrastructure layer.

Examples:

- Supabase
- NestJS
- Mock

Nothing above this layer should know which backend is used.

---

# Dependency Rules

Allowed

```
Feature
    │
    ▼
Shared Package
```

Forbidden

```
Shared Package
    │
    ▼
Feature
```

Forbidden

```
Feature A
    │
    ▼
Private files of Feature B
```

Only `index.ts` is public.

---

# State Architecture

```
Server Data
      │
      ▼
TanStack Query

Shared UI State
      │
      ▼
Zustand

Component State
      │
      ▼
useState

Forms
      │
      ▼
React Hook Form + Zod
```

Never duplicate the same information across layers.

---

# Backend Migration

Current

```
Repository
      │
      ▼
Supabase DataSource
```

Future

```
Repository
      │
      ▼
NestJS DataSource
```

Repository API remains unchanged.

UI remains unchanged.

---

# Shared Packages

Shared packages contain:

- UI primitives
- Design tokens
- Types
- Contracts
- Utilities
- Configuration

Business logic never belongs here.

---

# Import Graph

```
Applications
      │
      ▼
Features
      │
      ▼
Packages
```

Reverse imports are forbidden.

---

# Evolution Rules

Create a new Feature when introducing a new business capability.

Create a new Package only after code has proven to be reusable across multiple features.

Prefer extending existing architecture over introducing new abstractions.

---

# Architecture Goals

- predictable
- scalable
- testable
- platform independent
- backend independent
- easy to onboard
- easy to refactor
