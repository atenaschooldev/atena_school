# 🔔 Atena School — Notification Engine Documentation Index

Добро пожаловать в официальную техническую документацию **модуля и движка уведомлений Atena School**.

Модуль спроектирован как высоконадежный, отказоустойчивый, мультиканальный (Email + Telegram) и мультитенантный (White-Label) движок, работающий по парадигме **Code-as-Configuration**.

---

## 📚 Навигация по разделам документации

| № | Раздел | Описание |
|---|---|---|
| **01** | [Архитектура и философия](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/01_ARCHITECTURE_AND_PHILOSOPHY.md) | Концепция Code-as-Configuration, отказ от триггеров в БД, паритет Dev/Prod, White-Label и бизнес-правило двух платежей (€30 + курс). |
| **02** | [Каналы доставки и транспорты](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/02_CHANNELS_AND_TRANSPORTS.md) | Resend API с экспоненциальным backoff/jitter, трехуровневый fallback, интерактивный Telegram-бот с callback-действиями в 1 клик и WhatsApp-роутингом. |
| **03** | [Энамы, события и переменные](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/03_ENUMS_AND_EVENT_REGISTRY.md) | Все системные перечисления (`NotificationChannel`, `NotificationType`, `RecipientType`), реестр `SYSTEM_EVENTS_REGISTRY` и полный справочник переменных. |
| **04** | [Движок триггеров и условий](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/04_TRIGGER_ENGINE_AND_CONDITIONS.md) | Декларативный реестр `SYSTEM_TRIGGERS`, матчер условий (`trigger-matcher.ts`), вложенные пути dot-notation и все поддерживаемые операторы. |
| **05** | [Визуальный конструктор и шаблоны](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/05_VISUAL_BLOCK_BUILDER_AND_TEMPLATES.md) | Компилятор визуальных блоков (`block-compiler.ts`), JSON-структура блоков, верстка для Email и форматирование Telegram HTML. |
| **06** | [Админка, аудит и логирование](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/06_ADMIN_UI_AND_AUDIT_LOGS.md) | Мониторинг в Admin CRM, Visual Builder, песочница тестовой отправки (Test Send) и структура таблицы `notification_logs`. |
| **07** | [Руководство разработчика](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/07_DEVELOPER_INTEGRATION_GUIDE.md) | Пошаговые инструкции: как добавить новое событие, зарегистрировать триггер, вызвать нотификацию в Server Action или сервисе. |
| **08** | [Бизнес-анализ, SA и QA Test Plan](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/08_BUSINESS_SYSTEM_ANALYSIS_AND_QA.md) | Спецификация для BA (Use Cases, бизнес-правила), SA (Sequence диаграммы, Data Mapping) и QA (матрица тест-кейсов TC-01..TC-10). |

---

## ⚡ Краткая схема взаимодействия

```
[Пользовательский флоу / Событие]
  │ (Чекаут Stripe, Оплата в секретариате, Заявка с сайта, Выпуск карты)
  ▼
[processNotificationTriggers(supabase, eventKey, payload)]
  │
  ├── 1. Сопоставление с SYSTEM_TRIGGERS (packages/core)
  ├── 2. Проверка JSON-условий (trigger-matcher.ts)
  ├── 3. Загрузка параметров школы (White-Label: school-profile, credentials)
  │
  ├──► [Email Транспорт] ──► Resend API (с retry & jitter) ──► notification_logs
  │      └── Block Compiler / Hardcoded HTML Fallback
  │
  └──► [Telegram Транспорт] ──► Telegram Bot API ──► notification_logs
         └── Card + Inline Buttons (fee, course, all, cancel, wa.me)
```
