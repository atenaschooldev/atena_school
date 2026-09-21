# 🛠️ 07. Руководство разработчика (Developer Integration Guide)

Пошаговые инструкции по добавлению новых типов событий, триггеров и вызову нотификаций.

---

## 1. Как вызвать отправку уведомления по событию

В любом Server Action (Next.js) или NestJS Service достаточно импортировать `processNotificationTriggers` из `@atena/core`:

```ts
import { processNotificationTriggers } from '@atena/core';

// 1. Подготавливаем словарь переменных (payload)
const payload = {
  booking_id: booking.id,
  purchaser_name: `${dto.firstName} ${dto.lastName}`,
  purchaser_email: dto.email,
  student_name: dto.studentFirstName ? `${dto.studentFirstName} ${dto.studentLastName}` : undefined,
  course_name: course.name,
  total_amount: '103.20',
  course_price: '73.20',
  registration_fee: '30.00',
  is_paid_online: true,
  lesson_schedule: 'Martedì e Giovedì 17:00-18:00',
  dashboard_url: 'https://app.atenaschool.com',
};

// 2. Вызываем процессинг события
await processNotificationTriggers(
  supabaseClient,
  'booking.created_stripe', // Ключ события из SYSTEM_EVENTS_REGISTRY
  payload
);
```

---

## 2. Как добавить новое системное событие

1. **Зарегистрировать ключ в `@atena/api-types`:**
   В файле [packages/api-types/src/system/notifications.ts](file:///Users/krimson/PROJECTS/atena_school/packages/api-types/src/system/notifications.ts) добавить событие в `SYSTEM_EVENTS_REGISTRY`:
   ```ts
   'lesson.rescheduled': {
     event_key: 'lesson.rescheduled',
     category: 'lesson',
     label_it: 'Lezione Spostata',
     label_en: 'Lesson Rescheduled',
     description_it: 'Scatta quando una lezione viene spostata di orario o data',
     description_en: 'Fires when a scheduled lesson date or time changes',
     available_variables: [
       { key: 'student_name', label_it: 'Nome Studente', label_en: 'Student Name', example: 'Luca Rossi' },
       { key: 'old_date', label_it: 'Vecchia Data', label_en: 'Old Date', example: '2026-10-12 17:00' },
       { key: 'new_date', label_it: 'Nuova Data', label_en: 'New Date', example: '2026-10-14 18:00' },
       { key: 'reason', label_it: 'Motivo Spostamento', label_en: 'Reason', example: 'Festività' },
     ],
   },
   ```

2. **Зарегистрировать правило триггера в `SYSTEM_TRIGGERS`:**
   В файле [packages/core/src/notifications/system-triggers.config.ts](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/system-triggers.config.ts) добавить правило:
   ```ts
   {
     id: 'trg_lesson_rescheduled_customer',
     name: 'Notifica Spostamento Lezione allo Studente',
     description: 'Invia email con nuovo orario della lezione',
     event_key: 'lesson.rescheduled',
     template_code: 'lesson_rescheduled_customer',
     channel: NotificationChannel.EMAIL,
     recipient_type: RecipientType.CUSTOMER,
     timing_type: 'immediate',
     delay_seconds: 0,
     is_active: true,
   }
   ```

3. **Описать дефолтный шаблон в `getDefaultBlocksForTemplate`:**
   В файле [packages/core/src/notifications/block-compiler.ts](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/block-compiler.ts) добавить пресет блоков для кода `lesson_rescheduled_customer`.

4. **Запустить тесты:**
   ```bash
   pnpm --filter @atena/core test
   ```

---

## 3. Отправка прямого произвольного Telegram сообщения

Если необходимо отправить системный алерт вне триггеров:

```ts
import { sendTelegramMessage, NotificationType } from '@atena/core';

await sendTelegramMessage({
  supabase: supabaseClient,
  text: `⚠️ <b>AVVISO DI SISTEMA:</b> Backup completato con successo.`,
  notificationType: NotificationType.BOOKING_CONFIRMATION,
});
```

---

## 4. Отправка прямого произвольного Email

```ts
import { sendEmailViaResend } from '@atena/core';

const res = await sendEmailViaResend({
  from: 'Atena School <info@atenaschool.com>',
  to: 'mario.rossi@gmail.com',
  subject: 'Oggetto del messaggio',
  html: '<h1>Ciao Mario</h1><p>Testo del messaggio...</p>',
});

if (!res.success) {
  console.error('Failed to send email:', res.error);
}
```
