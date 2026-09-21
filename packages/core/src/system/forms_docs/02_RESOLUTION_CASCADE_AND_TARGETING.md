# 02. Каскадный резолвер и таргетинг форм

Документация по алгоритму выбора активного шаблона формы для конкретного запроса на лендинге.

---

## 🎯 Иерархия приоритетов выбора формы

Когда клиент переходит к оформлению курса `/checkout/[id]`, система выполняет каскадный поиск наиболее специфичного активного шаблона формы:

```
                            [Запрос: course_id, category_slug, form_type]
                                                  │
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │ 1. Есть активный шаблон с course_id === id?     │
                        └─────────┬──────────────────────────────┬─────────┘
                                 ДА                              НЕТ
                                  ▼                               ▼
                      ┌───────────────────────┐         ┌──────────────────────────────────────────────┐
                      │ Возвращаем этот шаблон│         │ 2. Есть активный шаблон с category_slug?     │
                      └───────────────────────┘         └─────────┬──────────────────────────┬─────────┘
                                                                 ДА                          НЕТ
                                                                  ▼                           ▼
                                                      ┌───────────────────────┐     ┌───────────────────────────────────┐
                                                      │ Возвращаем этот шаблон│     │ 3. Есть активный шаблон          │
                                                      │                       │     │    с is_default === true?         │
                                                      └───────────────────────┘     └─────┬───────────────────────┬─────┘
                                                                                         ДА                       НЕТ
                                                                                          ▼                        ▼
                                                                              ┌───────────────────────┐ ┌──────────────────────┐
                                                                              │ Возвращаем дефолтный  │ │ 4. Встроенный        │
                                                                              │ шаблон из БД          │ │    DEFAULT_BOOKING_  │
                                                                              └───────────────────────┘ │    FORM_TEMPLATE     │
                                                                                                        └──────────────────────┘
```

---

## 💻 Программная реализация (`@atena/core`)

```ts
import { FormTemplate, FormType, ResolveFormQuery } from '@atena/api-types';

export function resolveActiveFormTemplate(
  templates: FormTemplate[] = [],
  query: ResolveFormQuery
): FormTemplate {
  const activeTemplates = templates.filter(
    (t) => t.is_active && t.form_type === query.form_type
  );

  // 1. Точный курс
  if (query.course_id) {
    const courseSpecific = activeTemplates.find((t) => t.course_id === query.course_id);
    if (courseSpecific) return courseSpecific;
  }

  // 2. Категория курса
  if (query.category_slug) {
    const categorySpecific = activeTemplates.find(
      (t) => t.category_slug === query.category_slug && !t.course_id
    );
    if (categorySpecific) return categorySpecific;
  }

  // 3. Форма по умолчанию
  const defaultTemplate = activeTemplates.find((t) => t.is_default);
  if (defaultTemplate) return defaultTemplate;

  // 4. Первая активная
  if (activeTemplates.length > 0) return activeTemplates[0];

  // 5. Встроенный системный фоллбэк
  return DEFAULT_BOOKING_FORM_TEMPLATE;
}
```

---

## 🛡️ Отказоустойчивость (Fault Tolerance)
Если база данных временно недоступна или таблица `form_templates` пуста, метод гарантированно возвращает `DEFAULT_BOOKING_FORM_TEMPLATE`, предотвращая сбой чекаута на стороне клиента.
