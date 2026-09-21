# 🌐 07. Интеграция с Лендингом и Чекаутом

Документация по взаимодействию чекаута бронирования (`apps/landing`) с движком динамических форм.

---

## 1. Загрузка и резолв активной формы

На странице чекаута `/checkout/[id]` форма бронирования разрешается автоматически через Server Actions или API-роут `/forms/resolve`:

```ts
import { resolveActiveFormTemplate } from '@atena/core';

const activeForm = resolveActiveFormTemplate(templates, {
  form_type: FormType.BOOKING,
  course_id: course.id,
  category_slug: course.category,
});
```

---

## 2. Рендеринг компонента `DynamicCustomFields`

Кастомные поля отображаются внутри секции анкеты с помощью компонента [`DynamicCustomFields`](file:///Users/krimson/PROJECTS/atena_school/apps/landing/src/features/checkout/components/DynamicCustomFields.tsx):

```tsx
<DynamicCustomFields
  fields={activeForm.fields_config}
  target={FormFieldTarget.STUDENT}
  register={register}
  errors={errors}
/>
```

Поля автоматически регистрируются в React Hook Form под префиксом `custom_fields.{key}`:
- `custom_fields.study_level`
- `custom_fields.heard_from`
- `custom_fields.additional_requests`

---

## 3. Отправка данных и сохранение

При отправке формы бронирования (онлайн через Stripe или на месте в секретариате):
1. Валидируются обязательные поля.
2. Собирается объект `custom_fields`.
3. Запись сохраняется в `public.bookings`:
   - `custom_fields` = `{ study_level: "B1", ... }`
   - `form_id` = `activeForm.id`
4. Поля передаются в метаданные сессии Stripe Checkout.
