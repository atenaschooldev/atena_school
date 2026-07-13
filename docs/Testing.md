# Testing.md

# Testing Strategy

Purpose: define what should be tested, how it should be tested, and what should not be tested.

---

# Principles

Testing should increase confidence, not complexity.

Prefer:

- deterministic tests
- isolated tests
- readable tests
- fast execution

Avoid:

- testing implementation details
- brittle snapshots
- duplicate tests

---

# Testing Pyramid

```
        E2E
      Integration
        Unit
```

Most tests should be unit tests.

---

# What to Test

## Business Logic

Always test.

Examples:

- calculations
- permissions
- validation
- business rules
- data transformations

Business logic should be easy to test because it is independent from UI.

---

## Repository

Test:

- successful requests
- failures
- mapping
- edge cases

Mock DataSource.

Do not mock the repository itself.

---

## DataSource

Test only integration with backend.

Examples:

- Supabase
- REST
- NestJS

---

## React Components

Test behavior.

Examples:

- renders correctly
- button click
- validation messages
- loading state
- empty state
- error state

Avoid testing internal implementation.

---

## Forms

Verify:

- validation
- submission
- disabled state
- error rendering

Schemas should already be covered by unit tests.

---

## Hooks

Test:

- loading
- success
- error
- retries
- cache invalidation

---

# End-to-End

Cover only critical user flows.

Examples:

- login
- create student
- enroll course
- payment
- logout

Avoid testing every visual detail.

---

# What NOT to Test

Do not test:

- third-party libraries
- React internals
- implementation details
- simple getters/setters
- generated code

---

# Test Location

Keep tests close to the code.

Example

```
students/

    api/
    ui/

    __tests__/
```

or

```
StudentRepository.test.ts

StudentCard.test.tsx
```

Choose one convention and use it consistently.

---

# Mocking

Mock external systems.

Do not mock your own business logic unless required.

Mock:

- backend
- network
- time
- browser APIs

---

# Coverage

Coverage is a metric.

Not a goal.

Prefer meaningful tests over high percentages.

---

# CI Requirements

Before merge:

- tests pass
- lint passes
- typecheck passes
- build passes

CI must block broken code.

---

# Checklist

Before adding a test ask:

- Does it verify behavior?
- Will it fail for a real regression?
- Is it easy to understand?
- Is it independent?
- Is it worth maintaining?

If not, reconsider the test.
