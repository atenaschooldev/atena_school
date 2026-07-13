# Документация инфраструктурного ядра (`src/core`)

Директория `src/core` содержит ключевые инфраструктурные модули приложения: механизмы авторизации (RBAC), глобальную обработку ошибок, интеграцию с СУБД (Prisma, Supabase), аудит действий администратора и декораторы метаданных.

---

## Структура директории

```
src/core/
├── decorators/      # Кастомные декораторы (роли, аудит)
├── filters/         # Глобальные фильтры исключений
├── guards/          # Ограничение доступа (Auth, Roles)
├── interceptors/    # Перехватчики запросов (Аудит логов)
├── prisma/          # Подключение и управление сессиями Prisma
└── supabase/        # Клиент и сервисы Supabase
```

---

## 1. Декораторы (`decorators`)

Используются для декларативного описания метаданных на уровне контроллеров или отдельных методов.

* **`@Roles(...roles: string[])`** ([roles.decorator.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/decorators/roles.decorator.ts))
  Задает список ролей, которым разрешен доступ к эндпоинту.
  *Пример использования:*
  ```typescript
  @Post()
  @Roles('admin', 'teacher')
  async createCourse() { ... }
  ```

* **`@Audit(table: string, action: string)`** ([audit.decorator.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/decorators/audit.decorator.ts))
  Помечает метод для автоматического логирования в журнал действий администратора. Привязывается к определенной таблице (модулю) и действию (`create`, `update`, `delete` и т.д.).
  *Пример использования:*
  ```typescript
  @Delete(':id')
  @Audit('courses', 'delete')
  async deleteCourse() { ... }
  ```

---

## 2. Фильтры исключений (`filters`)

* **`AllExceptionsFilter`** ([all-exceptions.filter.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/filters/all-exceptions.filter.ts))
  Глобальный перехватчик ошибок приложения. 
  * Транслирует любые системные ошибки (включая ошибки Prisma DB и ValidationErrors) в стандартный HTTP-ответ.
  * **Совместимость с FastAPI**: Форматирует JSON-ответ ошибок в формате `{ detail: string, code?: string, type?: string }`, что позволяет фронтенду (Flutter) обрабатывать ошибки без изменения парсеров.
  * Логирует стек ошибок для облегчения отладки.

---

## 3. Охрана доступа (`guards`)

Реализует авторизацию и проверку прав доступа.

* **`AuthGuard`** ([auth.guard.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/guards/auth.guard.ts))
  * Извлекает JWT токен из заголовка `Authorization: Bearer <token>`.
  * Валидирует токен через локальный секрет `SUPABASE_JWT_SECRET` (что исключает сетевые задержки при запросах к Supabase Auth).
  * **Режим разработки (Mock Auth)**: В тестовом режиме при отправке токена, совпадающего с переменной `DEVELOPMENT_TEST_TOKEN`, автоматически авторизует пользователя с правами администратора.

* **`RolesGuard`** ([roles.guard.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/guards/roles.guard.ts))
  * Сравнивает роли текущего авторизованного пользователя с метаданными, установленными через `@Roles()`.
  * Если у пользователя нет ни одной из разрешенных ролей, возвращает `ForbiddenException (403)`.

---

## 4. Перехватчики (`interceptors`)

* **`AuditInterceptor`** ([audit.interceptor.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/interceptors/audit.interceptor.ts))
  * Асинхронно перехватывает успешные ответы эндпоинтов, помеченных декоратором `@Audit()`.
  * Извлекает ID измененных сущностей из тела ответа (проверяет ключи `id`, `course_id`, `student_id` и др.).
  * Автоматически собирает информацию об операторе (ID и имя пользователя из `AuthGuard`).
  * Записывает детальный лог события (включая результат выполнения) в базу данных через глобальный интерфейс `ActivityLogsRepository`.

---

## 5. Prisma ORM (`prisma`)

* **`PrismaService`** ([prisma.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/prisma/prisma.service.ts))
  * Наследует `PrismaClient` и инициализирует подключение к PostgreSQL (база данных Supabase).
  * **Отказоустойчивость**: Попытка подключения завернута в блок `try/catch`. Если база данных недоступна, приложение выведет предупреждение, но продолжит работу (что критически важно для работы локальных скриптов генерации документации/типов или запуска изолированных юнит-тестов).
* **`PrismaModule`** ([prisma.module.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/prisma/prisma.module.ts))
  Экспортирует `PrismaService` как глобального провайдера (`@Global()`), избавляя от необходимости вручную импортировать его в каждый модуль фичи.

---

## 6. Клиент Supabase (`supabase`)

* **`SupabaseService`** ([supabase.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/supabase/supabase.service.ts))
  * Обертка над официальным клиентом `@supabase/supabase-js`.
  * Использует `SUPABASE_URL` и `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` из переменных окружения.
  * Если ключи не переданы, клиент инициализируется в режиме заглушки (mock), предотвращая падение приложения при отсутствии доступа к Supabase API.
* **`SupabaseModule`** ([supabase.module.ts](file:///Users/krimson/PROJECTS/nest_backend/src/core/supabase/supabase.module.ts))
  Обеспечивает интеграцию SDK Supabase во все остальные слои приложения.

---

## 🔒 Безопасность ядра (Core Security)

Вся логика защиты данных в приложении базируется на следующих встроенных механизмах ядра:
1. **Аутентификация & JWT**: `AuthGuard` осуществляет извлечение и валидацию токенов доступа с помощью `passport-jwt` и локального секрета `SUPABASE_JWT_SECRET`.
2. **Авторизация (RBAC / ABAC)**: Сочетание `RolesGuard` для разграничения прав по ролям на уровне эндпоинтов и условных проверок в сервисах для подтверждения владения запрашиваемыми данными.
3. **Безопасные заголовки и CORS**: Задействован плагин `@fastify/helmet` для управления заголовками безопасности HTTP (защита от XSS, CSP, HSTS, Clickjacking) и установлены строгие правила CORS в `main.ts`.
4. **Валидация входящих данных**: Глобальный `ValidationPipe` с автоматическим отсеканием неописанных полей (whitelisting) отфильтровывает невалидные или вредоносные тела запросов.
5. **Аудит**: Мутирующие операции записываются через `AuditInterceptor` в журнал `activity_logs`.
