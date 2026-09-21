# 🔔 Интеграция уведомлений и Magic Link на Лендинге (`apps/landing`)

Документация по взаимодействию веб-приложения лендинга с ядром уведомлений (`@atena/core`) и сервисом беспарольной авторизации Magic Link.

---

## 🏛️ Архитектурный принцип

Лендинг **не занимается прямой генерацией HTML-писем или форматированием сообщений для Telegram**. 
Вся логика шаблонизации, условий, экспоненциального backoff и мультиканальной диспетчеризации инкапсулирована в пакете `@atena/core`.

**Задача лендинга:** корректно собрать данные пользователя (payload) при чекауте или отправке формы и вызвать соответствующий метод ядра.

---

## 📍 1. Точки интеграции на лендинге

### 1.1. Оплата онлайн через Stripe (`booking.created_stripe`)
* **Где вызывается:** В Stripe Webhook (`/landing/webhooks/stripe`) или на странице верификации платежа (`/landing/checkout/verify-payment`).
* **Функция:** `sendBookingNotificationEmails(params)`.
* **Что происходит:**
  1. Клиент получает финансовую квитанцию с детальной разбивкой (курс + взнос €30 + примененный промокод).
  2. Секретариат получает в Telegram интерактивную карточку с кнопкой перехода в Stripe Dashboard по `payment_intent_id`.
  3. На почту школы направляется сводное письмо с анкетными данными студента.

### 1.2. Бронирование с оплатой на месте (`booking.pending_cash`)
* **Где вызывается:** В API-роуте оформления бронирования (`/landing/checkout/reserve`).
* **Функция:** `sendBookingNotificationEmails(params)` с флагом `isPaidOnline = false`.
* **Что происходит:**
  1. Клиент получает подтверждение бронирования с банковскими реквизитами (IBAN) и инструкцией по оплате в секретариате школы.
  2. В Telegram-канал секретариата поступает карточка с кнопками быстрого подтверждения:
     * `💶 Salda Quota €30` (отметка об оплате членского взноса)
     * `🎓 Salda Corso` (отметка об оплате курса)
     * `✅ Salda Tutto` (полное закрытие задолженности в 1 клик)

### 1.3. Форма обратной связи (`contact_form.submitted`)
* **Где вызывается:** В API-роуте контактной формы (`/landing/contact`).
* **Функция:** `sendContactFormNotificationEmail(params)`.
* **Что происходит:**
  1. Секретариат получает мгновенный алерт в Telegram с кнопкой **"💬 WhatsApp"** (`https://wa.me/{cleanPhone}`) для моментального ответа клиенту в мессенджере.
  2. На официальный email школы направляется копия сообщения лида.

---

## 🔑 2. Правила подготовки Payload (Переменных)

При вызове методов `@atena/core` на лендинге соблюдаются строгие правила:

### 💶 2.1. Разбивка стоимости (Правило двух платежей)
```ts
const totalEur = Number(booking.amount_paid || 0).toFixed(2);
const regFeeEur = Number(booking.registration_fee || 0).toFixed(2);
const courseFeeEur = (Number(totalEur) - Number(regFeeEur)).toFixed(2);
```

### 👶 2.2. Обработка родителя и ребенка (`isForChild`)
* Если `dto.isForChild === true`:
  * `purchaserName` = имя родителя (заказчика).
  * `studentName` = имя несовершеннолетнего студента.
  * Финансовые чеки адресуются на `purchaserEmail`, а членская карта оформляется на `studentName` с его `studentTaxCode`.
* Если `dto.isForChild === false`:
  * `studentName` = `purchaserName`.

### 🗓 2.3. Форматирование расписания уроков
Расписание всегда форматируется через единую функцию из `@atena/utils`:
```ts
import { formatCourseScheduleText } from '@atena/utils';

const lessonSchedule = formatCourseScheduleText(
  course.schedule_days,
  course.start_time,
  course.end_time
);
```

---

## ⚡ 3. Magic Link и беспарольная авторизация

Для быстрого входа в Личный кабинет студента (`apps/app`) без создания пароля:

### 3.1. Генерация ссылки (`/landing/auth/magic-link`)
* Запрос отправляется на Next.js API-роут `apps/landing/src/app/landing/auth/magic-link/route.ts`.
* Действует **Rate Limit**: максимум 5 запросов в минуту с одного IP-адреса.
* **Редирект (`emailRedirectTo`):** формируется через утилиту `getStudentPortalUrl('/autenticazione/callback')`, направляя пользователя в Личный кабинет студента (`apps/app`), где сессия сохраняется в защищенные cookies и открывается `/dashboard`.

### 3.2. Хелпер `getStudentPortalUrl()`
Расположен в [apps/landing/src/lib/urls.ts](file:///Users/krimson/PROJECTS/atena_school/apps/landing/src/lib/urls.ts):
* В локальном окружении (`NODE_ENV === 'development'` / `localhost`): автоматически использует порт `http://localhost:3002`.
* В продакшене: использует домен `https://app.atenaschool.com` (из `NEXT_PUBLIC_APP_URL`).
