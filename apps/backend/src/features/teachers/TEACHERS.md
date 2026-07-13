# Модуль Преподавателей (`teachers`)

Этот модуль управляет данными преподавательского состава, их специализацией (предметы), опытом работы и статусами.

---

## Архитектура и Структура файлов

```
teachers/
├── domain/
│   ├── teacher.entity.ts                # Доменная сущность TeacherEntity
│   └── teachers.repository.interface.ts # Интерфейс репозитория TeachersRepository
├── impl/
│   └── prisma-teachers.repository.ts    # Реализация репозитория на Prisma
├── teachers.controller.ts                # Маршруты управления преподавателями
├── teachers.service.ts                   # Бизнес-логика преподавателей
└── teachers.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`TeacherEntity`** ([teacher.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/teachers/domain/teacher.entity.ts))
  Доменная модель преподавателя. Поля:
  * `teacherId`: Ссылка на ID учетной записи пользователя (UUID, отношение 1:1).
  * `subject`: Основная дисциплина/предмет преподавания (строка).
  * `experience`: Опыт работы одной строкой (например, "3 года").
  * `status`: Статус активности преподавателя (`active`, `inactive`).
  * `hireDate`: Дата принятия на работу.
  * `email`, `firstName`, `lastName` (опциональные поля, подгружаемые из связанной сущности пользователя).

* **`TeachersRepository`** ([teachers.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/teachers/domain/teachers.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findMany()` — получить список всех преподавателей с подтянутыми учетными записями.
  * `findOne(id)` — найти преподавателя по ID.
  * `create(data)` — создать запись преподавателя.
  * `update(id, data)` — обновить параметры преподавания/активности.
  * `delete(id)` — деактивировать преподавателя (мягкое удаление пользователя).

---

## 2. Реализация репозитория (`impl`)

* **`PrismaTeachersRepository`** ([prisma-teachers.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/teachers/impl/prisma-teachers.repository.ts))
  Конкретная реализация на Prisma. Использует `include: { user: true }` для слияния данных таблиц `teachers` и `users` в единую доменную модель `TeacherEntity`.

---

## 3. Сервисный слой (`teachers.service.ts`)

* **`TeachersService`** ([teachers.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/teachers/teachers.service.ts))
  * При создании преподавателя регистрирует его пользователя через `UsersRepository` с ролью `teacher`, затем создает запись профиля в `TeachersRepository`.
  * Возвращает данные с объединением имен в `full_name`.

---

## 4. Контроллер (`teachers.controller.ts`)

Определяет эндпоинты API:

* **`GET /teachers`** — получить список преподавателей (доступ: `admin`, `teacher`, `student`, `parent`).
* **`GET /teachers/:id`** — получить детальную информацию о преподавателе.
* **`POST /teachers`** — нанять нового преподавателя (доступ: только `admin`).
* **`PUT /teachers/:id`** — обновить карточку преподавателя (доступ: только `admin`).
* **`DELETE /teachers/:id`** — удалить (деактивировать) преподавателя (доступ: только `admin`).
