# Модуль Оплат (`payments`)

Этот модуль отвечает за финансовую отчетность, выставление инвойсов и регистрацию квитанций об оплате от студентов.

---

## Архитектура и Структура файлов

```
payments/
├── domain/
│   ├── payment.entity.ts                # Доменная сущность PaymentEntity
│   └── payments.repository.interface.ts # Интерфейс репозитория PaymentsRepository
├── impl/
│   └── prisma-payments.repository.ts    # Реализация репозитория на Prisma
├── payments.controller.ts                # Маршруты работы с финансами
├── payments.service.ts                   # Бизнес-логика оплат
└── payments.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`PaymentEntity`** ([payment.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/payments/domain/payment.entity.ts))
  Доменная модель транзакции оплаты. Поля:
  * `id`: Уникальный идентификатор платежа (UUID).
  * `paymentNumber`: Уникальный номер чека или счета (строка).
  * `studentId`: ID плательщика (студента).
  * `price`: Сумма транзакции (в коде `number`, в БД `Decimal`).
  * `paymentType`: Тип платежа (`invoice` — выставленный счет, `receipt` — чек/квитанция).
  * `status`: Статус транзакции (`pending` — ожидает оплаты, `paid` — оплачен, `cancelled` — отменен).
  * `paymentDate`: Дата и время проведения платежа.
  * `studentName`: ФИО студента (подгружается при выборке).

* **`PaymentsRepository`** ([payments.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/payments/domain/payments.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findMany()` — список всех платежей (включая имена студентов).
  * `findOne(id)` — получить детали отдельной транзакции.
  * `create(data)` — зарегистрировать новый платеж или выставить инвойс.
  * `update(id, data)` — обновить статус оплаты или сумму.
  * `delete(id)` — удалить запись о транзакции.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaPaymentsRepository`** ([prisma-payments.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/payments/impl/prisma-payments.repository.ts))
  Реализация на Prisma. Автоматически связывает (`include: { student: { include: { user: true } } }`) таблицу оплат со студенческим профилем и пользователем для отображения ФИО в списке. Преобразует типы данных из формата СУБД.

---

## 3. Сервисный слой (`payments.service.ts`)

* **`PaymentsService`** ([payments.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/payments/payments.service.ts))
  * Посредник бизнес-логики.
  * Предоставляет методы для работы с финансами, автоматически форматируя и округляя суммы.
  * Приводит ответы к согласованной со спецификацией схеме.

---

## 4. Контроллер (`payments.controller.ts`)

Определяет эндпоинты API:

* **`GET /payments`** — получить список всех транзакций (доступ: `admin`, `student`, `parent`).
* **`GET /payments/:id`** — получить детальную информацию о транзакции.
* **`POST /payments`** — выставить счет или внести платеж (доступ: только `admin`).
