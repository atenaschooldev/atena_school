# Atena Scuola - School Management Platform (CRM)

A modern, responsive, and beautiful school management application built with **React**, **TypeScript**, and **Tailwind CSS**. It helps school administrators, teachers, and students manage courses, schedules, grades, attendance, and documents seamlessly.

## Key Features

- **Dashboard**: High-level school KPIs, attendance trend charts, and today's schedule.
- **Students Management**: Tabular and card views, filter by level and status, and edit student profiles.
- **Teachers Management**: Workload hours track, experience years, hire dates, and contacts.
- **Courses Management**: CEFR levels (A1-C2), cap capacity limits, pricing, and student lists.
- **Interactive Calendar (Orari)**: Drag & drop resizable lesson planner, schedule conflict visual cues, and room assignments.
- **Grades (Valutazioni)**: Interactive grade grids for speaking, listening, reading, and writing.
- **Attendance (Presenze)**: Register presence, absence, and late logs per lesson.
- **Digital Documents**: PDF contract generation, digital signature canvas, and previewing.

## Architecture

This project is organized using a **feature-first** layout:

- `src/features/*`: Grouped by domain boundaries (e.g., `students`, `teachers`, `schedule`, etc.). Each folder contains its own types, API layers, components, and views.
- `src/components/*`: Reusable global UI elements (tables, sidebars, headers).
- `src/stores/*`: Global state management with Zustand.
- `src/lib/utils.ts`: Safely handles class names and date formatting.

---

## Навигация по документации

Ниже представлены ссылки на детальные руководства для каждого слоя и модуля проекта:

### 📂 Архитектурные разделы

- **[Глобальная архитектура (ARCHITECTURE.md)](src/ARCHITECTURE.md)** — Описание стека, файловой структуры и дизайн-системы.

### 📂 Бизнес-модули (Фичи)

- **[Студенты и профили (STUDENTS.md)](src/features/students/STUDENTS.md)**
- **[Преподаватели (TEACHERS.md)](src/features/teachers/TEACHERS.md)**
- **[Учебные программы (COURSES.md)](src/features/courses/COURSES.md)**
- **[Планирование и уроки (SCHEDULE.md)](src/features/schedule/SCHEDULE.md)**
- **[Журнал посещаемости (ATTENDANCE.md)](src/features/attendance/ATTENDANCE.md)**
- **[Успеваемость и навыки (GRADES.md)](src/features/grades/GRADES.md)**
- **[Договоры и подписи (DOCUMENTS.md)](src/features/documents/DOCUMENTS.md)**
- **[Финансы и оплаты (PAYMENTS.md)](src/features/payments/PAYMENTS.md)**
- **[Журнал действий (ACTIVITY_LOG.md)](src/features/activity-log/ACTIVITY_LOG.md)**
- **[Панель аналитики (DASHBOARD.md)](src/features/dashboard/DASHBOARD.md)**

## Run Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
