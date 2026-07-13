# CONTRIBUTING.md

# Contributing Guide

This document defines the development workflow for everyone contributing to the project, including AI agents.

---

# Principles

Every change should:

- follow the architecture;
- solve one problem;
- be easy to review;
- avoid unnecessary complexity;
- preserve consistency.

---

# Development Workflow

1. Sync with the latest main branch.
2. Create a feature branch.
3. Implement the change.
4. Run quality checks.
5. Self-review.
6. Open a Pull Request.
7. Address review comments.
8. Merge after approval.

---

# Branch Naming

Use descriptive names.

Examples:

```
feature/student-management
feature/auth

fix/student-form

refactor/student-api

docs/architecture
```

Avoid:

```
test
new
temp
fix
```

---

# Commit Messages

Prefer Conventional Commits.

Examples:

```
feat(students): add student creation

fix(auth): refresh expired session

refactor(api): extract repository

docs: update architecture guide
```

One commit should represent one logical change.

---

# Pull Requests

A Pull Request should:

- solve one problem;
- stay focused;
- avoid unrelated refactoring;
- include a clear description.

---

# Before Opening a PR

Verify:

- project builds;
- TypeScript passes;
- lint passes;
- formatting is correct;
- no debug code remains;
- no dead code remains.

---

# Feature Development

Before creating a new feature ask:

- Is this a new business capability?
- Can the existing feature be extended?
- Is shared code really shared?

If the answer is unclear, prefer extending an existing feature.

---

# Shared Code

Move code into shared packages only when:

- used by multiple features;
- domain independent;
- stable.

Do not create shared code preemptively.

---

# UI Rules

Pages:

- compose screens;
- define layout;
- contain no business logic.

Components:

- render UI;
- receive data via props or hooks;
- remain small and reusable.

Forms:

- use React Hook Form;
- validate with Zod.

---

# API Rules

Never access backend directly from UI.

Always follow:

UI
↓
TanStack Query
↓
Repository
↓
DataSource
↓
Backend

---

# State Rules

Server state:
- TanStack Query

Shared client state:
- Zustand

Component state:
- useState

Never duplicate state across multiple layers.

---

# Code Review Checklist

Reviewers should verify:

- architecture respected;
- correct layer boundaries;
- no duplicated logic;
- proper naming;
- no forbidden imports;
- feature structure preserved;
- no unnecessary abstractions.

---

# AI Contributions

AI-generated code must follow the same rules as human-written code.

Reject AI code if it:

- introduces a new architecture;
- bypasses repositories;
- duplicates existing functionality;
- violates import boundaries;
- adds unnecessary dependencies.

---

# Definition of Done

A task is complete only if:

- requirements are implemented;
- architecture is respected;
- documentation updated if needed;
- no known regressions introduced;
- project remains consistent.
