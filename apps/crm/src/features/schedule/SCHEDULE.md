# Модуль Расписания (`schedule`)

Этот модуль управляет сеткой занятий школы, позволяя планировать уроки, контролировать аудитории и визуально отслеживать расписание в календарных режимах (день, неделя, месяц).

---

## Архитектура и Структура файлов

```
schedule/
├── components/
│   ├── calendar-lesson-card.tsx # Чистый UI-компонент карточки урока (CalendarLessonCard)
│   ├── lesson-form.tsx          # Форма создания/редактирования урока (LessonForm)
│   └── orari-view.tsx           # Главная страница календаря (разметка, сетки)
├── hooks/
│   └── use-schedule.ts          # Бизнес-логика, навигация, перетаскивание (useSchedule)
├── index.ts                     # Точка экспорта Public API фичи
└── types.ts                     # Типы данных для занятий
```

---

## 1. Типы данных (`types.ts`)

- **`Lesson`** ([types.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/schedule/types.ts))
  Описывает конкретный урок:
  - `id`: Строковый идентификатор урока.
  - `corsoId`: Ссылка на учебный курс.
  - `insegnanteId`: Преподаватель, ведущий занятие.
  - `giorno`: Индекс дня недели (0 = Понедельник, ..., 5 = Суббота).
  - `oraInizio`, `oraFine`: Время начала и окончания урока (например, "10:30", "12:00").
  - `aula`: Название аудитории (например, "Aula 1", "Online").
  - `meetingUrl`: Ссылка на Google Meet (если урок в онлайн-формате).

---

## 2. Логика и Состояние (`hooks/use-schedule.ts`)

- **`useSchedule`** ([use-schedule.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/schedule/hooks/use-schedule.ts))
  Кастомный хук для управления интерактивной логикой календаря:
  - Дата и навигация по календарю (день, неделя, месяц).
  - Перетаскивание (Drag & Drop) и изменение размеров (Resizing) карточек уроков.
  - Состояние модальных диалогов для создания, редактирования и контекстных меню.

---

## 3. Компоненты Отображения (UI)

- **`OrariView`** ([orari-view.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/schedule/components/orari-view.tsx))
  Декларативный оркестратор страницы календаря. Поддерживает режимы дня, недели и месяца, а также отображение временной шкалы.
- **`CalendarLessonCard`** ([calendar-lesson-card.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/schedule/components/calendar-lesson-card.tsx))
  Чистый презентационный UI-компонент карточки занятия. Принимает координаты позиционирования, состояние поиска, данные и callback-обработчики Drag-and-Drop / Resize как Props.
- **`LessonForm`** ([lesson-form.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/schedule/components/lesson-form.tsx))
  Позволяет быстро добавить урок или отредактировать время/комнату выбранной карточки расписания. Интегрирована автоматическая генерация случайной ссылки Google Meet для онлайн-уроков.
