# 📋 Интеграция Dynamic Forms Engine на Лендинге (`apps/landing`)

Документация по взаимодействию веб-приложения лендинга с движком динамических форм (`@atena/core`), чекаутом бронирования и сохранением кастомных полей.

---

## 🏛️ Архитектурный принцип

Лендинг использует **двухуровневую структуру полей**:
1. **Базовый каркас покупателя (Core Protected Fields):** Имя, Фамилия, Email, Телефон, Итальянский налоговый код (`codice_fiscale`). Эти поля всегда присутствуют, строго валидируются и используются для авторизации в Личном кабинете (`apps/app`), выписки чеков Stripe и фискальных документов.
2. **Динамические настраиваемые поля (Custom Dynamic Fields):** Поля, настроенные администратором в панели CRM (уровень языка, цель обучения, источник привлечения, спец. пожелания). Они подгружаются на лету и сохраняются в `bookings.custom_fields` (JSONB) и Stripe Metadata.

---

## 📍 1. Точки интеграции на лендинге

### 1.1. Резолв активной формы курса (`/forms/resolve`)
* **Где вызывается:** В хуке чекаута или Server Component при переходе на страницу `/checkout/[id]`.
* **Функция ядра:** `resolveActiveFormTemplate(templates, { form_type: 'booking', course_id, category_slug })`.
* **Приоритет каскада:**
  1. Форма, привязанная к конкретному курсу (`course_id`).
  2. Форма, привязанная к категории курса (`category_slug`).
  3. Глобальная форма по умолчанию (`is_default: true`).
  4. Встроенный отказоустойчивый шаблон `DEFAULT_BOOKING_FORM_TEMPLATE`.

---

### 1.2. Рендеринг динамических полей (`DynamicCustomFields`)
* **Компонент:** [`apps/landing/src/features/checkout/components/DynamicCustomFields.tsx`](file:///Users/krimson/PROJECTS/atena_school/apps/landing/src/features/checkout/components/DynamicCustomFields.tsx)
* **Поддерживаемые типы элементов ввода:**
  * `text` — текстовое поле (Input)
  * `select` — выпадающий список (Dropdown)
  * `checkbox` — одиночный переключатель/согласие
  * `textarea` — многострочный текстовый блок
  * `number` — числовой ввод
  * `date` — выбор даты
* **Таргетинг полей:**
  * `target: 'purchaser'` — рендерится в блоке данных плательщика/родителя.
  * `target: 'student'` — рендерится в блоке анкеты студента/ребёнка.
  * `target: 'booking'` — рендерится в блоке общих параметров бронирования.

---

## 💶 2. Итальянские бизнес-правила и Quota Associativa (€30)

При отправке формы бронирования строго соблюдается логика проверки членского взноса:

```ts
// 1. Определение субъекта проверки взноса €30
const taxCodeForQuota = isForChild 
  ? sanitizeTaxCode(values.students[0].taxCode)   // При покупке для ребёнка — строго ИНН РЕБЁНКА
  : sanitizeTaxCode(values.purchaser.taxCode);     // Если учится покупатель — ИНН ПОКУПАТЕЛЯ

// 2. Дублирование данных, если покупатель и есть студент
if (!isForChild) {
  values.students = [{
    firstName: values.purchaser.firstName,
    lastName: values.purchaser.lastName,
    taxCode: values.purchaser.taxCode,
    email: values.purchaser.email,
    phone: values.purchaser.phone,
  }];
}
```

---

## 💳 3. Передача в Stripe и Базу Данных

### 3.1. Сохранение в Supabase `bookings`
Кастомные поля передаются в JSONB-колонку `custom_fields`:
```json
{
  "study_level": "B1",
  "heard_from": "Instagram",
  "special_requests": "Preferenza lezioni pomeridiane"
}
```

### 3.2. Передача в Stripe Metadata
При создании `stripe.checkout.sessions.create()` кастомные поля сериализуются в метаданные сессии:
```ts
metadata: {
  booking_id: booking.id,
  course_id: course.id,
  is_for_child: String(isForChild),
  ...customFieldsPayload,
}
```

---

## 🔔 4. Использование в триггерах и уведомлениях

Все сохраненные кастомные поля автоматически доступны в шаблонах Email и Telegram-уведомлений:
* `{{study_level}}` или `{{custom.study_level}}`
* `{{heard_from}}` или `{{custom.heard_from}}`
