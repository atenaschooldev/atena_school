# 🗂️ 03. Энамы, Реестр событий и Переменные

Все перечисления и типы определены в пакете `@atena/api-types/system/notifications`.

---

## 1. Системные перечисления (Enums)

### 1.1. Каналы доставки (`NotificationChannel`)
| ID | Код | Описание |
|---|---|---|
| `1` | `EMAIL` | Транзакционные письма через Resend API |
| `2` | `TELEGRAM` | Сообщения и интерактивные карточки в Telegram |

### 1.2. Типы системных уведомлений (`NotificationType`)
| ID | Код | Описание |
|---|---|---|
| `1` | `BOOKING_CONFIRMATION` | Подтверждение бронирования курса |
| `2` | `PAYMENT_RECEIPT` | Квитанция об успешной оплате (Stripe) |
| `3` | `PAYMENT_REMINDER` | Напоминание о необходимости доплаты в секретариате |
| `4` | `MEMBERSHIP_CARD` | Ежегодная членская карта ассоциации |
| `5` | `CONTACT_FORM` | Заявка / вопрос с контактной формы лендинга |

### 1.3. Типы получателей (`RecipientType`)
| ID | Код | Описание |
|---|---|---|
| `1` | `CUSTOMER` | Клиент (студент или родитель) |
| `2` | `ADMIN` | Администрация / секретариат школы |
| `3` | `TEACHER` | Преподаватель курса |
| `4` | `CUSTOM` | Произвольный email или Telegram Chat ID |

### 1.4. Статусы отправки (`NotificationStatus`)
| ID | Код | Описание |
|---|---|---|
| `1` | `SENT` | Успешно отправлено провайдеру |
| `2` | `FAILED` | Ошибка доставки / сбой провайдера |

---

## 2. Реестр системных событий (`SYSTEM_EVENTS_REGISTRY`)

| Ключ события (`event_key`) | Категория | Описание |
|---|---|---|
| `booking.created_stripe` | `payment` | Успешная оплата картой через Stripe Checkout |
| `booking.pending_cash` | `payment` | Новое бронирование с выбором оплаты в секретариате |
| `contact_form.submitted` | `lead` | Отправка контактной формы на лендинге |
| `booking.cancelled` | `booking` | Аннулирование или отказ от бронирования |
| `membership.card_issued` | `booking` | Генерация и выпуск ежегодного членского билета |

---

## 3. Полный справочник переменных Payload

Любая переменная доступна в шаблонах через синтаксис `{{key}}` или `{{nested.path}}`:

| Переменная | Описание | Пример значения |
|---|---|---|
| `purchaser_name` | Полное имя заказчика / родителя | `Mario Rossi` |
| `purchaser_email` | Email заказчика | `mario.rossi@gmail.com` |
| `purchaser_phone` | Телефон заказчика | `+39 333 1234567` |
| `purchaser_tax_code` | Codice Fiscale заказчика | `RSSMRA80A01H501U` |
| `student_name` | Имя студента (при `isForChild` — ребенка) | `Luca Rossi` |
| `student_email` | Email студента | `luca.rossi@gmail.com` |
| `student_tax_code` | Codice Fiscale студента | `RSSLKU15M01H501Y` |
| `is_for_child` | Флаг оформления на ребенка (`true`/`false`) | `true` |
| `course_name` | Название образовательного курса | `Kids English (6-7 anni)` |
| `start_date` / `date` | Дата начала занятий | `2026-10-06` |
| `lesson_schedule` | Расписание и дни занятий | `Martedì e Giovedì 17:00-18:00` |
| `course_price` | Стоимость курса (€) | `73.20` |
| `registration_fee` | Взнос за членскую карту (€) | `30.00` |
| `total_amount` | Итоговая сумма заказа (€) | `103.20` |
| `amount_paid` | Фактически оплаченная сумма | `103.20` |
| `is_paid_online` | Оплачено онлайн (`true`/`false`) | `true` |
| `payment_status` | Текстовый статус оплаты | `Pagato Online con Carta (Stripe)` |
| `booking_id` | Уникальный UUID бронирования | `10bde731-f620-4e16-a240-63bb08b86d70` |
| `dashboard_url` | Ссылка в Личный кабинет студента | `https://app.atenaschool.com` |
| `sender_name` | Имя отправителя формы обратной связи | `Giuseppe Verdi` |
| `sender_email` | Email отправителя формы | `giuseppe.verdi@gmail.com` |
| `sender_phone` | Телефон отправителя формы | `+39 333 9876543` |
| `message` | Текст сообщения из формы контактов | `Vorrei informazioni sui corsi serali.` |
| `membership_number` | Номер выданной членской карты | `ATN-2026-0042` |
| `valid_until` | Срок действия членства | `31/08/2027` |
