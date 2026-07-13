# Error-Handling.md

# Error Handling Guide

Purpose: define one consistent way to handle, surface and log errors across all layers.

---

# Principles

- Errors MUST be handled at the layer that knows what to do about them.
- Never swallow errors silently.
- Never show raw backend errors to the user.
- One error shape across the entire project.

---

# Error Shape

Define a single shared error contract.

```
packages/contracts/

    AppError.ts
```

```ts
type AppError = {
  code: string;        // machine-readable, e.g. "AUTH_INVALID_CREDENTIALS"
  message: string;      // user-safe message
  cause?: unknown;      // original error, never shown to the user
};
```

Every layer that throws MUST throw an `AppError`, not a raw string or provider-specific exception.

---

# Layer Responsibilities

## DataSource

Responsible for:

- catching provider-specific errors (Supabase, REST, NestJS)
- translating them into `AppError`

Never let a raw Supabase/Postgres/HTTP error escape the DataSource.

---

## Repository

Responsible for:

- adding business-meaningful context if needed
- deciding whether to retry, rethrow, or return a fallback

Never catch an error just to hide it without a reason.

---

## Query Hooks

Responsible for:

- exposing `error`, `isError` states to the UI
- never swallowing the error silently

```ts
const { data, error, isError } = useStudents();
```

---

## UI

Responsible for:

- rendering error state (message, retry action)
- never interpreting raw error codes directly; use a mapping utility

```tsx
{isError && <ErrorState message={mapErrorToMessage(error)} onRetry={refetch} />}
```

---

# ERR-001

Never expose raw stack traces, SQL errors, or provider messages to the user.

---

# ERR-002

Every async boundary (query, mutation, form submit) MUST handle both the success and error path explicitly.

---

# ERR-003

Global fallback (error boundary) MUST exist per application, catching unhandled UI errors.

- Web: React Error Boundary at the app-shell level
- Mobile: Expo equivalent

This is a safety net, not a substitute for local error handling.

---

# Logging

- Log `AppError.cause` server-side or to a monitoring tool (e.g. Sentry), never to the client console in production.
- Never log sensitive data: passwords, tokens, full payment details.
- Client-side logging in development is fine; strip it in production builds.

---

# Form Errors

Validation errors come from Zod and are handled by React Hook Form.

Submission errors (network/backend) are a separate concern:

```tsx
const onSubmit = async (data) => {
  try {
    await createStudent(data);
  } catch (err) {
    setFormError(mapErrorToMessage(err));
  }
};
```

Never mix Zod validation errors with backend submission errors in the same state.

---

# Retry Strategy

- TanStack Query handles retries for transient network errors (default config).
- Do not implement manual retry loops inside components.
- Mutations that are not idempotent MUST NOT auto-retry.

---

# Anti-Patterns

Forbidden:

- catching an error and doing nothing (`catch {}`)
- showing `error.message` from a raw provider directly to the user
- logging sensitive data
- handling the same error in multiple layers redundantly
- inventing a new error shape per feature

---

# Checklist

Before merging ask:

- Does every async call handle its error path?
- Is the error translated to `AppError` before leaving the DataSource?
- Is the user-facing message safe and generic?
- Is sensitive data excluded from logs?
- Is there a fallback UI for the error state?

If any answer is "no", fix it before merging.
