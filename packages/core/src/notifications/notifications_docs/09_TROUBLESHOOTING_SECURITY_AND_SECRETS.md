# 🛡️ 09. Безопасность, Секреты и Траблшутинг (Security, Secrets & Troubleshooting)

Данный документ описывает механизмы защиты, иерархию загрузки учетных данных (White-Label Credentials), политики безопасности и готовый чеклист устранения неполадок.

---

## 1. Иерархия загрузки учетных данных (Credentials Resolution Hierarchy)

Система поддерживает динамическую смену API-ключей и параметров школы без перезапуска серверов и повторного билда:

```
[Попытка отправки сообщения / вызов API]
  │
  ├── 1. Таблица integration_secrets (Зашифрованные / динамические ключи в Supabase)
  │      └── resend_api_key, resend_from_email, telegram_bot_token, telegram_chat_ids
  │
  ├── 2. Таблица app_settings (Общие настройки White-Label платформы)
  │      └── school_name, legal_address, iban, site_url, app_url, admin_url
  │
  └── 3. Fallback на переменные окружения (process.env)
         └── RESEND_API_KEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_APP_URL
```

### Маскирование секретов в UI CRM:
* При чтении через Admin API ключи маскируются (`re_123***abc`, `712345***:AA***`).
* Секреты никогда не передаются в открытом виде на клиент браузера.

---

## 2. Механизмы защиты и безопасность (Security & Anti-Abuse)

### 2.1. Ограничение частоты запросов (Sliding-Window Rate Limiting)
На всех публичных эндпоинтах лендинга (`apps/landing/src/lib/server/rate-limit.ts`) действует защита от спама:
* **Лимит:** максимум 5 запросов в минуту с одного IP-адреса.
* **Ответ при превышении:** HTTP 429 Too Many Requests с обязательным заголовком `Retry-After: 60`.
* **Защищаемые маршруты:**
  * `/landing/auth/magic-link`
  * `/landing/contact`
  * `/landing/checkout/reserve`
  * `/landing/checkout/apply-promo`
  * `/landing/checkout/check-fee`

### 2.2. Защита Telegram Webhook
1. **Secret Token Header:** входящий запрос от Telegram Bot API проверяется на заголовок `x-telegram-bot-api-secret-token` (значение `TELEGRAM_WEBHOOK_SECRET`). При несовпадении возвращается `401 Unauthorized`.
2. **Whitelist администраторов:** при клике по инлайн-кнопкам (`handleTelegramCallbackAction`) проверяется, входит ли `callback_query.from.id` в список `TELEGRAM_ALLOWED_USER_IDS` или `TELEGRAM_CHAT_ID`. Неавторизованные пользователи получают отказ без изменения состояния БД.

### 2.3. Защита Resend Webhook (Svix HMAC-SHA256)
1. **Защита от Replay-атак:** вычисление дельты `|now - svix-timestamp|`. Если разница превышает 300 секунд (5 минут), запрос отбрасывается.
2. **Защита от Timing-атак:** сигнатуры сравниваются через побайтовую константную функцию `safeTimingSafeEqual`.

### 2.4. Разграничение доступа (RBAC & RLS)
* **PostgreSQL RLS:** таблицы `notification_templates`, `notification_triggers`, `notification_logs` закрыты от анонимного доступа `anon` и доступны только через `service_role` или аутентифицированным пользователям с ролью `admin`.
* **NestJS Guards:** эндпоинты `/admin/notifications/*` защищены связкой `AuthGuard` (валидация JWT токена Supabase) и `RolesGuard` (роли `admin`, `secretary`).

---

## 3. Гайд по устранению неполадок (Troubleshooting & FAQs)

### ❓ Проблема 1: Письма не уходят (Resend API Error 403 / 401)
* **Причина:** Не верифицирован домен отправителя или указан некорректный `fromEmail`.
* **Чеклист проверки:**
  1. Проверить в Resend Dashboard статус домена (DKIM, SPF, MX).
  2. Убедиться, что `fromEmail` использует подтвержденный домен (например, `info@atenaschool.com` или `onboarding@resend.dev` в тестовом режиме).
  3. Проверить корректность ключа `RESEND_API_KEY` в таблице `integration_secrets` или `.env`.

### ❓ Проблема 2: В Telegram не приходят уведомления
* **Причина:** Неверный Chat ID, бот не добавлен в группу или включен фильтр уведомлений.
* **Чеклист проверки:**
  1. Для супергрупп Chat ID **всегда начинается с минуса** (например `-1002345678901`).
  2. Убедиться, что бот добавлен в чат и назначен администратором с правом публикации сообщений.
  3. Проверить настройки фильтров в `integration_secrets`: если `notifyBookings: false` или `notifyCash: false`, системные алерты намеренно подавляются.

### ❓ Проблема 3: В отправленном письме видны незаполненные теги `{{...}}`
* **Причина:** Несовпадение имени переменной в шаблоне и переданном словаре `payload`.
* **Чеклист проверки:**
  1. Обратитесь к таблице переменных в [03_ENUMS_AND_EVENT_REGISTRY.md](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/03_ENUMS_AND_EVENT_REGISTRY.md).
  2. Обратите внимание: для email плательщика используется `purchaser_email` (а не просто `email`), для Codice Fiscale — `purchaser_tax_code` / `student_tax_code`.

### ❓ Проблема 4: Вебхуки от Resend возвращают 400 Bad Request
* **Причина:** Несовпадение секретного ключа вебхука Svix.
* **Чеклист проверки:**
  1. Скопировать `Signing Secret` из Resend Dashboard (начинается с `whsec_...`).
  2. Сохранить его в `integration_secrets.resend.webhookSecret` или переменную `RESEND_WEBHOOK_SECRET`.
  3. Убедиться, что URL вебхука в панели Resend указывает на `/webhooks/resend`.
