# Модуль Расписания и Уроков (`schedules`)

Этот модуль управляет планированием учебных занятий, формированием сетки уроков, их типами (online/offline) и связью с преподавателями и курсами.

---

## Архитектура и Структура файлов

```
schedules/
├── domain/
│   ├── schedule.entity.ts                # Доменная сущность ScheduleEntity
│   └── schedules.repository.interface.ts # Интерфейс репозитория SchedulesRepository
├── impl/
│   └── prisma-schedules.repository.ts    # Реализация репозитория на Prisma
├── schedules.controller.ts                # Маршруты управления расписанием
├── schedules.service.ts                   # Бизнес-логика планирования уроков
└── schedules.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`ScheduleEntity`** ([schedule.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/schedules/domain/schedule.entity.ts))
  Доменная модель урока. Поля:
  * `id`: Уникальный идентификатор занятия (UUID).
  * `courseId`: Ссылка на ID курса.
  * `teacherId`: Ссылка на ID преподавателя.
  * `room`: Номер кабинета (опционально, для offline).
  * `status`: Статус урока (`scheduled`, `completed`, `cancelled`).
  * `startDate`: Дата и время начала урока.
  * `endDate`: Дата и время завершения урока.
  * `lessonType`: Формат занятия (`online`, `offline`).
  * `meetingUrl`: Ссылка на встречу Google Meet (для online).
  * `courseName`, `teacherName` (опциональные поля, подгружаемые из связанных таблиц).

* **`SchedulesRepository`** ([schedules.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/schedules/domain/schedules.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findMany(filters)` — получить список уроков (можно отфильтровать по курсу, преподавателю, диапазону дат).
  * `findOne(id)` — получить данные конкретного урока по ID.
  * `create(data)` — запланировать один урок.
  * `createMany(data)` — массово запланировать массив уроков (используется при автогенерации сетки занятий).
  * `update(id, data)` — обновить информацию об уроке.
  * `delete(id)` — удалить урок из расписания.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaSchedulesRepository`** ([prisma-schedules.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/schedules/impl/prisma-schedules.repository.ts))
  Конкретная реализация на Prisma. Использует метод `Promise.all` для кросс-платформенной и типобезопасной реализации `createMany()`, а также производит объединение с таблицами `course` и `teacher` для обогащения сущности названиями и именами.

---

## 3. Сервисный слой (`schedules.service.ts`)

* **`SchedulesService`** ([schedules.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/schedules/schedules.service.ts))
  * Предоставляет методы для получения расписания и создания уроков.
  * Содержит алгоритм **генерации уроков** (`generateLessons`): принимает ID существующего урока-шаблона, период дат (start-end) и автоматически дублирует занятие каждую неделю на указанный день недели и время, записывая созданные уроки в базу данных через метод `createMany()`.
  * Маппит свойства БД в структуру, ожидаемую клиентом во Flutter (разделение на `day_of_week`, `start_time` / `end_time` строками и т.д.).

---

## 4. Контроллер (`schedules.controller.ts`)

Определяет эндпоинты API:

* **`GET /schedules`** — получить список всех уроков (доступ: `admin`, `teacher`, `student`, `parent`).
* **`POST /schedules`** — запланировать новое занятие (доступ: только `admin`).
* **`POST /schedules/:id/generate-lessons`** — сгенерировать расписание на период вперед на основе шаблона занятия (доступ: только `admin`).
