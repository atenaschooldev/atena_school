# API-Contracts.md

# API Contracts Guide

Purpose: define how data contracts between backend and frontend are created, shared, and kept in sync.

---

# Principles

- One contract per concept, shared by every consumer.
- Contracts live in `packages/contracts`, never duplicated per feature.
- Frontend types are derived from contracts, not invented independently.

---

# Location

```
packages/contracts/

    students/
        StudentDTO.ts
        CreateStudentDTO.ts
        UpdateStudentDTO.ts

    auth/
        UserDTO.ts
        AuthTokensDTO.ts

    common/
        PaginatedResponse.ts
        AppError.ts
```

Group contracts by domain, mirroring feature names where possible.

---

# CONTRACT-001

A DTO represents exactly one shape. Never create near-duplicates:

Forbidden:

```
StudentDTO
StudentResponse
StudentApiModel
```

If the shape differs meaningfully (e.g. create vs update), name it explicitly:

```
CreateStudentDTO
UpdateStudentDTO
```

---

# CONTRACT-002

DTOs describe wire format (what the backend returns/accepts).

Domain types (`Student`, `Teacher`) describe what the application works with internally.

Mapping between DTO and domain type happens once, inside the Repository.

```
DataSource → returns StudentDTO
Repository → maps StudentDTO → Student
UI         → only ever sees Student
```

Never let a raw DTO leak past the Repository into UI.

---

# CONTRACT-003

Contracts and validation schemas MUST stay consistent.

- Zod schemas (validation/) define runtime shape for input.
- DTOs (packages/contracts) define wire shape for output.
- Where they represent the same data, derive one from the other instead of writing both by hand.

```ts
type CreateStudentDTO = z.infer<typeof CreateStudentSchema>;
```

---

# Source of Truth Strategy

Choose one, document which applies to this project, and stay consistent:

**Option A — Backend-first (recommended if NestJS migration is planned):**
Backend OpenAPI/GraphQL schema is the source of truth. Frontend types are generated from it.

**Option B — Contract-first:**
`packages/contracts` is written by hand and both backend and frontend implement against it.

Do not mix both strategies across different features.

---

# Versioning

Breaking changes to a DTO require:

1. A new version of the DTO (`StudentDTOv2`) if both must coexist temporarily, or
2. Coordinated update of backend and all consumers in the same change.

Never silently change a DTO shape that other consumers depend on without checking usages across `apps/`.

---

# Pagination & Common Shapes

Use one shared shape for all paginated responses.

```ts
type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
```

Never invent a per-feature pagination shape.

---

# Anti-Patterns

Forbidden:

- duplicated DTOs representing the same concept (see Anti-Patterns.md AP-005)
- UI consuming raw DTOs instead of mapped domain types
- hand-written types that drift from the actual backend response
- per-feature pagination or error shapes
- silently breaking a shared contract

---

# Checklist

Before merging a contract change ask:

- Does this DTO already exist in a similar form?
- Is the mapping DTO → domain type done only in the Repository?
- Are all consumers of this contract updated?
- Does this follow the chosen source-of-truth strategy?
- Is validation (Zod) consistent with the DTO shape?

If any answer is "no", revise before merging.
