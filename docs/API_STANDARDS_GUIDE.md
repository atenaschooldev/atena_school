# Atena School — API Standards & Architecture Guide

> **Статус документа:** Эталонный стандарт архитектуры API, валидации, безопасности и Developer Experience (DX) для всей экосистемы Atena School (`apps/landing`, `apps/app`, `apps/admin`, `apps/backend`, `packages/*`).

---

## 1. Пространство имён API (API Namespaces)

Все эндпоинты разделены по доменным приложениям для устранения конфликтов прав доступа и ясности маршрутизации:

| Пространство имён | Назначение | Клиенты / Приложения | Аутентификация |
| :--- | :--- | :--- | :--- |
| **`/api/landing/*`** | Публичные методы витрины и чекаута | `apps/landing` (Next.js) | Публичный доступ + IP Rate Limit |
| **`/api/app/*`** | Личный кабинет студента / родителя | `apps/app` (Next.js / Mobile) | Supabase Auth (JWT Bearer Token / Cookie) |
| **`/api/admin/*`** | CRM для секретариата и дирекции | `apps/admin` (Vite / React / Desktop) | Admin Role RBAC (JWT Bearer) |

---

## 2. Стандарт формата ответов (Contract Standardization)

### 2.1 Успешный ответ (200 / 201)
Всегда содержит `success: true` и типизированный объект данных в корне (или в именованном поле):

```json
{
  "success": true,
  "booking": {
    "id": "5a6c0168-9f18-4f30-940e-bc45851ebf2d",
    "service_title": "Beginners / Starters (8-10 anni)",
    "first_lesson_date": "2026-09-30",
    "schedule_time": "17:00",
    "course_price": 97.60,
    "registration_fee": 30.00,
    "amount_paid": 127.60,
    "payment_status": 0,
    "payment_status_label": "pending",
    "payment_method": 2,
    "payment_method_label": "cash",
    "purchaser_first_name": "Andrii",
    "purchaser_last_name": "Petukhov",
    "purchaser_email": "petukhov.1205@gmail.com",
    "purchaser_phone": "+393522120502",
    "purchaser_tax_code": "PTKNDR02T05Z138I",
    "is_for_child": true,
    "student_first_name": "Viktoria",
    "student_last_name": "Petukhova",
    "student_tax_code": "PTKVKI70E43H501I",
    "student_birth_date": "2002-05-12",
    "payments": [
      {
        "id": "9f184f30-940e-4585-1ebf-2d5a6c0168bc",
        "type": "payment",
        "amount": 97.60,
        "status": "pending",
        "payment_method": "cash",
        "created_at": "2026-09-16T01:35:00Z"
      },
      {
        "id": "1ebf2d5a-6c01-68bc-9f18-4f30940e4585",
        "type": "registration_fee",
        "amount": 30.00,
        "status": "pending",
        "payment_method": "cash",
        "academic_year": "2025/2026",
        "created_at": "2026-09-16T01:35:00Z"
      }
    ],
    "lessons_count": 8,
    "lessons": [
      {
        "id": "...",
        "starts_at": "2026-09-30T17:00:00Z",
        "ends_at": "2026-09-30T18:00:00Z",
        "status": 1
      }
    ]
  }
}
```

### 2.2 Ответ с ошибкой (400 / 401 / 403 / 404 / 429 / 500)
- Все технические сообщения об ошибках — строго на **английском языке**.
- Содержит `success: false`, строку `error` и опциональный словарь `details` для полей форм:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email address format"],
    "taxCode": ["Codice Fiscale is invalid"]
  }
}
```

---

## 3. Безопасность и архитектура Zero-Trust

1. **Сервер никогда не доверяет ценам клиента:**
   - Поля цен, переданные с фронтенда, игнорируются.
   - Бэкенд запрашивает актуальный `price` курса из базы данных и вычисляет итоговую сумму на сервере.

2. **Обязательный взнос (€30 Quota Iscrizione):**
   - На каждый заказ создаётся ровно **два платежа в `payments`**:
     1. `type = 'payment'` (стоимость курса)
     2. `type = 'registration_fee'` (годовой взнос €30, если не был оплачен в текущем учебном году)
   - Проверка наличия оплаченного взноса выполняется сервером через SQL-запрос по данным **студента** (при `isForChild` — ребёнка, а не родителя).

3. **In-Memory IP Rate Limiting:**
   - Публичные POST-эндпоинты чекаута и контактов защищены скользящим окном запросов (`ipRateLimit`).
   - При превышении лимита возвращается `HTTP 429 Too Many Requests`.

---

## 4. Оптимизация сети и клиентский UX (Network Optimization)

### 4.1 Изоляция триггеров API (Fee Check)
- Запрос проверки квоты (`POST /api/landing/checkout/check-fee`) слушает **исключительно** поле `taxCode` (или `studentTaxCode`).
- Редактирование полей `firstName`, `lastName`, `email`, `phone`, `birthDate`, `notes` **не вызывает сетевых запросов**.

### 4.2 Пре-валидация и дебаунс:
- Перед отправкой запроса `isValidCodiceFiscale(cf)` проверяет длину строки (16 символов для физлиц, 11 цифр для юрлиц). Если длина меньше — запрос блокируется на клиенте.
- Дебаунс 400 мс предотвращает спам при быстром вводе.
- Кэш в памяти (`feeCacheRef`) мгновенно возвращает результат без повторного обращения к серверу.

### 4.3 Устранение дублей при F5:
- При загрузке страницы черновик восстанавливается через `reset(...)`, а реактивный `useEffect` выполняет проверку **ровно 1 раз**.

---

## 5. Стандарт сохранения черновика формы (Big Tech Draft Persistence)

Для предотвращения потери введённых данных при случайной перезагрузке (F5) используется `sessionStorage`:

1. **Ключ хранилища:** `atena_checkout_draft_${courseId}` (изолирует черновики разных курсов).
2. **Auto-Save:** Подписка на `formMethods.watch` с дебаунсом 300 мс (сохраняет только непустые данные).
3. **GDPR / Privacy:** Данные живут только в рамках активной вкладки и не остаются на чужих устройствах после закрытия браузера.
4. **Lifecycle Cleanup:** Черновик автоматически удаляется при:
   - Успешном бронировании (`handleBook` -> `clearDraft()`)
   - Переходе на оплату Stripe (`handlePay` -> `clearDraft()`)
   - Загрузке страницы квитанции (`/checkout/success/:id`)

---

## 6. Валидация (Zod & Data Contracts)

Все схемы централизованы в [`packages/validators`](file:///Users/krimson/PROJECTS/atena_school/packages/validators/src/index.ts):

1. **Телефоны (E.164):**
   - Функция `isValidPhone` поддерживает любые международные номера от 7 до 15 цифр (`+380...`, `+1...`, `+44...`, `+39...`).
2. **Дата рождения (`isValidBirthDate`):**
   - Проверяет дату в прошлом (не старше 100 лет).
   - Обязательна только для студента при активном `isForChild = true`. Для взрослого (`isForChild = false`) поле опционально.
3. **UX без агрессивных ошибок:**
   - Набор текста не вызывает мгновенной подсветки соседних незаполненных полей (`shouldValidate: false`).
   - При вводе в поле ошибка снимается точечно (`clearErrors(fieldName)`).
   - Полная валидация выполняется при клике на кнопку отправки формы.

---

## 7. SDK клиент (`@atena/api-client`)

Для типобезопасного взаимодействия между фронтендом, автотестами и бэкендом используется клиент:

```ts
import { createApiClient } from '@atena/api-client';

const api = createApiClient();

// Публичные методы лендинга:
const { courses } = await api.landing.courses.getAll();
const { item } = await api.landing.courses.getById('c1-advanced');
const feeStatus = await api.landing.checkout.checkFee({ taxCode: 'RSSMRA80A01H501T' });
const reservation = await api.landing.checkout.reserve(payload);
const bookingDetails = await api.landing.bookings.getById(bookingId);
```

---

## 8. Чек-лист для Личного Кабинета (`apps/app`) и CRM (`apps/admin`)

При разработке и отладке страниц ЛК и CRM следовать правилам:

- [ ] Использовать методы из `@atena/api-client` вместо нетипизированных `fetch()`.
- [ ] Всегда импортировать `calculateLessonDates()` из `@atena/utils` для генерации дат уроков.
- [ ] Искать клиентов по `purchaser_email` / `purchaser_phone` / `purchaser_tax_code`.
- [ ] Все статусы отображать через лейблы (`payment_status_label`, `payment_method_label`).
- [ ] При редактировании форм использовать дебаунс и не запускать валидацию всего объекта на каждый onChange.
- [ ] Все ошибки API возвращать в формате `{ success: false, error: "..." }`.

---

## 9. Пошаговый план внедрения для Личного Кабинета (`apps/app` & `/api/app/*`)

Личный кабинет обслуживает студентов и родителей. Все маршруты должны быть защищены JWT-токеном Supabase Auth.

### 9.1 Маршруты API (`/api/app/*`)
1. **`GET /api/app/dashboard`**:
   - Возвращает: текущие активные курсы, ближайший запланированный урок, общий прогресс, статус оплаты квоты.
   - Фильтрация: строго по `user_id` авторизованного студента или по привязанному `student_tax_code`.
2. **`GET /api/app/profile`** и **`PATCH /api/app/profile`**:
   - Просмотр и редактирование данных профиля (имя, фамилия, телефон с E.164-валидацией, адрес).
   - Запрещено менять `tax_code` напрямую без валидации.
3. **`GET /api/app/bookings`** и **`GET /api/app/bookings/:id`**:
   - Список покупок и деталка конкретной брони.
   - Обогащение: `payments: [...]`, `course_price`, `registration_fee`, `payment_status_label`.
4. **`GET /api/app/schedule`** (или `/api/app/lessons`):
   - Календарная сетка уроков студента с полями `starts_at`, `ends_at`, `status_label`, `attendance_label`, ссылкой на онлайн-класс (Zoom/Meet при `location_type = ONLINE`).
5. **`POST /api/app/lessons/:id/reschedule`**:
   - Запрос на перенос урока (доступно только для индивидуальных курсов с гибким графиком `schedule_type = FLEXIBLE`).

### 9.2 Правила для AI агента при реализации ЛК:
- 🔒 **Zero-Trust User Scoping:** Всегда извлекать `user.id` из `supabase.auth.getUser(token)` на бэкенде. Запрещено принимать `userId` из параметров тела запроса.
- 📦 **SDK интеграция:** Добавить в `@atena/api-client` модуль `api.app.*` и использовать его во всех хуках `apps/app/src/features/*`.
- ⚡ **Оптимизация:** Использовать SWR или React Query с кэшированием для дашборда и расписания.

---

## 10. Пошаговый план внедрения для CRM Администратора (`apps/admin` & `/api/admin/*`)

CRM обслуживает секретаря и директора школы. Все маршруты требуют роли `admin` или `superadmin`.

### 10.1 Маршруты API (`/api/admin/*`)
1. **`/api/admin/courses` (CRUD)**:
   - Создание, редактирование, архивация курсов, настройка цен, длительности уроков и расписания.
2. **`/api/admin/bookings`**:
   - Список всех бронирований с фильтрами по статусу, датам, курсам.
   - Ручное подтверждение оплаты в школе (наличные / POS-терминал) с переводом статуса в `PAID (3)`.
3. **`/api/admin/payments`**:
   - Финансовый журнал: просмотр транзакций, отметка оплаты годового взноса €30 (`type = 'registration_fee'`), фискализация.
4. **`/api/admin/students` и `/api/admin/teachers`**:
   - Карточки учеников (включая историю курсов, посещаемость, контакты родителей при `is_for_child`).
   - Карточки преподавателей (назначение на курсы, ставки, расписание).
5. **`/api/admin/schedules` и `/api/admin/lessons`**:
   - Генерация сетки уроков через `@atena/utils` (`calculateLessonDates()`).
   - Журнал посещаемости уроков (отметка `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
6. **`/api/admin/settings/payment-gateway`**:
   - Управление интеграцией со Stripe (включение/отключение, переключение Live/Test ключей).

### 10.2 Правила для AI агента при реализации CRM:
- 🛡️ **RBAC Guard:** Все NestJS контроллеры в `apps/backend/src/features/*/*.admin.controller.ts` должны быть защищены `@UseGuards(JwtAuthGuard, RolesGuard)` с аннотацией `@Roles('admin', 'superadmin')`.
- 💰 **Два платежа:** При ручном создании брони через админку **всегда** генерировать две записи в `payments`: `course_payment` + `registration_fee` (если не оплачен).
- 📅 **Единый генератор дат:** Для создания уроков в календаре использовать **только** `calculateLessonDates()` из `@atena/utils`. Никаких кастомных алгоритмов генерации дат.

