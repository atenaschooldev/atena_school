# Auth.md

# Authentication & Authorization Guide

Purpose: define how identity, sessions and permissions are handled across Web and Mobile.

---

# Goals

- one authentication flow shared across CRM and Mobile
- stateless, backend-independent session handling
- clear separation between authentication and authorization
- no security logic duplicated across apps

---

# Ownership

Authentication lives in the `auth` feature.

```
features/auth/

├── api/
├── ui/
│   ├── pages/
│   └── forms/
├── validation/
├── types/
├── constants/
└── index.ts
```

No other feature may implement its own login, token refresh, or session logic.

---

# Session Strategy

Session state is server state.

- Store the session in TanStack Query, not Zustand.
- Only the minimal derived flags (`isAuthenticated`, `role`) may live in Zustand.
- Never duplicate the full user object in Zustand.

---

# AUTH-001

Authentication MUST go through Repository → DataSource, same as any other backend access.

Forbidden:

```
UI → Supabase Auth client directly
UI → fetch("/login")
```

Allowed:

```
UI → useLogin() → AuthRepository → AuthDataSource → Backend
```

---

# AUTH-002

Tokens (access / refresh) MUST NOT be stored in component state or Zustand.

Use secure storage:

- Web: httpOnly cookies (preferred) or memory + refresh on reload
- Mobile: Expo SecureStore

Never store tokens in localStorage or AsyncStorage in plain form.

---

# AUTH-003

Token refresh is handled once, centrally, inside the DataSource layer.

UI and Repository must never manually manage refresh logic.

---

# AUTH-004

Authorization (permissions/roles) is separate from authentication.

- Authentication answers: "who is this user?"
- Authorization answers: "what can this user do?"

Do not conflate the two inside a single check.

---

# Roles & Permissions

Define roles centrally.

```
packages/contracts/

    UserRole.ts
    Permission.ts
```

Example:

```
UserRole: "admin" | "staff" | "student" | "guest"
```

Never hardcode role strings inside components. Reference the shared enum.

---

# Route Protection

Route guards live in the router layer (see Routing.md), not inside pages or components.

```
Public routes  → login, register, forgot-password
Private routes → everything behind a guard
```

Guards check `isAuthenticated` / role flags only. They MUST NOT perform business logic.

---

# Permission Checks in UI

Allowed:

```tsx
{hasPermission("students:edit") && <EditButton />}
```

Forbidden:

```tsx
{user.role === "admin" || user.role === "staff" && ... } // scattered logic
```

Centralize permission checks in one utility (`can(permission)`), never re-implement the check per component.

---

# Forms

Login, register, and password-reset forms follow the same rules as any other form (Naming.md, Feature-Template.md):

- React Hook Form
- Zod validation
- No business logic inside the form component

---

# Error Handling

Auth errors follow Error-Handling.md.

Specific cases:

- invalid credentials → user-facing message, no stack trace
- expired session → silent refresh attempt, then redirect to login
- forbidden action → generic "not authorized" message, never expose why

---

# Anti-Patterns

Forbidden:

- calling Supabase Auth (or any provider) directly from UI
- storing raw JWTs in Zustand or component state
- duplicating role-check logic across features
- mixing authentication and authorization in one function
- feature-specific auth reimplementation

---

# Checklist

Before merging anything touching auth ask:

- Does this go through AuthRepository?
- Is the token stored securely, not in app state?
- Is role/permission logic centralized?
- Does UI avoid direct provider access?
- Are errors generic and non-leaking?

If any answer is "no", revise before merging.
