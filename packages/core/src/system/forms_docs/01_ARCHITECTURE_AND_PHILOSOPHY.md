# 01. Архитектура и философия модуля Dynamic Forms Engine

Модуль **Dynamic Forms Engine** спроектирован для обеспечения максимальной гибкости маркетинга и секретариата школы при сохранении строгой надежности финансовых и фискальных процессов.

---

## 🏛️ 1. Концепция двух уровней полей (Dual-Level Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DYNAMIC BOOKING FORM                               │
├──────────────────────────────────────┬──────────────────────────────────────┤
│      1. CORE FIELDS (Защищенные)     │      2. CUSTOM FIELDS (Динамические) │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • purchaser_first_name               │ • study_level (select)               │
│ • purchaser_last_name                │ • heard_from (select)                │
│ • purchaser_email                    │ • special_requests (textarea)        │
│ • purchaser_phone                    │ • school_grade (text)                │
│ • purchaser_tax_code (Codice Fiscale)│ • needs_book_delivery (checkbox)     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Назначение:                          │ Назначение:                          │
│ Авторизация в ЛК, чеки Stripe,       │ Сбор специфичных требований курса,   │
│ фискальные документы, квота €30      │ опросы, таргетированные триггеры     │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 💾 2. Модель хранения данных в PostgreSQL

Вместо динамического добавления колонок в таблицу через `ALTER TABLE`, все кастомные поля формы сохраняются в структурированную колонку `JSONB`:

```sql
-- Таблица шаблонов
CREATE TABLE form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  form_type VARCHAR(32) NOT NULL DEFAULT 'booking',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  category_slug VARCHAR(64),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  fields_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица бронирований
ALTER TABLE bookings
  ADD COLUMN custom_fields JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN form_id UUID REFERENCES form_templates(id) ON DELETE SET NULL;
```

### Преимущества подхода:
1. **Безопасность:** Добавление или удаление полей в админке никогда не блокирует таблицы и не требует выполнения миграций в production.
2. **Обратная совместимость:** Старые бронирования сохраняют исторический снимок ответов даже в случае удаления шаблона формы.
3. **Производительность:** GIN-индекс `idx_bookings_custom_fields` обеспечивает мгновенный поиск и фильтрацию по JSONB-ключам.
