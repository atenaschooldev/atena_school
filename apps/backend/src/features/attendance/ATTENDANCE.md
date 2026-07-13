# Модуль Посещаемости (`attendance`)

Этот модуль отвечает за фиксацию присутствия студентов на запланированных занятиях (уроках), ведение истории пропусков и комментариев к посещениям.

---

## Архитектура и Структура файлов

```
attendance/
├── domain/
│   ├── attendance.entity.ts                # Доменная сущность AttendanceEntity
│   └── attendance.repository.interface.ts # Интерфейс репозитория AttendanceRepository
├── impl/
│   └── prisma-attendance.repository.ts    # Реализация репозитория на Prisma
├── attendance.controller.ts                # Маршруты управления посещаемостью
├── attendance.service.ts                   # Бизнес-логика посещаемости
└── attendance.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`AttendanceEntity`** ([attendance.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/attendance/domain/attendance.entity.ts))
  Доменная модель отметки посещаемости. Поля:
  * `id`: Уникальный идентификатор отметки (UUID).
  * `studentId`: Ссылка на студента (UUID).
  * `teacherId`: Ссылка на преподавателя, выставившего статус (UUID).
  * `scheduleId`: Ссылка на конкретное занятие из расписания (UUID, "lessonId").
  * `status`: Статус присутствия (`present` — присутствовал, `absent` — отсутствовал, `late` — опоздал, `excused` — уважительная причина).
  * `note`: Текстовый комментарий (например, причина пропуска).
  * `date`: Дата проведения урока.
  * `studentName`, `teacherName` (опциональные поля, подгружаемые из связанных таблиц для отображения).

* **`AttendanceRepository`** ([attendance.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/attendance/domain/attendance.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findBySchedule(scheduleId)` — получить журнал посещаемости для конкретного урока (возвращает список отметок всех студентов).
  * `saveMany(scheduleId, records, teacherId)` — массово обновить или вставить отметки посещаемости для списка студентов.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaAttendanceRepository`** ([prisma-attendance.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/attendance/impl/prisma-attendance.repository.ts))
  Конкретная реализация на Prisma. Использует транзакцию БД `this.prisma.$transaction` для безопасной перезаписи отметок: сначала удаляются устаревшие записи по списку студентов для этого занятия, затем создаются новые, гарантируя атомарность операции.

---

## 3. Сервисный слой (`attendance.service.ts`)

* **`AttendanceService`** ([attendance.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/attendance/attendance.service.ts))
  * Позволяет получить журнал урока.
  * Позволяет выставить посещаемость списку студентов, приводя свойства к интерфейсу репозитория.
  * Форматирует ответы в соответствии со структурой, требуемой во Flutter-клиенте.

---

## 4. Контроллер (`attendance.controller.ts`)

Определяет эндпоинты API:

* **`GET /lessons/:lessonId/attendance`** — получить журнал посещаемости конкретного урока (доступ: `admin`, `teacher`, `student`, `parent`).
* **`POST /lessons/:lessonId/attendance`** — массово выставить посещаемость на уроке (доступ: `admin`, `teacher`).
