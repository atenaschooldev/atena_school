# 🗂️ 03. Энамы, Схема данных и DTO

Все перечисления и интерфейсы модуля динамических форм централизованы в `@atena/api-types/system/form-templates`.

---

## 1. Системные перечисления (Enums)

### 1.1. Типы форм (`FormType`)
| Код | Описание | Основное применение |
|---|---|---|
| `booking` | Форма чекаута и записи на курс | Лендинг `/checkout/[id]`, бронирование |
| `contact` | Форма обратной связи | Раздел «Contattaci» в футере и на главной |
| `test` | Форма онлайн-тестирования | Страница `/test-inglese` |
| `custom` | Произвольная анкета | Промо-страницы, мастер-классы, опросы |

### 1.2. Типы полей (`FormFieldType`)
| Код | Назначение |
|---|---|
| `text` | Однострочный текст |
| `select` | Выпадающий список |
| `checkbox` | Чекбокс / Согласие |
| `textarea` | Многострочный текст |
| `number` | Число |
| `date` | Календарная дата |

### 1.3. Таргеты полей (`FormFieldTarget`)
| Код | Смысловой блок |
|---|---|
| `purchaser` | Данные покупателя / родителя |
| `student` | Данные студента / ребёнка |
| `booking` | Данные бронирования / заявки |

---

## 2. Схема таблицы PostgreSQL (`form_templates`)

```sql
CREATE TABLE public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(32) NOT NULL DEFAULT 'booking',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  category_slug VARCHAR(64),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  fields_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Структура объекта поля (`FormFieldConfig`)

```ts
export interface FormFieldConfig {
  id: string;
  key: string;                          // Системный ключ ("study_level")
  label: string;                        // Название на форме ("Livello attuale")
  placeholder?: string;
  field_type: FormFieldType;            // 'text' | 'select' | ...
  target: FormFieldTarget;              // 'purchaser' | 'student' | 'booking'
  is_required: boolean;                 // Обязательное ли
  is_enabled: boolean;                  // Активно ли
  sort_order: number;                   // Порядок сортировки (1, 2, 3...)
  options?: FormFieldOption[];          // [{ label: "A1", value: "a1" }]
  help_text?: string;
  default_value?: any;
  validation_pattern?: string;
}
```
