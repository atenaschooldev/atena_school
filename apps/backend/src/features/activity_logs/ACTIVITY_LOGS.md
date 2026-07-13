# Модуль Аудита и Логов Действий (`activity_logs`)

Этот модуль отвечает за фиксацию и отображение логов действий администраторов (аудит изменений) в CRM.

---

## Архитектура и Структура файлов

```
activity_logs/
├── domain/
│   ├── activity-log.entity.ts                # Доменная сущность ActivityLogEntity
│   └── activity-logs.repository.interface.ts # Интерфейс репозитория ActivityLogsRepository
├── impl/
│   └── prisma-activity-logs.repository.ts    # Реализация репозитория на Prisma
├── activity_logs.controller.ts                # Маршруты просмотра логов
├── activity_logs.service.ts                   # Бизнес-логика логов
└── activity_logs.module.ts                    # Зависимости модуля (глобальный)
```

---

## 1. Доменный слой (`domain`)

* **`ActivityLogEntity`** ([activity-log.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/activity_logs/domain/activity-log.entity.ts))
  Доменная модель записи аудита. Поля:
  * `id`: Уникальный идентификатор записи (UUID).
  * `createdAt`: Дата и время события.
  * `operatorId`: ID администратора (пользователя), совершившего действие (может быть `null` для системных событий).
  * `operatorName`: Имя оператора на момент записи лога.
  * `action`: Название совершенного действия (`create`, `update`, `delete`, `send`, `generate` и т.д.).
  * `module`: Модуль, в котором было совершено действие (например, `courses`, `students`).
  * `targetId`: ID измененного объекта (например, ID удаленного курса).
  * `details`: JSON-объект с деталями изменения (тело запроса или ответа).
  * `status`: Статус операции (`success` / `failure`).

* **`ActivityLogsRepository`** ([activity-logs.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/activity_logs/domain/activity-logs.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findMany()` — получить все логи, отсортированные по дате создания (от новых к старым).
  * `create(data)` — сохранить новую запись лога аудита.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaActivityLogsRepository`** ([prisma-activity-logs.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/activity_logs/impl/prisma-activity-logs.repository.ts))
  Провайдер данных на Prisma. Записывает и извлекает информацию из таблицы `activity_logs`.

---

## 3. Сервисный слой (`activity_logs.service.ts`)

* **`ActivityLogsService`** ([activity-logs.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/activity_logs/activity_logs.service.ts))
  Предоставляет методы чтения логов, форматируя их под структуру, ожидаемую клиентом во Flutter.

---

## 4. Контроллер (`activity_logs.controller.ts`)

Определяет эндпоинты API:

* **`GET /activity-logs`** — получить список всех событий аудита. Доступ ограничен администраторами (`@Roles('admin')`).

---

## Глобальный статус модуля

Модуль `ActivityLogsModule` помечен декоратором `@Global()`. Это необходимо для того, чтобы `ActivityLogsRepository` мог автоматически инжектироваться в `AuditInterceptor` (находящийся в `src/core/interceptors/`), без необходимости прописывать импорт модуля в каждую отдельную фичу проекта.
