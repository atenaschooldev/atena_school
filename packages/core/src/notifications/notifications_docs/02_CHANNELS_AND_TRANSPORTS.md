# 🚚 02. Каналы доставки и транспорты

Движок поддерживает два ключевых транспорта: **Email (Resend)** и **Telegram (Интерактивный секретарь)**.

---

## 1. ✉️ Email Транспорт (Resend API)

### 1.1. Отказоустойчивость: Exponential Backoff & Jitter
Все HTTP-вызовы к Resend API в `@atena/core` выполняются через утилиту `fetchWithRetry`:
* **Условия повтора:** транзиентные сетевые ошибки, `429 (Rate Limit)` или `5xx (Server Error)`.
* **Стратегия задержки:** `delay = baseDelayMs * 2^(attempt - 1) + jitter` (где `baseDelayMs = 350ms`, до 3 попыток со случайным джиттером от 0 до 100ms: 350ms $\rightarrow$ 700ms $\rightarrow$ 1400ms).
* Исключаются лавинообразные падения при пиковых нагрузках во время рекламных кампаний.

### 1.2. Трехуровневая система рендеринга (Multi-Tier Fallback)
1. **Tier 1 — Dynamic Visual Blocks:** Если в БД для шаблона задан `blocks_config` (настроенный администратором через визуальный редактор), письмо компилируется из дерева блоков с брендовыми цветами и стилями школы.
2. **Tier 2 — Default Blocks Preset:** Если кастомные блоки отсутствуют, движок берет дефолтный пресет блоков для кода шаблона из `getDefaultBlocksForTemplate()`.
3. **Tier 3 — Native Hardcoded Fallback:** Если запись в БД повреждена или отсутствует, вызываются встроенные шаблоны из [email-templates.ts](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/email-templates.ts). Письмо клиенту гарантированно доставляется в любом случае!

### 1.3. Обработка Webhook-событий Resend (Svix Signature Verification)
Контроллер `ResendWebhookController` в `apps/backend` (доступен по путям `/webhooks/resend`, `/landing/mail/webhook`, `/mail/webhook`) обрабатывает жизненный цикл доставки писем:
* **События:** `email.sent`, `email.delivered`, `email.delivery_delayed`, `email.complained`, `email.bounced`, `email.opened`, `email.clicked`.
* **Верификация подписи Svix:**
  * Заголовки: `svix-id`, `svix-timestamp`, `svix-signature`.
  * Защита от Replay-атак: отклонение вебхуков со сдвигом метки времени более 300 секунд (5 минут).
  * Вычисление HMAC SHA-256 от строки `${msgId}.${msgTimestamp}.${rawBody}` с секретом `whsec_...` (загружаемым из `integration_secrets` или `RESEND_WEBHOOK_SECRET`).
  * Безопасное побайтовое сравнение в константном времени (`safeTimingSafeEqual`), исключающее timing-атаки.
* **Обновление статусов в БД:** При получении `email.bounced` или `email.complained` статус записи в `notification_logs` автоматически переводится в `FAILED` (2) с сохранением кода ошибки почтового сервера в объекте `response`. При успешных событиях сохраняется таймлайн в `response.webhook_events`.

---

## 2. 🤖 Telegram Транспорт (Интерактивный секретарь)

Telegram-модуль — это операционный пульт управления для секретариата школы.

### 2.1. Протокол Callback Data и интерактивные кнопки
Инлайн-кнопки формируются по строгому протоколу:
```
action:bookingId:locale
```
Примеры:
* `fee:10bde731-f620-4e16-a240-63bb08b86d70:it` — отметка об оплате ежегодного членского взноса €30.
* `course:10bde731-f620-4e16-a240-63bb08b86d70:it` — подтверждение оплаты курса в секретариате.
* `all:10bde731-f620-4e16-a240-63bb08b86d70:it` — закрытие всего остатка задолженности.
* `cancel:10bde731-f620-4e16-a240-63bb08b86d70:it` — аннулирование брони.
* `lang:10bde731-f620-4e16-a240-63bb08b86d70:en` — мгновенное переключение языка карточки (`it` $\leftrightarrow$ `en`).

### 2.2. Бизнес-логика обработчика `handleTelegramCallbackAction`
При клике на кнопки секретарем выполняются атомарные бизнес-операции:
1. **Действие `fee` (Salda Quota €30):**
   * Платеж типа `registration_fee` переводится в `status = PAID`.
   * Поле `annual_fee_paid` в профиле `students` становится `true`.
   * В таблице `annual_memberships` создается или активируется запись членства с номером билета (`membership_number`) на текущий учебный год (`academic_year`).
2. **Действие `course` (Salda Corso):**
   * Платеж типа `payment` переводится в `status = PAID`.
   * Обновляется `bookings.payment_status = PAID`.
3. **Действие `all` (Salda Tutto):**
   * Закрываются оба платежа (`registration_fee` и `course`), подтверждается бронь и выпускается членство.
4. **Действие `cancel` (Annulla Iscrizione):**
   * Бронирование переводится в `booking_status = CANCELLED`.
   * Связанные уроки в `lessons` помечаются как отмененные (`status = CANCELLED`).

### 2.3. Механика обновления сообщений (In-Place Edit)
При нажатии на кнопку секретарем:
1. Вызывается Telegram API `answerCallbackQuery` для мгновенного отображения всплывающего Toast-уведомления (например, *"✅ Saldo totale confermato!"*).
2. Метод `editMessageText` обновляет текст исходной карточки на месте: добавляется отметка времени и никнейм администратора, подтвердившего операцию (`✅ Quota registrata alle 14:35 da @mario_segreteria`).
3. Клавиатура кнопок динамически пересчитывается (оплаченные кнопки исчезают).
4. **Результат:** в чате нет спама новыми сообщениями, история сохраняет прозрачный аудит.

### 2.4. Прямые ссылки (Deep Linking)
* **💬 WhatsApp:** прямая ссылка `https://wa.me/{cleanPhone}` с валидацией префикса и очисткой нецифровых символов.
* **💳 Stripe:** ссылка на платеж в Stripe Dashboard по `payment_intent_id`.
* **🌐 Admin CRM:** глубокая ссылка на бронирование в CRM-системе (`{adminUrl}/prenotazioni`).

### 2.5. Мультиканальная маршрутизация, безопасность и фильтры
* **Авторизация:** Проверка ID чата и пользователей через `TELEGRAM_ALLOWED_USER_IDS` и `TELEGRAM_CHAT_ID`. Неавторизованные нажатия отклоняются с Toast-уведомлением *"⛔ Accesso non autorizzato"*.
* **Мульти-чат:** Поддержка отправки сразу нескольким администраторам через массив `chat_ids` или строку с разделением запятыми / пробелами.
* **Фильтрация по типам уведомлений из настроек `integration_secrets`:**
  * `notifyBookings: false` — отключить алерты броней.
  * `notifyPayments: false` — отключить алерты Stripe.
  * `notifyCash: false` — отключить алерты броней с оплатой на месте.
  * `notifyLeads: false` — отключить алерты заявок с сайта.
