# Обновленная схема базы данных — CRM Atena School

Эта схема спроектирована максимально простой, модульной и готовой к гибким изменениям. Все связи спроектированы так, чтобы избежать каскадных ошибок (Foreign Key Violations) и некорректных удалений.

---

## 1. Базовые сущности пользователей

Все учетные данные (почта, имя, роль) хранятся в единой таблице **`users`**. Профили студентов и преподавателей ссылаются на нее и содержат только свои специфичные поля.

### 1.1 Таблица `users` (Учетные записи)
* `id` (UUID, Primary Key): Уникальный идентификатор (маппится на Supabase Auth).
* `email` (Text, Unique, NOT NULL): Адрес электронной почты.
* `first_name` (Text, NOT NULL): Имя.
* `last_name` (Text, NOT NULL): Фамилия.
* `role` (Text, NOT NULL): Роль в системе (`'admin'`, `'teacher'`, `'student'`).
* `is_active` (Boolean, Default `true`): Флаг для мягкого удаления.
* `created_at` (Timestamptz, Default `now()`): Дата регистрации в системе.

### 1.2 Таблица `students` (Профили студентов)
Связана отношением "один-к-одному" с `users`.
* `student_id` (UUID, Primary Key, refs `users.id`, On Delete Cascade): Ссылка на учетную запись. При удалении аккаунта профиль ученика удаляется автоматически.
* `language_level` (Text, Default `'A1'`): Текущий уровень языка (`'A1'`, `'A2'`, `'B1'`, `'B2'`, `'C1'`, `'C2'`).
* `status` (Text, Default `'active'`): Статус обучения (`'active'`, `'paused'`, `'dropped'`, `'graduated'`).
* `registration_date` (Date, Default `now()`): Дата начала обучения (регистрации).
* `contract_id` (UUID, Optional, refs `documents.id`, On Delete Set Null): Ссылка на активный договор об обучении (при удалении договора поле зануляется).

### 1.3 Таблица `teachers` (Профили преподавателей)
Связана отношением "один-к-одному" с `users`.
* `teacher_id` (UUID, Primary Key, refs `users.id`, On Delete Cascade): Ссылка на учетную запись. При удалении аккаунта профиль учителя удаляется автоматически.
* `subject` (Text, Optional): Основной предмет преподавания.
* `experience` (Text, Optional): Опыт работы (одной строкой, например: "5 лет", "2 года и 3 месяца", "без опыта").
* `status` (Text, Default `'active'`): Статус работы (`'active'`, `'inactive'`).
* `hire_date` (Date, Default `now()`): Дата начала работы (приема в штат).

---

## 2. Учебные курсы и расписание

### 2.1 Таблица `courses` (Курсы)
* `id` (UUID, Primary Key, Default `gen_random_uuid()`)
* `name` (Text, NOT NULL): Название курса.
* `category` (Text, NOT NULL): Категория обучения (например, *Языки*, *IT*, *Дизайн*).
* `duration` (Text, NOT NULL): Длительность курса одной строкой (например, *"12 недель"*, *"36 часов"*, *"1 месяц"*).
* `price` (Numeric(10,2), NOT NULL): Стоимость курса.
* `status` (Text, Default `'active'`): Статус курса (`'active'`, `'draft'`, `'archived'`).
* `teacher_id` (UUID, Optional, refs `teachers.teacher_id`, On Delete Set Null): Ссылка на преподавателя курса (если учитель уволен/удален, курс сохраняется, но поле зануляется).
* `student_count` (Int, Default `0`): Счетчик студентов на курсе (денормализован для быстрого рендеринга во фронтенде).

### 2.2 Таблица `schedules` (Расписание и уроки)
Определяет параметры конкретных занятий.
* `id` (UUID, Primary Key, Default `gen_random_uuid()`)
* `course_id` (UUID, NOT NULL, refs `courses.id`, On Delete Cascade): Ссылка на курс. При удалении курса все его уроки удаляются.
* `teacher_id` (UUID, NOT NULL, refs `teachers.teacher_id`, On Delete Restrict): Преподаватель урока (удаление преподавателя заблокировано, пока на него завязаны запланированные уроки).
* `room` (Text, Optional): Кабинет (для офлайн занятий).
* `status` (Text, Default `'scheduled'`): Статус занятия (`'scheduled'`, `'completed'`, `'cancelled'`).
* `start_date` (Timestamptz, NOT NULL): Дата и время начала урока.
* `end_date` (Timestamptz, NOT NULL): Дата и время окончания урока.
* `lesson_type` (Text, Default `'offline'`): Формат урока (`'online'` — с генерацией Google Meet, `'offline'` — в здании школы).
* `meeting_url` (Text, Optional): Ссылка на онлайн-встречу Google Meet.

---

## 3. Документы и финансы

### 3.1 Таблица `documents` (Договоры и файлы)
Хранит информацию о сгенерированных контрактах, GDPR-согласиях и счетах.
* `id` (UUID, Primary Key, Default `gen_random_uuid()`)
* `document_number` (Text, Unique, NOT NULL): Номер/название документа (уникальный для избежания путаницы).
* `file_url` (Text, Optional): Ссылка на готовый PDF-файл в Google Drive / Supabase Storage.
* `student_name` (Text, NOT NULL): Имя и фамилия студента (исторический снимок на момент создания).
* `student_email` (Text, NOT NULL): Почта студента.
* `parent_name` (Text, Optional): Имя и фамилия родителя (если студент несовершеннолетний).
* `joining_date` (Date, Default `now()`): Дата присоединения / подписания.
* `template_data` (JSONB, NOT NULL): Метаданные (JSON) с полями, которые использовались для генерации PDF, чтобы документ можно было легко перегенерировать.

### 3.2 Таблица `payments` (Оплаты)
* `id` (UUID, Primary Key, Default `gen_random_uuid()`)
* `payment_number` (Text, Unique, NOT NULL): Номер счета или чека.
* `student_id` (UUID, NOT NULL, refs `students.student_id`, On Delete Restrict): Ссылка на студента (удаление студента невозможно при наличии проведенных финансовых записей).
* `price` (Numeric(10,2), NOT NULL): Сумма платежа.
* `payment_type` (Text, NOT NULL): Тип оплаты (`'invoice'` — счет на оплату, `'receipt'` — чек/квитанция).
* `status` (Text, Default `'pending'`): Статус оплаты (`'pending'`, `'paid'`, `'cancelled'`).
* `payment_date` (Timestamptz, Default `now()`): Дата создания или проведения платежа.

---

## 4. Журнал успеваемости и посещаемости

### 4.1 Таблица `grades` (Оценки)
* `id` (UUID, Primary Key, Default `gen_random_uuid()`)
* `student_id` (UUID, NOT NULL, refs `students.student_id`, On Delete Cascade): Ученик. При удалении ученика его оценки удаляются каскадно.
* `course_id` (UUID, NOT NULL, refs `courses.id`, On Delete Cascade): Ссылка на курс.
* `teacher_id` (UUID, NOT NULL, refs `teachers.teacher_id`, On Delete Restrict): Преподаватель, выставивший оценку.
* `score` (Numeric(4,1), NOT NULL): Оценка (балл).
* `date` (Date, Default `now()`): Дата получения оценки.
* `note` (Text, Optional): Примечание преподавателя.

### 4.2 Таблица `attendance` (Посещаемость)
* `id` (UUID, Primary Key, Default `gen_random_uuid()`)
* `student_id` (UUID, NOT NULL, refs `students.student_id`, On Delete Cascade): Ученик.
* `teacher_id` (UUID, NOT NULL, refs `teachers.teacher_id`, On Delete Restrict): Учитель, отметивший присутствие.
* `schedule_id` (UUID, NOT NULL, refs `schedules.id`, On Delete Cascade): Конкретный урок.
* `status` (Text, NOT NULL): Статус присутствия (`'present'`, `'absent'`, `'late'`, `'excused'`).
* `note` (Text, Optional): Примечание/причина пропуска.
* `date` (Date, Default `now()`): Дата проведения занятия.

---

## 5. Аудит системы

### 5.1 Таблица `activity_logs` (Журнал активности)
Ориентирован на полную диагностику изменений и удобство расследования инцидентов.
* `id` (UUID, Primary Key, Default `gen_random_uuid()`)
* `created_at` (Timestamptz, Default `now()`): Дата и время действия.
* `operator_id` (UUID, Optional, refs `users.id`, On Delete Set Null): Ссылка на пользователя (администратор, учитель и т.д.), совершившего действие.
* `operator_name` (Text, NOT NULL): Имя и фамилия оператора (снимок для быстрого чтения без JOIN-ов).
* `action` (Text, NOT NULL): Действие (`'create'`, `'update'`, `'delete'`, `'cancel'`).
* `module` (Text, NOT NULL): Модуль системы (`'students'`, `'teachers'`, `'courses'`, `'schedules'`, `'payments'`).
* `target_id` (UUID, Optional): Идентификатор измененного объекта.
* `details` (JSONB, NOT NULL): JSON с деталями изменений (например, старые и новые значения полей).
* `status` (Text, Default `'success'`): Статус выполнения операции (`'success'`, `'failed'`, `'cancelled'`).
