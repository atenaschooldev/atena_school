# 📡 Backend Forms Engine Module (`apps/backend`)

REST API и сервисы управления шаблонами динамических форм, привязками к курсам/категориям и безопасной валидацией.

---

## 🏛️ Архитектура модуля (`FormsModule`)

* **`FormsAdminController` (`/api/admin/forms/*`):** Защищенные эндпоинты для панели управления CRM. Требуют авторизации JWT (`AuthGuard`) и ролей `admin` или `secretary` (`RolesGuard`). Все мутации аудируются через `AuditInterceptor`.
* **`FormsPublicController` (`/api/forms/resolve`):** Публичный эндпоинт для разрешения активной формы курса/категории без авторизации.
* **`FormsService`:** Бизнес-логика CRUD шаблонов в PostgreSQL, валидация конфигурации полей, переключение дефолтных моделей, дублирование шаблонов и отказоустойчивые фоллбэки.

---

## 📋 Спецификация REST API

### 1. Администрирование форм (`/api/admin/forms`)
* `GET /api/admin/forms` — получение списка всех форм с фильтрацией по `form_type` и `is_active` (роли: `admin`, `secretary`).
* `POST /api/admin/forms` — создание нового шаблона формы (роль: `admin`).
* `GET /api/admin/forms/:id` — получение формы по UUID (роли: `admin`, `secretary`).
* `PATCH /api/admin/forms/:id` — обновление заголовка, таргетинга, статуса и конфигурации полей `fields_config` (роль: `admin`).
* `DELETE /api/admin/forms/:id` — удаление шаблона (роль: `admin`, дефолтный шаблон защищен от удаления).
* `POST /api/admin/forms/:id/set-default` — назначение формы дефолтной для указанного типа в 1 клик (роль: `admin`).
* `POST /api/admin/forms/:id/duplicate` — быстрое клонирование шаблона (роль: `admin`).

### 2. Публичный резолв (`/api/forms/resolve`)
* `GET /api/forms/resolve?form_type=booking&course_id={id}&category_slug={slug}` — возвращает оптимальный активный шаблон формы с учетом каскада приоритетов (Курс ➔ Категория ➔ Дефолт).

---

## 🗄️ Схема Базы Данных (PostgreSQL)

```sql
CREATE TABLE public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(32) NOT NULL DEFAULT 'booking', -- 'booking' | 'contact' | 'test' | 'custom'
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

## 🔗 Связь с Core Engine
Логика каскадного разрешения формы и дефолтный шаблон инкапсулированы в `@atena/core` (`resolveActiveFormTemplate`, `DEFAULT_BOOKING_FORM_TEMPLATE`).
