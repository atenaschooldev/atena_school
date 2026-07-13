# Environments.md

# Environments & Configuration Guide

Purpose: define how environment variables, secrets, and per-environment configuration are managed across the monorepo.

---

# Principles

- Each application owns its own environment.
- Shared packages MUST NOT read `process.env` / `import.meta.env` directly.
- Configuration flows into packages through explicit parameters, never through ambient env access.
- Secrets never enter the repository.

---

# Environments

Define exactly three environments:

```
development
staging
production
```

Do not introduce ad-hoc environments (e.g. "demo", "client-x") without updating this document.

---

# File Convention

Per application:

```
apps/<app>/
    .env.example
    .env.local        (gitignored)
    .env.staging       (CI/CD only, never committed)
    .env.production    (CI/CD only, never committed)
```

`.env.example` MUST always be committed and kept up to date with every variable the app needs, using placeholder values.

---

# ENV-001

Never commit real secrets, keys, or tokens to the repository, including inside `.env.example`.

---

# ENV-002

Each variable MUST be documented in `.env.example` with a one-line comment explaining its purpose.

```
# Supabase project URL (public)
VITE_SUPABASE_URL=

# Supabase anon key (public, safe for client)
VITE_SUPABASE_ANON_KEY=
```

---

# ENV-003

Distinguish public vs secret variables explicitly.

- Public (safe for client bundle): prefixed per framework convention (`VITE_`, `NEXT_PUBLIC_`, `EXPO_PUBLIC_`).
- Secret (server-only): no public prefix, never referenced from client code, never bundled.

Never put a secret key behind a public-prefixed variable.

---

# ENV-004

`packages/config` exposes typed accessors, not raw `process.env` reads.

```ts
// packages/config
export const config = {
  supabaseUrl: readEnv("SUPABASE_URL"),
  apiBaseUrl: readEnv("API_BASE_URL"),
};
```

Applications inject values; packages consume them through this typed layer, never through direct env access.

---

# Secrets in CI/CD

- Store secrets in the CI/CD provider's secret manager (GitHub Actions secrets, Vercel env, etc.), never in the repo.
- Staging and production secrets MUST be different values, even if structurally identical.
- Rotate secrets if ever accidentally exposed (commit, log, screenshot).

---

# Backend Environment Parity

Supabase (current) and NestJS (future) MUST expose configuration through the same variable names and shapes from the application's point of view.

Changing backend must only require updating DataSource configuration, not application-level env contracts (see Engineering-Specification.md §9).

---

# Feature Flags

Feature flags belong in `packages/config`, not scattered `if` checks against raw env variables.

```ts
config.features.newPaymentFlow
```

Never check `process.env.SOME_FLAG` directly inside a feature.

---

# Anti-Patterns

Forbidden:

- committing real secrets or `.env.local`
- reading `process.env` inside `packages/*`
- mixing public and secret variables under the same prefix
- environment-specific business logic branching (`if (env === "staging")`) inside features
- inventing new environments without updating this document

---

# Checklist

Before merging ask:

- Is every new variable documented in `.env.example`?
- Are secrets excluded from the repository?
- Does the variable use the correct public/secret prefix?
- Do packages avoid direct env access?
- Are staging and production secrets distinct?

If any answer is "no", fix it before merging.
