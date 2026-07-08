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

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
