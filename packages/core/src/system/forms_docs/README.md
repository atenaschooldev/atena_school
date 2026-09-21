# 📚 Документация Dynamic Forms Engine (`@atena/core`)

Единая база знаний и архитектурная спецификация модуля динамических форм и конструктора анкет монорепозитория Atena School.

---

## 📑 Содержание разделов

1. **[01. Архитектура и философия](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/01_ARCHITECTURE_AND_PHILOSOPHY.md)**
   * Разделение Core и Custom полей
   * Модель хранения JSONB в PostgreSQL
   * Единый источник правды `@atena/api-types`

2. **[02. Типы полей и правила валидации](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/02_FIELD_TYPES_AND_VALIDATION_RULES.md)**
   * Спецификация поддерживаемых типов (`text`, `select`, `checkbox`, `textarea`, `number`, `date`)
   * Формат опций для выпадающих списков
   * Таргетинг полей (`purchaser`, `student`, `booking`)

3. **[03. Энамы, Схема данных и DTO](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/03_ENUMS_AND_DATA_SCHEMAS.md)**
   * Системные перечисления `FormType`, `FormFieldType`, `FormFieldTarget`
   * Схема таблицы `form_templates` в PostgreSQL
   * Структура DTO создания и обновления

4. **[04. Каскадный резолвер и таргетинг](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/04_RESOLUTION_CASCADE_AND_TARGETING.md)**
   * Иерархия приоритетов (Курс ➔ Категория ➔ Дефолт ➔ Фоллбэк)
   * Функция `resolveActiveFormTemplate`
   * Отказоустойчивость при отсутствии записей в БД

5. **[05. Визуальный конструктор и UI](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/05_VISUAL_FORM_BUILDER_AND_UI.md)**
   * Реестр форм `FormsListView` и быстрые действия
   * Визуальный конструктор `VisualFormBuilder`
   * Интерактивное Live Preview (Desktop & Mobile)

6. **[06. Итальянские бизнес-правила и Quota €30](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/06_ITALIAN_BUSINESS_RULES_AND_QUOTA.md)**
   * Разделение покупателя (Purchaser) и студента (Student)
   * Логика флага `isForChild`
   * Правило проверки ежегодного членского взноса €30 (Quota Associativa)

7. **[07. Интеграция с Лендингом и Чекаутом](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/07_LANDING_AND_CHECKOUT_INTEGRATION.md)**
   * Загрузка активной формы на странице `/checkout/[id]`
   * Компонент `DynamicCustomFields`
   * Регистрация полей в React Hook Form и сохранение в базу

8. **[08. Интеграция со Stripe и Trigger Engine](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/08_STRIPE_AND_TRIGGER_ENGINE_INTEGRATION.md)**
   * Сериализация кастомных полей в Stripe Checkout Metadata
   * Автоматическая подстановка переменных `{{custom.key}}` в шаблонах писем и Telegram
   * Фильтрация условий триггеров по кастомным полям

9. **[09. Безопасность, RLS и Troubleshooting](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/09_TROUBLESHOOTING_SECURITY_AND_SECRETS.md)**
   * RLS-политики безопасности таблицы `form_templates`
   * Защита системных данных и целостности дефолтных моделей
   * Диагностика и решение типовых проблем
