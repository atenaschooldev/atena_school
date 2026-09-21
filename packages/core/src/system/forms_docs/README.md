# 📚 Документация Dynamic Forms Engine (`@atena/core`)

Единая база знаний и архитектурная спецификация модуля динамических форм и конструктора анкет монорепозитория Atena School.

---

## 📑 Содержание разделов

1. **[01. Архитектура и философия](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/01_ARCHITECTURE_AND_PHILOSOPHY.md)**
   * Разделение Core и Custom полей
   * Модель хранения JSONB в PostgreSQL
   * Единый источник правды `@atena/api-types`

2. **[02. Каскадный резолвер и таргетинг](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/02_RESOLUTION_CASCADE_AND_TARGETING.md)**
   * Иерархия приоритетов (Курс ➔ Категория ➔ Дефолт ➔ Фоллбэк)
   * Функция `resolveActiveFormTemplate`
   * Отказоустойчивость при отсутствии записей в БД

3. **[03. Итальянские бизнес-правила и Quota €30](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/03_QUOTA_AND_ITALIAN_BUSINESS_RULES.md)**
   * Разделение покупателя (Purchaser) и студента (Student)
   * Логика флага `isForChild`
   * Правило проверки ежегодного членского взноса €30 (Quota Associativa)

4. **[04. Интеграция со Stripe и Trigger Engine](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/system/forms_docs/04_STRIPE_AND_TRIGGER_ENGINE_INTEGRATION.md)**
   * Сериализация кастомных полей в Stripe Checkout Metadata
   * Автоматическая подстановка переменных `{{custom.key}}` в шаблонах писем и Telegram
   * Фильтрация условий триггеров по кастомным полям
