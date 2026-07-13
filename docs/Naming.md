# Naming.md

# Naming Convention

Purpose: establish one consistent naming style across the project.

---

# General Principles

Rules:

- Prefer descriptive names.
- Be consistent.
- Avoid abbreviations.
- One concept → one name.

Good:

- Student
- Course
- Payment

Bad:

- Std
- Crs
- DataObject

---

# Language

All code MUST be written in English.

---

# Folders

Use:

- lowercase
- kebab-case

Examples:

```
student-profile
course-payments
auth
```

---

# Files

React components:

```
StudentCard.tsx
StudentForm.tsx
StudentPage.tsx
```

Hooks:

```
useStudents.ts
useCreateStudent.ts
```

Repositories:

```
StudentRepository.ts
```

Data Sources:

```
StudentDataSource.ts
```

Validation:

```
StudentSchema.ts
```

Types:

```
Student.ts
StudentDTO.ts
```

---

# Components

Use PascalCase.

Examples:

```
StudentCard
StudentTable
StudentDetailsPage
```

Avoid prefixes like:

```
AppStudentCard
MyStudentCard
```

unless they carry real meaning.

---

# Hooks

Always start with "use".

Examples:

```
useStudents
useStudent
useCreateStudent
useDeleteStudent
```

---

# Repository

Pattern:

```
<Entity>Repository
```

Examples:

```
StudentRepository
CourseRepository
```

---

# DataSource

Pattern:

```
<Entity>DataSource
```

Concrete implementations:

```
SupabaseStudentDataSource
NestStudentDataSource
MockStudentDataSource
```

---

# Query Hooks

Read:

```
useStudents
useStudent
```

Write:

```
useCreateStudent
useUpdateStudent
useDeleteStudent
```

---

# Types

Entities:

```
Student
Teacher
Course
```

DTO:

```
StudentDTO
CreateStudentDTO
UpdateStudentDTO
```

Props:

```
StudentCardProps
```

---

# Validation

Pattern:

```
StudentSchema
CreateStudentSchema
```

Never duplicate schemas.

---

# Constants

Pattern:

```
DEFAULT_PAGE_SIZE
MAX_UPLOAD_SIZE
```

Use UPPER_SNAKE_CASE.

---

# Enums

Prefer meaningful names.

```
StudentStatus
PaymentMethod
```

Enum values:

```
ACTIVE
INACTIVE
PENDING
```

---

# Boolean Variables

Use readable prefixes:

```
isLoading
isVisible
isAdmin
hasPermission
canEdit
shouldRefetch
```

Avoid:

```
flag
value
status2
```

---

# Event Handlers

Pattern:

```
handleSubmit
handleDelete
handleClose
```

Callbacks passed as props:

```
onSubmit
onDelete
onClose
```

---

# Async Functions

Use verbs.

Examples:

```
fetchStudents
createStudent
updateStudent
deleteStudent
```

Avoid generic names:

```
process
execute
run
```

---

# Query Keys

Centralize query keys.

Examples:

```
students
student
courses
teachers
```

Keep naming singular/plural consistent.

---

# Imports

Prefer aliases.

Good:

```
@/features/students
@/packages/ui
```

Avoid deep relative paths.

---

# Forbidden

Do not use:

- tmp
- data2
- helper
- utils2
- newStudentNew
- finalFinal

Names must communicate intent.
