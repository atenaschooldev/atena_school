# ⚙️ 04. Движок триггеров и условий (Trigger Engine)

Движок триггеров отвечает за реакцию на системные события платформы и автоматическую диспетчеризацию сообщений через Email и Telegram.

---

## 1. Декларативные триггеры (`SYSTEM_TRIGGERS`)

Файл [system-triggers.config.ts](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/system-triggers.config.ts) содержит базовые правила автоматизации ядра `@atena/core`:

```ts
export interface SystemTriggerDefinition {
  id: string;
  name: string;
  description: string;
  event_key: string;
  template_code: string;
  channel: NotificationChannel;
  recipient_type: RecipientType | 4;
  custom_recipient?: string | null;
  conditions?: Record<string, any> | null;
  timing_type: 'immediate' | 'delayed' | 'before_event';
  delay_seconds: number;
  is_active: boolean;
}
```

### 📋 Базовые системные правила:
1. `trg_stripe_payment_receipt_customer` — Email-чек клиенту при оплате Stripe (`booking.created_stripe`).
2. `trg_stripe_booking_alert_admin_tg` — Карточка в Telegram секретариату при Stripe-оплате.
3. `trg_stripe_booking_alert_admin_email` — Email-отчет в секретариат при Stripe-оплате.
4. `trg_cash_booking_confirmation_customer` — Инструкции по оплате на месте клиенту (`booking.pending_cash`).
5. `trg_cash_booking_alert_admin_tg` — Карточка в Telegram с кнопками быстрой отметки оплаты в секретариате.
6. `trg_cash_booking_alert_admin_email` — Email-уведомление в секретариат о брони с оплатой на месте.
7. `trg_contact_lead_alert_tg` — Мгновенный алерт в Telegram по лид-форме с кнопкой WhatsApp (`contact_form.submitted`).
8. `trg_contact_lead_admin_email` — Письмо с сообщением лида на почту школы.
9. `trg_booking_cancelled_customer` — Письмо клиенту об аннулировании записи (`booking.cancelled`).
10. `trg_membership_card_customer` — Письмо клиенту с членской картой (`membership.card_issued`).

---

## 2. Динамические триггеры в БД (`notification_triggers`)

В `apps/backend` поддерживается таблица `notification_triggers` (Prisma/PostgreSQL), позволяющая создавать и кастомизировать триггеры через Admin CRM API:
* Эндпоинты `/admin/notifications/triggers` предоставляют CRUD-операции и переключатель `PATCH :id/toggle`.
* Сервис `NotificationTriggerEngineService` подписан на события NestJS EventEmitter (`@OnEvent('booking.created_stripe')`, `@OnEvent('payment.succeeded')` и др.) и выполняет сопоставление с активными правилами из БД.

---

## 3. Матчер условий (`trigger-matcher.ts`)

Матчер условий позволяет настраивать гибкие правила фильтрации триггеров на основе JSON-объекта `conditions`.

### 3.1. Доступ к вложенным полям (Dot-Notation) и кастомным полям форм
Функция `getFieldValue(payload, path)` безопасно извлекает значения первого уровня или вложенные свойства:
* `course.price`
* `student.is_minor`
* `purchaser.tax_code`
* **Кастомные поля форм из `bookings.custom_fields`**: автоматически доступны через прямые ключи `study_level`, с префиксом `custom.study_level` или полным путем `custom_fields.study_level`.

### 3.2. Нормализация булевых значений
Функция `normalizeBoolean(val)` корректно приводит к `true`: `true`, `1`, `'1'`, `'true'`, `'TRUE'`.

### 3.3. Поддерживаемые операторы условий:
* `eq` / `=` / `==` — равенство (с нормализацией булевых значений и case-insensitive для строк).
* `neq` / `!=` / `<>` — неравенство.
* `gt` / `>` — больше (числовое сравнение).
* `gte` / `>=` — больше либо равно (числовое сравнение).
* `lt` / `<` — меньше.
* `lte` / `<=` — меньше либо равно.
* `contains` / `not_contains` — проверка вхождения подстроки (case-insensitive).
* `starts_with` / `ends_with` — проверка префикса и суффикса.
* `in` / `not_in` — проверка принадлежности массиву значений.
* `is_empty` / `is_not_empty` — проверка на `null`, `undefined`, пустую строку или пустой массив.
* Прямое задание значения (например `"is_for_child": true` или `"course_name": "Kids"`).
* Legacy-сравнения числовых диапазонов: `min_total_amount: 100`, `max_total_amount: 500`.

### Пример сложного JSON-условия:
```json
{
  "total_amount": { "gte": 100 },
  "is_for_child": true,
  "course_name": { "contains": "English" }
}
```

---

## 4. Вызов в коде приложений

### В коде Next.js / Server Actions (`@atena/core`):
```ts
import { processNotificationTriggers } from '@atena/core';

await processNotificationTriggers(
  supabaseClient,
  'booking.created_stripe',
  templateVariables
);
```

### В NestJS бэкенде через EventEmitter:
```ts
this.eventEmitter.emit('booking.created_stripe', payload);
```
