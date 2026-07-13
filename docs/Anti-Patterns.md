# Anti-Patterns.md

# Anti-Patterns

Purpose: document practices that are forbidden or strongly discouraged.

---

# AP-001 Business Logic in UI

❌ Wrong

- calculations in JSX
- permission checks scattered through components
- pricing logic in pages

✅ Correct

Move business logic into repository, utilities or dedicated domain functions.

---

# AP-002 Direct Backend Access

Forbidden inside UI:

- fetch()
- axios
- Supabase client
- SQL

Always use:

UI
↓
Query Hook
↓
Repository
↓
DataSource

---

# AP-003 Server State in Zustand

Never store:

- students
- teachers
- payments
- courses

inside Zustand.

Use TanStack Query.

---

# AP-004 Duplicated Validation

Do not create multiple validation rules.

Zod schema is the single source of truth.

---

# AP-005 Duplicated DTOs

One DTO per contract.

Never create:

StudentDTO
StudentResponse
StudentApiModel

when they represent the same thing.

---

# AP-006 Shared Dumping Ground

Do not create folders such as:

helpers/
common/
misc/
utils2/

Everything must have a clear responsibility.

---

# AP-007 Premature Shared Code

Do not move code to packages because it "might" be reused.

Move it only after it is reused.

---

# AP-008 God Components

Avoid components with hundreds of lines and multiple responsibilities.

Split by responsibility.

---

# AP-009 God Hooks

Avoid hooks that:

- fetch
- validate
- format
- navigate
- update global state

all at once.

One hook should solve one problem.

---

# AP-010 Deep Relative Imports

Avoid:

../../../../../../

Use path aliases.

---

# AP-011 Multiple Ways to Solve One Problem

Example:

Feature A uses fetch.

Feature B uses axios.

Feature C uses Repository.

Forbidden.

There must be one project standard.

---

# AP-012 Platform Checks Everywhere

Avoid excessive:

Platform.OS

Prefer separate implementations:

Component.web.tsx

Component.native.tsx

---

# AP-013 Business Rules in Forms

Forms collect input.

Business decisions belong outside the form.

---

# AP-014 Magic Values

Avoid:

16
24
9999
"active"

Create named constants or design tokens.

---

# AP-015 Overengineering

Do not introduce:

- unnecessary abstractions
- generic factories
- dependency injection frameworks
- patterns without a real problem

Keep the architecture simple.

---

# AP-016 Breaking Feature Boundaries

A feature must not depend on internal files of another feature.

Use only the public API.

---

# AP-017 Copy-Paste Development

Before writing code ask:

- Does this already exist?
- Can I reuse it?

Prefer reuse over duplication.

---

# AP-018 Unclear Naming

Avoid:

data
temp
item
helper
manager
new2
finalFinal

Names must describe intent.

---

# AP-019 Global State Abuse

Do not move local component state into Zustand without a real need.

Keep state as local as possible.

---

# AP-020 Ignoring Architecture

Never bypass documented layers because it is "faster".

Shortcuts become technical debt.

---

# Review Checklist

Before merging ask:

- Did I duplicate existing logic?
- Did I introduce a second pattern?
- Did I break layer boundaries?
- Did I add business logic to UI?
- Did I increase coupling?
- Did I create a generic utility without a clear purpose?
- Can this be understood in six months?

If any answer is "yes", refactor before merging.
