# Feature-Template.md

# Feature Template

Purpose: define a consistent structure for every business feature.

---

# What is a Feature?

A feature represents a business capability.

Examples:

- authentication
- students
- teachers
- courses
- payments
- reports

A feature owns everything required to implement that capability.

---

# Recommended Structure

```
feature/

├── api/
├── ui/
│   ├── pages/
│   ├── components/
│   └── forms/
├── types/
├── validation/
├── utils/
├── constants/
└── index.ts
```

Keep the structure simple.
Do not add folders without a clear need.

---

# Folder Responsibilities

## api/

Contains:

- TanStack Query hooks
- repositories
- datasource implementations
- query keys
- mutations

UI must only communicate through this layer.

---

## ui/pages/

Route-level screens.

Responsibilities:

- compose the screen
- arrange layouts
- connect feature components

Must NOT contain business logic.

---

## ui/components/

Feature-specific UI.

Examples:

- StudentCard
- StudentTable
- StudentToolbar

Keep components focused.

---

## ui/forms/

React Hook Form based forms.

Validation MUST use Zod.

Do not duplicate schemas.

---

## types/

Feature-specific types.

Shared types belong in packages/types.

---

## validation/

Zod schemas.

Validation is the single source of truth.

---

## utils/

Feature-specific helpers only.

If reused by multiple features, move to packages/utils.

---

## constants/

Feature-specific constants.

Examples:

- statuses
- limits
- default values

---

## index.ts

Public API of the feature.

Only export what other modules should consume.

---

# Public API Rules

Allowed

```
import { StudentPage } from "@/features/students";
```

Forbidden

```
import StudentPage from "@/features/students/ui/pages/StudentPage";
```

---

# When to Create a New Feature

Create a feature when introducing a new business capability.

Do NOT create a feature for:

- buttons
- dialogs
- cards
- icons

Those belong to the design system or shared UI.

---

# Shared vs Feature

Move code to shared only if:

- used by multiple features;
- domain independent;
- stable.

Otherwise keep it inside the feature.

---

# Checklist

Before creating a feature ask:

- Is this a business capability?
- Does a similar feature already exist?
- Can it extend an existing feature?
- Will any code be shared immediately?

If most answers are "no", reconsider the design.

---

# Goals

Every feature should be:

- isolated
- predictable
- testable
- reusable
- easy to delete
- easy to migrate

The internal implementation may change.

The public API should remain stable.
