# Модуль Журнала активности (`activity-log`)

Этот модуль собирает и выводит системные логи действий пользователей, помогая администраторам отслеживать изменения и проводить аудит безопасности.

---

## Архитектура и Структура файлов

```
activity-log/
├── components/
│   ├── activity-log-placeholder.tsx # Чистый UI-компонент заглушки (ActivityLogPlaceholder)
│   └── registro-view.tsx            # Главная страница (разметка, интеграция хука)
├── hooks/
│   └── use-activity-log.ts          # Кастомный хук логики журнала (useActivityLog)
└── index.ts                         # Точка экспорта Public API фичи
```

---

## 1. Логика и Состояние (`hooks/use-activity-log.ts`)

- **`useActivityLog`** ([use-activity-log.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/activity-log/hooks/use-activity-log.ts))
  Кастомный хук для управления состоянием журнала активности. На данный момент возвращает базовые параметры.

---

## 2. Компоненты Отображения (UI)

- **`RegistroView`** ([registro-view.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/activity-log/components/registro-view.tsx))
  Главный контейнер страницы журнала системной активности.
- **`ActivityLogPlaceholder`** ([activity-log-placeholder.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/activity-log/components/activity-log-placeholder.tsx))
  Чистый презентационный компонент-заглушка для будущего расширения истории изменений в Atena SIS.

