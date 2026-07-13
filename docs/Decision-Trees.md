# Decision-Trees.md

# Architecture Decision Trees

Purpose: provide a fast way to choose the correct architectural solution.

---

# 1. New Business Requirement

```
New requirement?
        │
        ▼
Is it a new business capability?
        │
   Yes ─────► Create a new Feature
        │
    No
        │
        ▼
Extend the existing Feature
```

---

# 2. Where Should State Live?

```
Need state?
      │
      ▼
Comes from server?
      │
 Yes ─────────► TanStack Query
      │
 No
      │
      ▼
Shared across screens?
      │
 Yes ─────────► Zustand
      │
 No
      │
      ▼
Only for one component?
      │
 Yes ─────────► useState
```

Never duplicate the same data in multiple stores.

---

# 3. Need API Access?

```
Need backend?
      │
      ▼
Call Repository
      │
      ▼
Repository calls DataSource
      │
      ▼
DataSource talks to Backend
```

Never skip Repository.

Never call Supabase, fetch or axios from UI.

---

# 4. Shared or Feature?

```
Used by one feature?
      │
 Yes ─────────► Keep inside feature
      │
 No
      │
      ▼
Business independent?
      │
 Yes ─────────► Move to packages/
      │
 No
      │
      ▼
Keep inside feature
```

Do not move code to shared "just in case".

---

# 5. New UI

```
Is it a route?
      │
 Yes ─────────► ui/pages
      │
 No
      │
      ▼
Reusable inside feature?
      │
 Yes ─────────► ui/components
      │
 No
      │
      ▼
Is it a form?
      │
 Yes ─────────► ui/forms
```

---

# 6. Validation

```
Need validation?
      │
      ▼
Create Zod schema
      │
      ▼
Reuse schema everywhere
```

Never duplicate validation rules.

---

# 7. New Package?

```
Used by multiple features?
      │
 No ─────────► Stay in feature
      │
 Yes
      │
      ▼
Domain independent?
      │
 Yes ─────────► packages/
      │
 No ─────────► Keep in feature
```

---

# 8. New Utility

```
Feature specific?
      │
 Yes ─────────► feature/utils
      │
 No
      │
      ▼
Reusable project-wide?
      │
 Yes ─────────► packages/utils
```

Avoid generic helper files.

---

# 9. Backend Migration

```
Need to replace backend?
      │
      ▼
Replace DataSource
      │
      ▼
Repository unchanged
      │
▼
Hooks unchanged
      │
▼
UI unchanged
```

If UI changes, architecture has been violated.

---

# 10. Performance

```
Performance issue?
      │
      ▼
Measure first
      │
      ▼
Rendering?
      │
 Yes ─► simplify component
      │
 No
      │
      ▼
Network?
      │
 Yes ─► optimize query/cache
      │
 No
      │
      ▼
Large list?
      │
 Yes ─► virtualize
```

Never optimize blindly.

---

# 11. Before Creating Anything

Ask:

- Does this already exist?
- Can I reuse it?
- Is it a new business capability?
- Does it belong to this feature?
- Will this introduce duplication?
- Does this violate architecture?

If any answer is uncertain, stop and review the architecture first.
