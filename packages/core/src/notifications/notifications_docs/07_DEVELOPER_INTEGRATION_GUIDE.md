# 🛠️ 07. Руководство разработчика (Developer Integration Guide)

Пошаговые инструкции по вызову нотификаций, добавлению новых типов событий и регистрации триггеров.

---

## 1. Как вызвать отправку уведомления по бронированию

В Server Actions (Next.js) или сервисах бронирования:

```ts
import { sendBookingNotificationEmails } from '@atena/core';

await sendBookingNotificationEmails({
  supabase: supabaseClient,
  booking: bookingRecord,
  course: courseRecord,
  dto: createReservationDto,
});
```

---

## 2. Как вызвать отправку уведомления по форме контактов

```ts
import { sendContactFormNotificationEmail } from '@atena/core';

await sendContactFormNotificationEmail({
  supabase: supabaseClient,
  data: {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    interest: dto.interest,
    message: dto.message,
  },
});
```

---

## 3. Как запустить цепочку триггеров по ключу события

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

## 4. Как добавить новое системное событие

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
   В файле [packages/core/src/notifications/system-triggers.config.ts](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/system-triggers.config.ts):
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

## 5. Прямая отправка произвольного Telegram сообщения

```ts
import { sendTelegramMessage, NotificationType } from '@atena/core';

await sendTelegramMessage({
  supabase: supabaseClient,
  text: `⚠️ <b>AVVISO DI SISTEMA:</b> Aggiornamento completato con successo.`,
  notificationType: NotificationType.BOOKING_CONFIRMATION,
});
```

---

## 6. Прямая отправка произвольного Email через Resend

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
