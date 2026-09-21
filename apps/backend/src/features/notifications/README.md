# 📡 Backend Notifications Module (`apps/backend`)

REST API и сервисы управления шаблонами, триггерами, журналами отправок и вебхуками почтового шлюза Resend.

---

## 🏛️ Архитектура модуля (`NotificationsModule`)

* **`NotificationsController` (`admin/notifications/*`):** Защищенные эндпоинты для панели управления CRM. Требуют авторизации JWT (`AuthGuard`) и ролей `admin` или `secretary` (`RolesGuard`).
* **`NotificationsService`:** Бизнес-логика CRUD шаблонов в PostgreSQL, пагинация логов `notification_logs`, отправка тестовых писем через `@atena/core`.
* **`NotificationTriggersService`:** Предоставляет схему системных событий `SYSTEM_EVENTS_REGISTRY` и декларативный список правил `SYSTEM_TRIGGERS` для UI.
* **`ResendWebhookController` (`/notifications/resend-webhook`):** Публичный эндпоинт для приема событий доставки от Resend со строгой верификацией подписи Svix.

---

## 📋 Спецификация REST API

### 1. Шаблоны (`/admin/notifications/templates`)
* `GET /admin/notifications/templates` — список шаблонов с фильтрацией по `channel`, `recipient_type`, `search`.
* `POST /admin/notifications/templates` — создание кастомного шаблона (роль: `admin`).
* `GET /admin/notifications/templates/:id` — получение шаблона по UUID.
* `PATCH /admin/notifications/templates/:id` — обновление темы, блоков `blocks_config`, HTML/Text тела.
* `DELETE /admin/notifications/templates/:id` — удаление шаблона.
* `POST /admin/notifications/templates/:id/test-send` — отправка тестового сообщения на указанный `recipient` с тестовым `sample_data`.

### 2. Триггеры и события (`/admin/notifications/triggers`)
* `GET /admin/notifications/system-events` — реестр системных событий (`SYSTEM_EVENTS_REGISTRY`) и доступных переменных.
* `GET /admin/notifications/triggers` — список активных системных правил автоматизации из `@atena/core`.
* `GET /admin/notifications/triggers/:id` — получение конкретного правила по ID.
* `PATCH /admin/notifications/triggers/:id/toggle` — включение / выключение триггера (`is_active`).

### 3. Журнал отправок (`/admin/notifications/logs`)
* `GET /admin/notifications/logs` — постраничный список логов с фильтрами:
  * `page` (default: 1), `limit` (default: 20)
  * `channel` (1: Email, 2: Telegram)
  * `status` (1: Sent, 2: Failed)
  * `search` (поиск по email/телефону получателя или теме)
* `POST /admin/notifications/logs/:id/retry` — повторная отправка сбойного уведомления.

### 4. Вебхуки (`/notifications/resend-webhook`)
* `POST /notifications/resend-webhook` — прием событий `email.delivered`, `email.bounced`, `email.complained`.
  * Валидирует `svix-id`, `svix-timestamp`, `svix-signature` через `verifyResendWebhookSignature()`.
  * Обновляет статус записи в `notification_logs`.

---

## 🔗 Связь с Core Engine
Все низкоуровневые операции (рендеринг визуальных блоков, матчинг условий, отправка через Resend HTTP API и Telegram Bot API) делегируются в пакет `@atena/core`.
