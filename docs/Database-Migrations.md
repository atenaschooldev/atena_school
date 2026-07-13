# Database-Migrations.md

# Database & Migrations Guide

Purpose: define how schema changes, migrations, and seed data are managed as the backend evolves (Supabase today, NestJS in the future).

---

# Principles

- Schema changes are tracked as code, never applied manually against production.
- Every migration is reversible or explicitly documented as irreversible.
- Seed data is separate from migrations.

---

# Ownership

Migrations live outside `apps/` and `packages/`, in a dedicated location:

```
supabase/
    migrations/
    seed.sql

# or, if using a standalone DB tooling folder:
db/
    migrations/
    seed/
```

No feature or application owns migrations directly.

---

# DB-001

Every schema change MUST be captured as a migration file, generated through the project's migration tool (e.g. Supabase CLI).

Forbidden:

- editing tables directly through a dashboard in staging/production
- applying manual SQL against production without a corresponding migration file

---

# DB-002

Migration files are named with a timestamp and a descriptive action.

```
20260713101500_add_students_table.sql
20260714090000_add_index_students_email.sql
```

Avoid vague names:

```
update.sql
fix.sql
migration2.sql
```

---

# DB-003

One migration = one logical change.

Do not bundle unrelated schema changes (e.g. new table + unrelated column rename) into a single migration.

---

# DB-004

Destructive migrations (dropping columns/tables) require:

1. A prior migration that stops writing to the field/table.
2. A deprecation period.
3. The actual drop migration, clearly labeled `destructive`.

Never drop a column in the same release that removes its last usage.

---

# Local Development

Every contributor runs migrations locally through the same command, defined once in the project scripts (e.g. `pnpm db:migrate`).

Never hand-edit a local database into a different shape than migrations describe.

---

# Seed Data

- Seed data is for local development and testing only.
- Never seed production through the same script used for local/staging.
- Keep seed data minimal and realistic; avoid embedding sensitive-looking data (even fake).

```
db/seed/
    students.seed.ts
    teachers.seed.ts
```

---

# Environments

Migrations run identically across environments (development, staging, production), differing only in target connection — see Environments.md.

Never write environment-specific migration logic (`if staging then ...`).

---

# Backend Migration Strategy (Supabase → NestJS)

When the backend moves from Supabase to NestJS:

- The underlying schema/migrations remain the source of truth regardless of which service executes queries.
- NestJS DataSource implementations must respect the same schema; do not introduce a parallel, drifting schema definition.
- Coordinate schema changes with both DataSource implementations during the transition period, if both are live simultaneously.

---

# Anti-Patterns

Forbidden:

- manual schema edits against staging/production
- bundling unrelated changes into one migration
- dropping columns/tables without a deprecation step
- running seed scripts against production
- environment-specific migration branching

---

# Checklist

Before merging a migration ask:

- Is this one logical schema change?
- Is it named descriptively with a timestamp?
- If destructive, has the deprecation step happened first?
- Does local dev, staging, and production apply it identically?
- Is seed data kept separate from the migration itself?

If any answer is "no", revise before merging.
