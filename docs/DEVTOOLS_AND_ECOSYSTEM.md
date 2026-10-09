# 🛠 Экосистема, Инструменты Разработки и Ссылки Проекта Atena School

В данном документе собрана полная карта всех приложений монорепозитория, портов, визуальных админок, девтулзов, инструментов диагностики, анализаторов бандла и внешних сервисов.

---

## 🗺 1. Быстрая Сводка Портов и Локальных Ссылок

| Приложение / Сервис | Порт / URL | Назначение |
|---|---|---|
| **Landing & Checkout** | [http://localhost:3000](http://localhost:3000) | Публичный сайт, витрина курсов, форма записи и онлайн-оплата |
| **CRM Admin (Секретарь)** | [http://localhost:3001](http://localhost:3001) | Панель управления школой, студентами, курсами и расписанием |
| **Student Portal (ЛК)** | [http://localhost:3002](http://localhost:3002) | Личный кабинет студента и родителя (Magic Link OTP) |
| **Backend API (NestJS)** | [http://localhost:4000/v1](http://localhost:4000/v1) | REST API бэкенд на Fastify + Prisma |
| **Swagger Hub (Все ручки)** | [http://localhost:4000/docs](http://localhost:4000/docs) | Интерактивная документация всего API |
| **Scalar API Reference (Stripe-like)** | [http://localhost:4000/scalar](http://localhost:4000/scalar) | Современный интерактивный API портал и песочница запросов |
| **Swagger: Landing API** | [http://localhost:4000/docs/landing](http://localhost:4000/docs/landing) | Документация ручек публичного каталога и чекаута |
| **Swagger: Portal API** | [http://localhost:4000/docs/portal](http://localhost:4000/docs/portal) | Документация ручек личного кабинета ученика |
| **Swagger: CRM Admin API** | [http://localhost:4000/docs/admin](http://localhost:4000/docs/admin) | Документация ручек CRM и секретарской панели |
| **Data Dictionary (Словарь)** | [http://localhost:4000/docs/dictionary](http://localhost:4000/docs/dictionary) | Интерактивный справочник статусов, типов и кодов |
| **System Diagnostics (Health)**| [http://localhost:4000/health](http://localhost:4000/health) | Диагностика БД, памяти и статуса интеграций |
| **Terminus Healthcheck** | [http://localhost:4000/health/terminus](http://localhost:4000/health/terminus) | Стандартный healthcheck NestJS Terminus (ping БД, RSS/Heap) |
| **Prisma Studio (UI базы данных)** | [http://localhost:5555](http://localhost:5555) | Визуальный просмотр и редактирование таблиц PostgreSQL |
| **Compodoc (Архитектура и Граф DI)** | [http://localhost:8080](http://localhost:8080) | Интерактивный визуальный граф модулей NestJS и JSDoc |
| **Skott (Живой Граф & Анализ Циклов)** | [http://localhost:3333](http://localhost:3333) | 2D/3D интерактивный граф связей файлов и детектор циклов |

---

## 🚀 2. Команды Запуска Окружения

### 🌟 Главные скрипты запуска (все 4 приложения параллельно)
- **Запуск на PROD базе данных (по умолчанию):**
  ```bash
  pnpm dev:prod
  # или pnpm dev:all
  ```
- **Запуск на DEV базе данных:**
  ```bash
  pnpm dev:dev
  ```

> Скрипт `scripts/dev-runner.js` автоматически копирует `.env.prod` или `.env.dev` во все 4 проекта (`backend`, `landing`, `app`, `admin`) и запускает Turborepo.

---

## 🗄 3. Базы Данных и Визуальные Менеджеры БД

### 3.1. Prisma Studio (Локальный UI для таблиц)
Позволяет искать, фильтровать, пагинировать и редактировать любые записи во всех таблицах схемы БД с автоматическим подтягиванием связей:
- **Запуск на PROD базе:**
  ```bash
  pnpm studio:prod
  # или pnpm studio
  ```
  👉 Доступно по адресу: [http://localhost:5555](http://localhost:5555)
- **Запуск на DEV базе:**
  ```bash
  pnpm studio:dev
  ```
  👉 Доступно по адресу: [http://localhost:5555](http://localhost:5555)

### 3.2. Supabase Web Dashboards (Облачные панели)
- **🟢 Production Supabase:**
  - **Project ID:** `jnfbfihzpplyersbhkch`
  - **URL:** [https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch](https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch)
  - **Table Editor:** [https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/editor](https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/editor)
  - **SQL Editor:** [https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/sql/new](https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/sql/new)
  - **Auth Users:** [https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/auth/users](https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/auth/users)
  - **Storage (Файлы/Чеки/Аватары):** [https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/storage/buckets](https://supabase.com/dashboard/project/jnfbfihzpplyersbhkch/storage/buckets)
- **🟡 Development Supabase:**
  - **Project ID:** `hcxpfzsmzusolvhtuhhm`
  - **URL:** [https://supabase.com/dashboard/project/hcxpfzsmzusolvhtuhhm](https://supabase.com/dashboard/project/hcxpfzsmzusolvhtuhhm)

---

## ⚡ 4. Инструменты Разработки Фронтенда (Frontend DevTools)

### 4.1. TanStack Query Devtools (`apps/admin`)
- **Где подключено:** CRM Admin (`http://localhost:3001`).
- **Как пользоваться:** В dev-режиме в левом нижнем углу экрана отображается плавающий логотип цветка TanStack Query.
- **Возможности:**
  - Просмотр всех ключей кэша (`['students']`, `['courses']`, `['bookings']` и т.д.).
  - Состояние запросов: `fresh`, `fetching`, `paused`, `stale`, `inactive`.
  - Принудительный `Refetch`, `Invalidate`, `Reset` или ручное редактирование кэшированных данных без перезагрузки страницы.
  - В production сборку не попадает (автоматический tree-shaking).

### 4.2. React Scan (`apps/admin`)
- **Где подключено:** CRM Admin (`http://localhost:3001`).
- **Как пользоваться:** В dev-режиме автоматически подсвечивает компоненты при их перерендере цветными контурами и бэйджами с количеством рендеров.
- **Возможности:**
  - Мгновенно выявляет лишние или каскадные перерендеры в таблицах, списках студентов и календаре.
  - По клику на инспектор показывает точную причину рендера (изменение конкретного `prop` или `state`).

### 4.3. Next.js Bundle Analyzer (`apps/landing` & `apps/app`)
- **Где подключено:** В Next.js приложениях для оптимизации размера клиентских JS-чанков.
- **Запуск анализа для Landing:**
  ```bash
  pnpm analyze:landing
  ```
- **Запуск анализа для Личного кабинета (App):**
  ```bash
  pnpm analyze:app
  ```
- **Что происходит:** Приложение собирается, после чего в браузере автоматически открываются две вкладки с интерактивными визуальными картами (Treemap) размера `client.html` и `nodejs.html`.

---

## 📡 5. Документация API, Трейсинг и Observability (`apps/backend`)

### 5.1. Swagger / OpenAPI Экосистема
Бэкенд генерирует единую навигационную панель и изолированные разделы спецификации:
- **Все эндпоинты:** [http://localhost:4000/docs](http://localhost:4000/docs)
- **Лендинг и чекаут:** [http://localhost:4000/docs/landing](http://localhost:4000/docs/landing)
- **Личный кабинет студента:** [http://localhost:4000/docs/portal](http://localhost:4000/docs/portal)
- **CRM и админка:** [http://localhost:4000/docs/admin](http://localhost:4000/docs/admin)
- **Интерактивный словарь кодов:** [http://localhost:4000/docs/dictionary](http://localhost:4000/docs/dictionary)
- **Сырой OpenAPI JSON:**
  - Полный: [http://localhost:4000/docs/openapi.json](http://localhost:4000/docs/openapi.json)
  - Landing: [http://localhost:4000/docs/openapi-landing.json](http://localhost:4000/docs/openapi-landing.json)
  - Portal: [http://localhost:4000/docs/openapi-portal.json](http://localhost:4000/docs/openapi-portal.json)
  - Admin: [http://localhost:4000/docs/openapi-admin.json](http://localhost:4000/docs/openapi-admin.json)

### 5.2. Мониторинг Здоровья и Диагностика
- **Кастомный Health & Integration Check:**
  - URL: [http://localhost:4000/health](http://localhost:4000/health)
  - Выдаёт JSON со статусом БД, задержкой ping в мс, потреблением Heap/RSS памяти и флагами готовности ключей (Stripe, Resend, Telegram, Sentry).
- **NestJS Terminus Healthcheck:**
  - URL: [http://localhost:4000/health/terminus](http://localhost:4000/health/terminus)
  - Стандартная проверка `@nestjs/terminus` с индикаторами `PrismaHealthIndicator` и `MemoryHealthIndicator`.

### 5.3. NestJS Observe (APM & Distributed Tracing)
- **Веб-панель:** [https://observe.nestjs.com](https://observe.nestjs.com)
- **Интеграция:** Подключен агент `@nestjs/observe` в `apps/backend/src/observe.ts` и `main.ts`.
- **Что отслеживает:** Трейсы HTTP-запросов, задержки контроллеров, медленные запросы к БД Prisma, распределение памяти и ошибки.
- **Активация:** Задайте `OBSERVE_APP_KEY` и `OBSERVE_APP_ID` в `apps/backend/.env`.

### 5.4. Compodoc (Интерактивная Архитектура и Граф DI)
- **Запуск локального сервера документации:**
  ```bash
  pnpm doc:arch
  ```
  👉 Доступно по адресу: [http://localhost:8080](http://localhost:8080)
- **Что визуализирует:**
  - **Module Dependency Graph:** Интерактивная карта связей всех модулей NestJS (`AppModule`, `CheckoutModule`, `MailModule`, `PrismaModule` и т.д.).
  - Полный каталог провайдеров, сервисов, контроллеров, гардов и DTO с JSDoc описанием.
  - Поиск по кодовой базе и аудит покрытия документацией.

### 5.5. Event-Driven Architecture (`@nestjs/event-emitter`)
- **Подключение:** Модуль `EventEmitterModule.forRoot()` подключен в `AppModule`.
- **Назначение:** Асинхронное выполнение фоновых задач без блокировки HTTP-ответов:
  - `booking.created` / `payment.received` ➔ отправка писем через Resend, отправка Telegram-уведомлений, запись в `audit_logs`.

### 5.6. Skott (2D/3D Интерактивный Граф Кода и Детектор Циклов)
- **Запуск интерактивного веб-графа:**
  ```bash
  pnpm graph:code
  ```
  👉 Автоматически открывает локальное веб-приложение в браузере (выводит ссылку `http://localhost:<порт>` в консоль).
- **Консольная проверка циклических зависимостей:**
  ```bash
  pnpm graph:circular
  ```
- **Консольный поиск неиспользуемых файлов/экспортов:**
  ```bash
  pnpm graph:unused
  ```

### 5.7. Turborepo Dependency Graph
- **Генерация визуальной карты связей пакетов монорепозитория:**
  ```bash
  pnpm graph:repo
  ```
  Создает и открывает `graph.html` с картой пакетов (`landing`, `admin`, `app`, `backend`, `@atena/core`, `@atena/utils`, `@atena/api-types`, `@atena/validators`).

---

## 💳 6. Внешние Сервисы, Вебхуки и Панели

### 6.1. Stripe Dashboard & Webhooks
- **Stripe Dashboard (Test / Live):** [https://dashboard.stripe.com/](https://dashboard.stripe.com/)
- **Локальный проброс вебхуков Stripe на бэкенд:**
  ```bash
  stripe listen --forward-to localhost:4000/v1/checkout/webhook
  ```
  Команда сгенерирует секрет `whsec_...`, который можно указать в `STRIPE_WEBHOOK_SECRET`.

### 6.2. Resend (Email Транзакции)
- **Панель управления письмами:** [https://resend.com/emails](https://resend.com/emails)
- **Логи отправки:** Просмотр доставленных, открытых и ошибочных писем (квитанции, подтверждения броней, Magic Link коды).

### 6.3. Telegram Bot Notifications
- **Канал уведомлений:** Telegram-бот Atena School отправляет алерты о новых бронированиях, оплатах и критических системных ошибках.

---

## 📦 7. Правила Развертывания и Синхронизации Git

- **ПРОДАКШЕН Git & Vercel:** `https://github.com/atenaschooldev/atena_school.git` (Email: `atenaschool.dev@gmail.com`)
- **ДЕВ Git & Vercel:** `https://github.com/yukinoaruu/atena_school.git` (Email: `yukinoaruu@gmail.com`)
- **Единая команда пуша:**
  ```bash
  git push all main
  ```
  *(Всегда пушит одновременно в оба репозитория).*
