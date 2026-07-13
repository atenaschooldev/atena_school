# Модуль Студентов (`students`)

Этот модуль управляет данными студентов, их профилями обучения, языковыми уровнями, договорами и статусами активности.

---

## Архитектура и Структура файлов

```
students/
├── domain/
│   ├── student.entity.ts                # Доменная сущность StudentEntity
│   └── students.repository.interface.ts # Интерфейс репозитория StudentsRepository
├── impl/
│   └── prisma-students.repository.ts    # Реализация репозитория на Prisma
├── students.controller.ts                # Маршруты управления студентами
├── students.service.ts                   # Бизнес-логика студентов
└── students.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`StudentEntity`** ([student.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/students/domain/student.entity.ts))
  Доменная модель студента. Содержит поля:
  * `studentId`: Ссылка на ID учетной записи пользователя (UUID, отношение 1:1).
  * `languageLevel`: Текущий языковой уровень студента (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`).
  * `status`: Статус обучения (`active`, `paused`, `dropped`, `graduated`).
  * `registrationDate`: Дата начала обучения.
  * `contractId`: Ссылка на привязанный договор (документ).
  * `email`, `firstName`, `lastName` (опциональные поля, склеиваемые из таблицы пользователей).

* **`StudentsRepository`** ([students.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/students/domain/students.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findMany()` — список всех студентов (включая имя, фамилию и email из таблицы `users`).
  * `findOne(id)` — детальная информация об одном студенте по его ID.
  * `create(data)` — создание записи студента.
  * `update(id, data)` — обновление параметров студента.
  * `delete(id)` — мягкое удаление профиля (путем перевода `isActive` пользователя в `false`).

---

## 2. Реализация репозитория (`impl`)

* **`PrismaStudentsRepository`** ([prisma-students.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/students/impl/prisma-students.repository.ts))
  Реализация репозитория на Prisma. Выполняет автоматическое объединение (`include: { user: true }`) для склеивания данных профиля студента с его учетной записью пользователя при выборках.

---

## 3. Сервисный слой (`students.service.ts`)

* **`StudentsService`** ([students.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/students/students.service.ts))
  * При создании студента сначала вызывает `UsersRepository` для создания базового аккаунта пользователя с ролью `student`, а затем `StudentsRepository` для создания профиля обучения.
  * Форматирует ответы в соответствии с контрактом клиента (склеивает имя и фамилию в `full_name`).

---

## 4. Контроллер (`students.controller.ts`)

Определяет эндпоинты API:

* **`GET /students`** — получить список всех студентов (доступ: `admin`, `teacher`).
* **`GET /students/:id`** — получить карточку студента.
* **`POST /students`** — создать нового студента (доступ: только `admin`).
* **`PUT /students/:id`** — обновить профиль студента (доступ: только `admin`).
* **`DELETE /students/:id`** — удалить студента (доступ: только `admin`).
