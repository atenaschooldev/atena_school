# 🔔 Atena School — Notification Engine Documentation Index

Добро пожаловать в официальную техническую документацию **модуля и движка уведомлений Atena School**.

Модуль спроектирован как высоконадежный, отказоустойчивый, мультиканальный (Email + Telegram) и мультитенантный (White-Label) движок, сочетающий **Code-as-Configuration** и динамическую кастомизацию шаблонов.

---

## 📚 Навигация по разделам документации

| № | Раздел | Описание |
|---|---|---|
| **01** | [Архитектура и философия](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/01_ARCHITECTURE_AND_PHILOSOPHY.md) | Концепция Code-as-Configuration, отказ от SQL-триггеров в БД, архитектура Core/Backend, White-Label и правило двух платежей (€30 + курс). |
| **02** | [Каналы доставки и транспорты](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/02_CHANNELS_AND_TRANSPORTS.md) | Resend API с экспоненциальным backoff/jitter, трехуровневый fallback, интерактивный Telegram-бот с callback-действиями в 1 клик и WhatsApp-роутингом. |
| **03** | [Энамы, события и переменные](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/03_ENUMS_AND_EVENT_REGISTRY.md) | Все системные перечисления (`NotificationChannel`, `NotificationType`, `RecipientType`), реестр `SYSTEM_EVENTS_REGISTRY` и полный справочник переменных. |
| **04** | [Движок триггеров и условий](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/04_TRIGGER_ENGINE_AND_CONDITIONS.md) | Декларативные триггеры `SYSTEM_TRIGGERS`, динамические триггеры в БД, матчер условий (`trigger-matcher.ts`), dot-notation и все операторы. |
| **05** | [Визуальный конструктор и шаблоны](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/05_VISUAL_BLOCK_BUILDER_AND_TEMPLATES.md) | Компилятор визуальных блоков (`block-compiler.ts`), JSON-структура блоков, детальная спецификация всех 16 типов блоков и настройки темы. |
| **06** | [Админка, аудит и логирование](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/06_ADMIN_UI_AND_AUDIT_LOGS.md) | Панель управления Admin CRM, No-Code Visual Builder, песочница тестовой отправки (Test Send) и структура таблиц `notification_templates`, `notification_triggers`, `notification_logs`. |
| **07** | [Руководство разработчика](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/07_DEVELOPER_INTEGRATION_GUIDE.md) | Пошаговые инструкции: как отправить уведомление, добавить новое событие, зарегистрировать триггер, вызвать нотификацию в Server Action или сервисе. |
| **08** | [Бизнес-анализ, SA и QA Test Plan](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/08_BUSINESS_SYSTEM_ANALYSIS_AND_QA.md) | Спецификация для BA (Use Cases, бизнес-правила), SA (Sequence диаграммы, Data Mapping) и QA (матрица тест-кейсов TC-01..TC-10). |
| **09** | [Безопасность, Секреты и Траблшутинг](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/notifications_docs/09_TROUBLESHOOTING_SECURITY_AND_SECRETS.md) | Приоритеты загрузки учетных данных (White-Label), Rate Limiting, защита вебхуков (Svix/Telegram), RLS-политики и готовый чеклист устранения неполадок. |

---

## ⚡ Краткая схема взаимодействия

```
[Пользовательский флоу / Событие]
  │ (Чекаут Stripe, Оплата в секретариате, Заявка с сайта, Выпуск карты)
  ▼
[processNotificationTriggers(supabase, eventKey, payload)]
  │
  ├── 1. Сопоставление с SYSTEM_TRIGGERS и БД-триггерами
  ├── 2. Проверка JSON-условий (trigger-matcher.ts)
  ├── 3. Загрузка параметров школы (White-Label: school-profile, credentials)
  │
  ├──► [Email Транспорт] ──► Resend API (с retry & jitter) ──► notification_logs
  │      └── Block Compiler / Hardcoded HTML Fallback
  │
  └──► [Telegram Транспорт] ──► Telegram Bot API ──► notification_logs
         └── Card + Inline Buttons (fee, course, all, cancel, wa.me)
```
