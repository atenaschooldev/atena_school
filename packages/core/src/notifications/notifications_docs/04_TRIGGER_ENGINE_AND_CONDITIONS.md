# ⚙️ 04. Движок триггеров и условий (Trigger Engine)

Движок триггеров отвечает за реакцию на системные события платформы и автоматическую диспетчеризацию сообщений.

---

## 1. Реестр системных триггеров (`SYSTEM_TRIGGERS`)

Файл [system-triggers.config.ts](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/system-triggers.config.ts) является **единственным источником правды** для логики триггеров:

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

### 📋 Базовые системные триггеры:
1. `trg_stripe_payment_receipt_customer` — Email-чек клиенту при оплате Stripe.
2. `trg_stripe_booking_alert_admin_tg` — Карточка в Telegram секретариату при Stripe-оплате.
3. `trg_stripe_booking_alert_admin_email` — Email-отчет в секретариат при Stripe-оплате.
4. `trg_cash_booking_confirmation_customer` — Инструкции по оплате на месте клиенту.
5. `trg_cash_booking_alert_admin_tg` — Карточка в Telegram с кнопками быстрой отметки оплаты в секретариате.
6. `trg_cash_booking_alert_admin_email` — Email-уведомление в секретариат о брони с оплатой на месте.
7. `trg_contact_lead_alert_tg` — Мгновенный алерт в Telegram по лид-форме с кнопкой WhatsApp.
8. `trg_contact_lead_admin_email` — Письмо с сообщением лида на почту школы.
9. `trg_booking_cancelled_customer` — Письмо клиенту об аннулировании записи.
10. `trg_membership_card_customer` — Письмо клиенту с членской картой.

---

## 2. Матчер условий (`trigger-matcher.ts`)

Матчер условий позволяет настраивать гибкие правила фильтрации триггеров на основе JSON-объекта `conditions`.

### 2.1. Доступ к вложенным полям (Dot-Notation)
Матчер поддерживает извлечение вложенных свойств:
* `course.price`
* `student.is_minor`
* `purchaser.tax_code`

### 2.2. Поддерживаемые операторы:
* `eq` — равенство (с нечувствительностью к регистру строк и нормализацией булевых значений `true`/`1`/`"true"`).
* `neq` — неравенство.
* `gt` / `gte` — больше / больше либо равно (числовое сравнение).
* `lt` / `lte` — меньше / меньше либо равно.
* `contains` / `not_contains` — проверка вхождения подстроки (case-insensitive).
* `starts_with` / `ends_with` — проверка префикса и суффикса.
* `in` / `not_in` — проверка принадлежности массиву значений.
* `is_empty` / `is_not_empty` — проверка на `null`, `undefined`, пустую строку или пустой массив.

### Пример сложного условия:
```json
{
  "total_amount": { "gte": 100 },
  "is_for_child": true,
  "course_name": { "contains": "English" }
}
```
*Триггер сработает только если итоговая сумма ≥ €100, курс оформлен на ребенка и в названии курса есть "English".*

---

## 3. Вызов в коде приложения

Для запуска цепочки триггеров достаточно вызвать функцию `processNotificationTriggers`:

```ts
import { processNotificationTriggers } from '@atena/core';

await processNotificationTriggers(
  supabaseClient,
  'booking.created_stripe',
  templateVariables
);
```
