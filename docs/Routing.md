# Routing.md

# Routing Guide

Purpose: define a consistent navigation architecture for Web and Mobile.

---

# Goals

- identical business routes
- predictable navigation
- platform-specific implementation
- no business logic in routing
- simple URL structure

---

# Router Choice

Landing

- Next.js App Router

CRM

- React Router

Mobile

- Expo Router

The routing library may differ.

The route structure should not.

---

# Route Naming

Prefer nouns.

Good:

```
/students
/students/:studentId

/courses
/courses/:courseId

/teachers

/payments

/profile

/settings
```

Avoid:

```
/get-students
/showStudent
/manageEverything
```

Routes represent resources, not actions.

---

# Route Structure

Flat when possible.

Nest only when it reflects the business domain.

Good:

```
/students
/students/:studentId
/students/:studentId/payments
```

Avoid unnecessary nesting.

---

# Feature Ownership

Each feature owns its route-level pages.

Example:

```
students/

    ui/
        pages/

            StudentsPage
            StudentDetailsPage
```

Pages belong to the feature.

Routers reference pages.

---

# Responsibilities

Router

Responsible for:

- navigation
- layouts
- guards
- route registration

Router is NOT responsible for:

- fetching data
- business logic
- validation

---

# Pages

A page represents one route.

Responsibilities:

- compose the screen
- connect feature components
- call feature hooks

Do not put reusable UI directly into pages.

---

# Components

Reusable inside the feature.

Pages should remain small.

---

# Layouts

Use layouts for:

- navigation shell
- sidebar
- header
- footer
- breadcrumbs

Do not mix layouts with business logic.

---

# Authentication

Protect routes through routing.

Examples:

Public

- login
- register
- forgot-password

Private

- dashboard
- students
- payments

Guests must not access private routes.

Authenticated users should not access login unnecessarily.

---

# Parameters

Use descriptive names.

Good

```
:studentId

:courseId

:teacherId
```

Avoid

```
:id

:data

:item
```

---

# Query Parameters

Use query parameters only for UI state.

Examples:

```
?page=2

?search=john

?sort=name

?tab=payments
```

Do not store business identifiers in query strings if they belong in the path.

---

# Navigation

Navigation should use route helpers.

Avoid hardcoded paths across the application.

Centralize route definitions.

---

# Deep Links

Mobile routes should mirror web routes whenever possible.

Example

Web

```
/students/123
```

Mobile

```
myapp://students/123
```

Business semantics stay identical.

---

# Error Routes

Define:

- 404
- unauthorized
- forbidden

Provide meaningful user feedback.

---

# Future Growth

Adding a new feature should require:

- creating the feature
- adding route registration
- nothing else

Existing routing should remain unchanged.

---

# Checklist

Before adding a route verify:

- belongs to an existing feature
- follows naming rules
- page has one responsibility
- no business logic inside router
- authentication considered
- layout selected correctly
