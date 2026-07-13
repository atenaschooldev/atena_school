# Модуль Курсов (`courses`)

Этот модуль отвечает за администрирование учебных программ (курсов), их классификацию по категориям, стоимости и назначение ответственных преподавателей.

---

## Архитектура и Структура файлов

```
courses/
├── domain/
│   ├── course.entity.ts                # Доменная сущность CourseEntity
│   └── courses.repository.interface.ts # Интерфейс репозитория CoursesRepository
├── impl/
│   └── prisma-courses.repository.ts    # Реализация репозитория на Prisma
├── courses.controller.ts                # Маршруты управления курсами
├── courses.service.ts                   # Бизнес-логика курсов
└── courses.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`CourseEntity`** ([course.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/courses/domain/course.entity.ts))
  Доменная модель учебного курса. Поля:
  * `id`: Уникальный идентификатор курса (UUID).
  * `name`: Название курса.
  * `category`: Направление/категория (например, "Разработка", "Дизайн", "Языки").
  * `duration`: Продолжительность курса строкой (например, "12 недель").
  * `price`: Стоимость курса (хранится в базе как `Decimal`, в коде конвертируется в `number`).
  * `status`: Статус активности курса (`active`, `draft`, `archived`).
  * `teacherId`: ID преподавателя, назначенного вести курс (может быть `null`).
  * `studentCount`: Количество учащихся на курсе (денормализованный счетчик).
  * `teacherName`: ФИО закрепленного преподавателя (подгружается при объединении таблиц).

* **`CoursesRepository`** ([courses.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/courses/domain/courses.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findMany()` — список всех курсов.
  * `findOne(id)` — детальная информация о курсе по ID.
  * `create(data)` — создание нового курса.
  * `update(id, data)` — редактирование параметров курса.
  * `delete(id)` — перевод курса в статус `archived` (мягкое удаление).

---

## 2. Реализация репозитория (`impl`)

* **`PrismaCoursesRepository`** ([prisma-courses.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/courses/impl/prisma-courses.repository.ts))
  Реализация репозитория на Prisma. Производит автоматическое склеивание (`include: { teacher: { include: { user: true } } }`) для заполнения имени преподавателя `teacherName` в сущности `CourseEntity`. Осуществляет перевод типов `Decimal` (Prisma) в обычные `number` (JS/TS).

---

## 3. Сервисный слой (`courses.service.ts`)

* **`CoursesService`** ([courses.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/courses/courses.service.ts))
  * Посредник между базой данных и клиентом.
  * Фильтрует архивные курсы от показа во фронтенде.
  * Поддерживает совместимость с клиентом во Flutter, маппя поле `name` в `title` на уровне ответов сервиса.

---

## 4. Контроллер (`courses.controller.ts`)

Определяет эндпоинты API:

* **`GET /courses`** — получить список активных курсов (доступ: `admin`, `teacher`, `student`, `parent`).
* **`GET /courses/:id`** — получить карточку курса.
* **`POST /courses`** — создать новый курс (доступ: только `admin`).
* **`PUT /courses/:id`** — обновить параметры курса (доступ: только `admin`).
* **`DELETE /courses/:id`** — архивировать курс (доступ: только `admin`).
