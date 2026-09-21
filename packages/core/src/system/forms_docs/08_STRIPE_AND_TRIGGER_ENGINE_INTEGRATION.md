# ⚡ 08. Интеграция со Stripe и Trigger Engine

Документация по сквозной передаче кастомных полей формы через платежный шлюз Stripe в CRM и шаблоны уведомлений.

---

## 1. Интеграция со Stripe Checkout

При инициализации платежной сессии в Stripe все кастомные поля формы упаковываются в метаданные сессии `stripe.checkout.sessions.create()`:

```ts
// 1. Формирование метаданных Stripe
const customFieldsMetadata: Record<string, string> = {};
if (booking.custom_fields && typeof booking.custom_fields === 'object') {
  for (const [key, val] of Object.entries(booking.custom_fields)) {
    // Stripe metadata имеет ограничение 500 символов на значение
    customFieldsMetadata[`cf_${key}`] = String(val).slice(0, 500);
  }
}

// 2. Создание сессии
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  customer_email: booking.purchaser_email,
  metadata: {
    booking_id: booking.id,
    is_for_child: String(booking.is_for_child),
    ...customFieldsMetadata,
  },
});
```

---

## 2. Интеграция с Notification Trigger Engine

В движке компиляции шаблонов `@atena/core` функция `getFieldValue` автоматически поддерживает извлечение кастомных полей из структуры `custom_fields`:

```ts
export function getFieldValue(obj: Record<string, any>, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  
  if (Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path];
  }

  // Автоматический поиск в custom_fields
  if (obj.custom_fields && typeof obj.custom_fields === 'object') {
    if (Object.prototype.hasOwnProperty.call(obj.custom_fields, path)) {
      return obj.custom_fields[path];
    }
    const cleanPath = path.replace(/^custom\./, '').replace(/^custom_fields\./, '');
    if (Object.prototype.hasOwnProperty.call(obj.custom_fields, cleanPath)) {
      return obj.custom_fields[cleanPath];
    }
  }

  if (!path.includes('.')) return obj[path];
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}
```

### Синтаксис переменных в шаблонах:
* `{{study_level}}` — прямое обращение
* `{{custom.study_level}}` — явное указание кастомного поля
* `{{custom_fields.study_level}}` — dot-notation путь к JSONB

---

## 3. Использование в условиях триггеров

В визуальном редакторе триггеров CRM администратор может задавать условия на основе кастомных полей:
```json
{
  "conditions": [
    {
      "field": "custom_fields.study_level",
      "operator": "==",
      "value": "A1"
    }
  ]
}
```
Триггер сработает только в том случае, если клиент выбрал в форме уровень `A1`.
