# Project-Structure.md

> Repository Structure Guide
>
> Defines where every piece of code belongs.

Version: 1.0

---

# Repository

```
/
├── apps/
├── packages/
├── tooling/
├── docs/
├── .github/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

Each top-level directory has one responsibility.

---

# apps/

Contains runnable applications.

```
apps/

    landing/
    admin/
    app/
    mobile/
```

Applications own platform-specific code.

Never place reusable business logic here.

---

# apps/landing

```
landing/

    app/
    components/
    features/
    public/
```

Purpose:

- SEO
- Marketing
- Authentication entry
- Course catalog

---

# apps/admin

```
admin/

    src/

        app/
        features/
        providers/
        routes/
        assets/

    public/
```

Contains administrative and management application (CRM/Admin).

---

# apps/app

```
app/

    src/

        app/
        features/
        components/
```

Contains personal portal for students, parents, and teachers (LK).

---

# apps/mobile

```
mobile/

    app/
    features/
    providers/
    assets/
```

Contains Expo application.

Keep feature structure similar to CRM.

---

# app/

Contains application-level configuration.

Examples:

- Router
- Providers
- Theme
- Query Client
- Store initialization

Never place business logic here.

---

# features/

Contains business capabilities.

```
features/

    auth/
    students/
    teachers/
    courses/
    payments/
```

Each feature owns its complete implementation.

---

# Feature Structure

```
students/

├── api/
│   ├── repositories/
│   ├── datasources/
│   ├── queries/
│   ├── mutations/
│   └── queryKeys.ts
│
├── ui/
│   ├── pages/
│   ├── components/
│   └── forms/
│
├── validation/
├── types/
├── utils/
├── constants/
│
└── index.ts
```

Create folders only when needed.

---

# api/

Contains:

- Repository
- DataSource
- Query Hooks
- Mutations
- Query Keys

No UI.

---

# ui/pages

Route-level screens.

Should remain thin.

Responsibilities:

- compose screen
- call feature hooks
- arrange layout

---

# ui/components

Feature-specific reusable UI.

Examples:

- StudentCard
- StudentTable
- StudentToolbar

---

# ui/forms

Feature forms.

Always:

- React Hook Form
- Zod

---

# validation

Contains Zod schemas.

Single source of truth.

---

# types

Contains feature-only types.

Shared types belong in packages/types.

---

# utils

Feature-specific helper functions.

If reused across features, move to packages/utils.

---

# constants

Feature constants.

Examples:

- limits
- statuses
- defaults

Avoid magic values.

---

# packages/

Contains reusable, platform-independent code.

```
packages/

    ui/
    design/
    contracts/
    types/
    utils/
    config/
```

Packages never depend on Features.

---

# packages/ui

Contains design-system components.

Examples:

- Button
- Input
- Dialog
- Card
- Avatar

Never place business components here.

---

# packages/design

Contains:

- colors
- spacing
- typography
- shadows
- radius
- motion
- icons

Single design language.

---

# packages/contracts

Shared API contracts.

Examples:

- DTO
- API payloads
- shared schemas

---

# packages/types

Project-wide shared types.

Not business-specific.

---

# packages/utils

Pure reusable utilities.

Must have no business knowledge.

---

# packages/config

Shared configuration.

Examples:

- env helpers
- constants
- feature flags

---

# tooling/

Shared developer tooling.

```
tooling/

    eslint/
    prettier/
    typescript/
```

One configuration for the entire monorepo.

---

# docs/

Engineering documentation.

Never place source code here.

---

# Folder Creation Rules

Before creating a new folder ask:

1. Does one already exist?
2. Is it a new responsibility?
3. Will it reduce complexity?

If not, do not create it.

---

# Golden Rule

Every file should have an obvious home.

If it does not, reconsider the architecture before adding it.
