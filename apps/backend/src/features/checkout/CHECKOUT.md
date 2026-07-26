# Модуль Публичного Чекаута и Оплат (`checkout`)

Этот модуль отвечает за публичный чекаут на лендинге, динамическую проверку оплаты членских взносов (€30), оформление бронирований без онлайн-оплаты («Paga in Sede»), инициализацию сессий Stripe Checkout и обработку входящих вебхуков Stripe.

---

## Архитектура и Структура файлов

```
checkout/
├── checkout.controller.ts        # Публичные эндпоинты чекаута и оплат
├── stripe-webhook.controller.ts  # Обработчик криптографически подписанных вебхуков Stripe
├── checkout.service.ts           # Сервис бизнес-логики чекаута и рассчетов
├── checkout.module.ts            # Модуль NestJS
└── CHECKOUT.md                   # Документация модуля
```

---

## 1. Контроллер Публичного Чекаута (`checkout.controller.ts`)

* **`POST /api/v1/checkout/check-fee`**
  * **Описание**: Проверяет, оплатил ли студент/родитель обязательный ежегодный ассоциативный взнос €30 за 2026/2027 учебный год.
  * **Входные данные**: `CheckFeeDto` (`taxCode`, `email`, `phone`).
  * **Ответ**: `{ success: true, annualFeePaid: boolean, userFound: boolean }`.

* **`POST /api/v1/checkout/reserve`**
  * **Описание**: Оформляет бронирование курса с оплатой наличными/POS на месте («Paga in Sede»).
  * **Безопасность**: Сумма рассчитывается сервером на основе цены курса в БД. Клиентские цены игнорируются.
  * **Ответ**: `{ success: true, bookingId: string, booking: Booking }`.

* **`POST /api/v1/checkout/create-stripe-session`**
  * **Описание**: Формирует черновую запись бронирования и создает сессию Stripe Checkout.
  * **Ответ**: `{ success: true, url: string, bookingId: string }`.

* **`POST /api/v1/checkout/verify-payment`**
  * **Описание**: Проверяет успешность сессии Stripe при возврате на экран успеха (`/checkout/success`).
  * **Ответ**: `{ success: true, booking: Booking }`.

---

## 2. Контроллер Вебхуков Stripe (`stripe-webhook.controller.ts`)

* **`POST /api/v1/webhooks/stripe`**
  * **Описание**: Принимает события от Stripe (`checkout.session.completed`).
  * **Безопасность**: Проверяет подпись `stripe-signature` через секретный ключ `STRIPE_WEBHOOK_SECRET`.
  * **Бизнес-логика**: Атомарно переводит статус заказа в `paid`, активирует запись в `annual_memberships` и генерирует календарь уроков.

* **`GET /api/v1/admin/bookings`**
  * **Описание**: Список всех бронирований для CRM (только admin).
* **`PATCH /api/v1/admin/bookings/:id/status`**
  * **Описание**: Обновление `payment_status` / `scheduling_status`.
* **`DELETE /api/v1/admin/bookings/:id`**
  * **Описание**: Удаляет бронирование вместе со связанными `lessons` и `annual_memberships`.

---

## 3. Сервисный Слой (`checkout.service.ts`)

* **`CheckoutService`**
  * Является единой точкой выполнения бизнес-правил публичного чекаута.
  * Взаимодействует с Supabase Admin Client для безопасного обхода RLS и взаимодействия с таблицами `courses`, `bookings`, `students`, `annual_memberships`.
  * Интегрирован с официальным SDK Stripe (`stripe`).
