# 📡 Backend Notifications Module (`apps/backend`)

REST API и сервисы управления шаблонами, триггерами, журналами отправок и вебхуками почтового шлюза Resend.

---

## 🏛️ Архитектура модуля (`NotificationsModule`)

* **`NotificationsController` (`admin/notifications/*`):** Защищенные эндпоинты для панели управления CRM. Требуют авторизации JWT (`AuthGuard`) и ролей `admin` или `secretary` (`RolesGuard`).
* **`NotificationsService`:** Бизнес-логика CRUD шаблонов в PostgreSQL, пагинация логов `notification_logs`, отправка тестовых писем и сообщений через `@atena/core`.
* **`NotificationTriggersService`:** Предоставляет реестр системных событий `SYSTEM_EVENTS_REGISTRY`, CRUD триггеров в таблице `notification_triggers` и переключение их активности.
* **`NotificationTriggerEngineService`:** Слушатель событий NestJS EventEmitter (`@OnEvent('booking.created_stripe')`, `@OnEvent('contact_form.submitted')` и др.) с автоматическим матчингом условий и диспетчеризацией.
* **`ResendWebhookController` (`/webhooks/resend`, `/landing/mail/webhook`, `/mail/webhook`):** Публичный эндпоинт для приема событий доставки от Resend со строгой верификацией подписи Svix.

---

## 📋 Спецификация REST API

### 1. Шаблоны (`/admin/notifications/templates`)
* `GET /admin/notifications/templates` — список шаблонов с фильтрацией по `channel`, `recipient_type`, `search` (роли: `admin`, `secretary`).
* `POST /admin/notifications/templates` — создание кастомного шаблона (роль: `admin`).
* `GET /admin/notifications/templates/:id` — получение шаблона по UUID (роли: `admin`, `secretary`).
* `PATCH /admin/notifications/templates/:id` — обновление темы, блоков `blocks_config`, HTML/Text тела (роль: `admin`).
* `DELETE /admin/notifications/templates/:id` — удаление шаблона (роль: `admin`, системные шаблоны защищены от удаления).
* `POST /admin/notifications/templates/:id/test-send` — отправка тестового сообщения на указанный `recipient` с тестовым `sample_data` (роль: `admin`).

### 2. Триггеры и события (`/admin/notifications/triggers` и `system-events`)
* `GET /admin/notifications/system-events` — реестр системных событий (`SYSTEM_EVENTS_REGISTRY`) и доступных переменных (роли: `admin`, `secretary`).
* `GET /admin/notifications/triggers` — список правил и триггеров автоматизации (роли: `admin`, `secretary`).
* `GET /admin/notifications/triggers/:id` — получение триггера по ID (роли: `admin`, `secretary`).
* `POST /admin/notifications/triggers` — создание правила/триггера автоматизации (роль: `admin`).
* `PATCH /admin/notifications/triggers/:id` — обновление параметров триггера (роль: `admin`).
* `PATCH /admin/notifications/triggers/:id/toggle` — включение / выключение триггера (`is_active`, роль: `admin`).
* `DELETE /admin/notifications/triggers/:id` — удаление триггера (роль: `admin`).

### 3. Журнал отправок (`/admin/notifications/logs`)
* `GET /admin/notifications/logs` — постраничный список логов (роли: `admin`, `secretary`) с фильтрами:
  * `page` (default: 1), `limit` (default: 20)
  * `channel` (1: Email, 2: Telegram)
  * `status` (1: Sent, 2: Failed)
  * `search` (поиск по email/телефону получателя или теме)

### 4. Вебхуки (`/webhooks/resend`, `/landing/mail/webhook`, `/mail/webhook`)
* `POST /webhooks/resend` — прием событий `email.delivered`, `email.bounced`, `email.complained`, `email.opened` и др.
  * Валидирует заголовки `svix-id`, `svix-timestamp`, `svix-signature` через `verifyResendWebhookSignature()`.
  * Обновляет статус записи в `notification_logs` и сохраняет аудит-историю событий доставки.

---

## 🔗 Связь с Core Engine
Все низкоуровневые операции (рендеринг визуальных блоков, матчинг условий, отправка через Resend HTTP API и Telegram Bot API) делегируются в пакет `@atena/core`.
