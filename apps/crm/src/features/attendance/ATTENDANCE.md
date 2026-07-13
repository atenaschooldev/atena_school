# Модуль Посещаемости (`attendance`)

Этот модуль реализует электронный журнал присутствия студентов на занятиях, позволяя отмечать статусы и рассчитывать средний процент посещаемости групп.

---

## Архитектура и Структура файлов

```
attendance/
├── components/
│   ├── stat-card.tsx        # Чистый UI-компонент карточки метрики (StatCard)
│   ├── toggle-btn.tsx       # Чистый UI-компонент переключателя статуса (ToggleBtn)
│   └── presenze-view.tsx    # Главная страница (разметка, выбор урока)
├── hooks/
│   └── use-attendance.ts    # Кастомный хук логики посещаемости (useAttendance)
├── index.ts                 # Точка экспорта Public API фичи
└── types.ts                 # Описание типов посещаемости
```

---

## 1. Типы данных (`types.ts`)

- **`Attendance`** ([types.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/attendance/types.ts))
  - `id`: Уникальный идентификатор записи посещаемости.
  - `studentId`: Ссылка на студента.
  - `lessonId`: Ссылка на конкретный урок в расписании.
  - `stato`: Статус присутствия (`presente` — присутствовал, `assente` — отсутствовал, `ritardo` — опоздал).
  - `note`: Текстовое примечание (например, причина пропуска).

---

## 2. Логика и Состояние (`hooks/use-attendance.ts`)

- **`useAttendance`** ([use-attendance.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/attendance/hooks/use-attendance.ts))
  Кастомный хук для управления состоянием посещаемости:
  - Фильтрация студентов по выбранному уроку.
  - Расчет KPI посещаемости за занятие (процент посещения, число присутствующих/опоздавших/отсутствующих).
  - Управление статусом каждого студента с автоматическим сбросом при смене урока для предотвращения наложения данных.

---

## 3. Компоненты Отображения (UI)

- **`PresenzeView`** ([presenze-view.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/attendance/components/presenze-view.tsx))
  Главный контейнер журнала присутствия студентов на уроках.
- **`StatCard`** ([stat-card.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/attendance/components/stat-card.tsx))
  Чистый презентационный UI-компонент карточки со статистикой успеваемости или присутствия.
- **`ToggleBtn`** ([toggle-btn.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/attendance/components/toggle-btn.tsx))
  Чистый презентационный UI-компонент кнопки выбора статуса посещаемости.
