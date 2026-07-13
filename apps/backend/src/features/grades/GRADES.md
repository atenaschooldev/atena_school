# Модуль Успеваемости и Оценок (`grades`)

Этот модуль управляет оценками студентов, успеваемостью по курсам и периодическими оценками по языковым навыкам (speaking, listening, reading, writing).

---

## Архитектура и Структура файлов

```
grades/
├── domain/
│   ├── grade.entity.ts                # Сущности GradeEntity и SkillGradeEntity
│   └── grades.repository.interface.ts # Интерфейс репозитория GradesRepository
├── impl/
│   └── prisma-grades.repository.ts    # Реализация репозитория на Prisma
├── grades.controller.ts                # Маршруты работы с оценками
├── grades.service.ts                   # Бизнес-логика успеваемости
└── grades.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`GradeEntity`** ([grade.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/grades/domain/grade.entity.ts))
  Модель обычной оценки за урок. Поля: `id`, `studentId`, `courseId`, `teacherId`, `score` (числовой балл), `date`, `note` (комментарий).

* **`SkillGradeEntity`** ([grade.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/grades/domain/grade.entity.ts))
  Модель периодической оценки успеваемости по направлениям. Поля: `id`, `studentId`, `courseId`, `teacherId`, `period` (например, "Midterm"), `speaking`, `listening`, `reading`, `writing`, `overallComment`, `date`.

* **`GradesRepository`** ([grades.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/grades/domain/grades.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findStudentGrades(studentId)` — получить список обычных оценок студента.
  * `createGrade(data)` — выставить оценку за урок.
  * `findStudentSkillGrades(studentId)` — получить историю оценок навыков студента.
  * `createSkillGrade(data)` — создать комплексную оценку навыков.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaGradesRepository`** ([prisma-grades.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/grades/impl/prisma-grades.repository.ts))
  Специализированная реализация. База данных использует единую таблицу `grades`.
  Для хранения оценок по навыкам (speaking, listening, reading, writing, period) репозиторий преобразует эти данные в формат JSON и записывает строкой в поле `note`. При выборке репозиторий автоматически анализирует поле `note`, парсит JSON и возвращает сущности `SkillGradeEntity`, а обычные оценки отдает как `GradeEntity`. Средний балл по навыкам автоматически рассчитывается и дублируется в поле `score` для интеграции с общими отчетами.

---

## 3. Сервисный слой (`grades.service.ts`)

* **`GradesService`** ([grades.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/grades/grades.service.ts))
  * Предоставляет методы выставления и получения оценок.
  * Содержит функцию `calculateLetter(score)`, преобразующую числовые оценки (например, `8.5`) в буквенную шкалу (A, B, C, D, E, F) для отображения в интерфейсе.

---

## 4. Контроллер (`grades.controller.ts`)

Определяет эндпоинты API:

* **`GET /grades/student/:studentId`** — получить все обычные оценки студента.
* **`POST /grades`** — выставить оценку за урок (доступ: `admin`, `teacher`).
* **`GET /grades/student/:studentId/skills`** — получить оценки по навыкам.
* **`POST /grades/skills`** — отправить комплексную оценку навыков за период (доступ: `admin`, `teacher`).
