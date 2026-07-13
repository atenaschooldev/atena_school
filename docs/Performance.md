# Performance.md

# Performance Guide

Purpose: define performance rules for React, Vite and Expo projects.

---

# Philosophy

Rule PERF-001

Measure before optimizing.

Never optimize based on assumptions.

---

# General Rules

Prefer:

- simple components
- predictable rendering
- stable references
- composition
- lazy loading

Avoid:

- premature optimization
- unnecessary abstractions

---

# React

Prefer React Compiler compatible code.

Do not add memoization everywhere.

Use:

- useMemo
- useCallback
- React.memo

only after identifying a real rendering problem or when required by third-party APIs.

Keep components small.

Split components by responsibility instead of creating huge memoized files.

---

# Rendering

Avoid:

- expensive calculations inside render
- object literals recreated every render when passed deeply
- unnecessary context updates

Move heavy calculations into dedicated utilities.

---

# Lists

Large collections MUST be virtualized.

Web:

- TanStack Virtual (or equivalent)

Mobile:

- FlashList

Never render thousands of rows directly.

---

# Images

Lazy load where possible.

Use properly sized assets.

Do not ship oversized images.

---

# TanStack Query

Server state belongs here.

Recommendations:

- stable query keys
- reasonable staleTime
- invalidate only affected queries
- optimistic updates only when beneficial
- avoid unnecessary refetches

Never duplicate query data inside Zustand.

---

# Zustand

Keep stores small.

Good:

- auth
- theme
- settings
- ui state

Bad:

- students list
- courses
- teachers
- invoices

These belong in TanStack Query.

---

# Forms

Use React Hook Form.

Use uncontrolled inputs when possible.

Validate with Zod.

Avoid keeping large forms in component state.

---

# Routing

Lazy load route-level pages.

Do not eagerly import rarely used screens.

---

# Components

A component should have one responsibility.

If it becomes difficult to understand,
split it.

Avoid deeply nested JSX.

---

# Bundle Size

Prefer:

- tree-shakeable libraries
- dynamic imports
- route splitting

Avoid large dependencies for small tasks.

---

# Imports

Import only what is needed.

Remove dead code.

Avoid barrel files that force loading unrelated modules.

---

# Mobile

Prefer:

- FlashList
- Reanimated
- NativeWind
- Expo New Architecture

Avoid unnecessary bridge calls.

Minimize rerenders.

---

# Web

Use Vite code splitting.

Lazy load feature pages.

Keep initial bundle small.

---

# Network

Request only required fields.

Batch requests when appropriate.

Cache aggressively where safe.

---

# Anti-patterns

Forbidden:

- server state in Zustand
- business logic in render
- fetching inside components
- unnecessary global state
- giant components
- excessive memoization
- duplicate API requests

---

# Performance Checklist

Before merging verify:

- no unnecessary rerenders
- no duplicated state
- no duplicated requests
- lazy loading considered
- large lists virtualized
- forms optimized
- bundle impact acceptable
- architecture preserved
