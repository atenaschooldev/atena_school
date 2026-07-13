# CI-CD.md

# CI/CD Guide

Purpose: define the pipeline stages, environments, and deployment strategy for every application in the monorepo.

---

# Principles

- Every Pull Request runs the same checks, no exceptions.
- Broken CI blocks merge, always.
- Deployment is automated; manual deploys are the exception, not the rule.

---

# Pipeline Stages

Every PR MUST run, in order:

```
1. install
2. typecheck
3. lint
4. test
5. build
```

A failure at any stage stops the pipeline. Later stages do not run.

---

# CI-001

Turborepo MUST be used to scope pipeline runs to affected packages/apps only.

Do not rebuild or retest the entire monorepo on every change if only one app/package was touched.

---

# CI-002

Each application (`landing`, `crm`, `mobile`) builds independently.

A failure in one application's build MUST NOT block merging changes unrelated to it, unless a shared package it depends on is broken.

---

# Environments & Promotion

```
development  → local only, not deployed
staging      → auto-deployed from main branch after CI passes
production   → deployed via manual promotion or tagged release
```

Never deploy directly to production from a feature branch.

---

# CI-003

Merging to `main` MUST automatically:

1. Run the full pipeline.
2. Deploy to staging if the pipeline passes.

Production deployment requires an explicit, separate approval step.

---

# CI-004

Database migrations (see Database-Migrations.md) run as a distinct pipeline step, before the application deploy, never bundled silently into app startup.

---

# Mobile-Specific (Expo)

- Use EAS Build for native builds.
- OTA updates deploy independently from native builds; document which changes require a full native rebuild (native module changes, Expo SDK bumps) vs which can ship OTA.

---

# Secrets in CI

Secrets are injected through the CI provider's secret store (see Environments.md), never checked into pipeline config files in plaintext.

---

# Rollback

Every deployment MUST be revertible:

- Web (landing/CRM): redeploy the previous build artifact.
- Mobile: OTA rollback to previous published update; native rollback requires a new store submission.
- Database: only forward-compatible migrations should ship without a tested rollback path (see Database-Migrations.md DB-004).

---

# Required Checks Before Merge

A PR cannot merge unless:

- [ ] install succeeds
- [ ] typecheck passes
- [ ] lint passes
- [ ] tests pass
- [ ] build succeeds for every affected app
- [ ] at least one approving review

---

# Anti-Patterns

Forbidden:

- skipping pipeline stages "to save time"
- manual production deploys bypassing CI
- deploying migrations and application code in the wrong order
- storing CI secrets in the repository
- rebuilding unaffected apps/packages on every PR

---

# Checklist

Before changing the pipeline itself ask:

- Does this still enforce the mandatory stages in order?
- Is Turborepo scoping preserved?
- Is production still gated behind an explicit approval?
- Are secrets still injected, not hardcoded?
- Is rollback still possible for every deployable unit?

If any answer is "no", revise before merging the pipeline change.
