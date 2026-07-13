# Модуль Аутентификации и Пользователей (`auth`)

Этот модуль отвечает за аутентификацию пользователей, ведение их учетных записей в базе данных и управление ролевым доступом (RBAC).

---

## Архитектура и Структура файлов

```
auth/
├── domain/
│   ├── user.entity.ts                # Доменная сущность UserEntity
│   └── users.repository.interface.ts # Абстрактный репозиторий UsersRepository
├── dto/
│   └── login.dto.ts                  # Спецификация входных данных для логина
├── impl/
│   └── prisma-users.repository.ts    # Реализация репозитория на Prisma
├── auth.controller.ts                # Обработка маршрутов API
├── auth.service.ts                   # Логика генерации и валидации сессий
└── auth.module.ts                    # Описание зависимостей модуля
```

---

## 1. Доменный слой (`domain`)

* **`UserEntity`** ([user.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/auth/domain/user.entity.ts))
  Чистая модель пользователя в системе. Содержит поля:
  * `id`: уникальный идентификатор (UUID).
  * `email`: электронная почта.
  * `firstName`: имя.
  * `lastName`: фамилия.
  * `role`: роль (`admin`, `teacher`, `student`, `parent`).
  * `isActive`: флаг активности учетной записи.
  * `createdAt`: дата регистрации.

* **`UsersRepository`** ([users.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/auth/domain/users.repository.interface.ts))
  Абстрактный класс репозитория. Предоставляет следующие методы:
  * `findMany()` — получить всех активных пользователей.
  * `findOne(id: string)` — найти пользователя по ID.
  * `findByEmail(email: string)` — найти пользователя по электронной почте.
  * `create(data)` — создать новую запись пользователя.
  * `update(id, data)` — обновить информацию о пользователе.
  * `delete(id)` — мягкое удаление (установка `isActive = false`).

---

## 2. Реализация репозитория (`impl`)

* **`PrismaUsersRepository`** ([prisma-users.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/auth/impl/prisma-users.repository.ts))
  Реализует интерфейс `UsersRepository` через вызовы к таблице `users` в СУБД с помощью `PrismaService`.

---

## 3. Сервисный слой (`auth.service.ts`)

* **`AuthService`** ([auth.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/auth/auth.service.ts))
  * Выполняет аутентификацию пользователя.
  * Выдает JWT-токен при вводе правильных учетных данных (в режиме тестирования и для демонстрации авторизация имитируется).
  * Синхронизирует сессию пользователя с базой данных (добавляет или обновляет учетную запись пользователя при первой авторизации).

---

## 4. Контроллер (`auth.controller.ts`)

Определяет эндпоинты API:

* **`POST /auth/login`**:
  Принимает email и пароль ([LoginDto](file:///Users/krimson/PROJECTS/nest_backend/src/features/auth/dto/login.dto.ts)) и возвращает JWT токен вместе с данными профиля.
* **`GET /auth/me`**:
  Возвращает профиль текущего авторизованного пользователя на основе токена в заголовке `Authorization`. Защищен `AuthGuard`.
