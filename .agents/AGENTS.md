# Atena School — Контекст для AI агентов

**ПРОЧИТАЙ ЭТО ПОЛНОСТЬЮ ПЕРЕД ЛЮБЫМ ИЗМЕНЕНИЕМ КОДА.**

---

## Что это за проект

Цифровая платформа для языковой школы в Италии. Три приложения:
- `apps/landing` — клиент записывается сам онлайн
- `apps/app` — личный кабинет: клиент видит своё расписание
- `apps/admin` — CRM: секретарь управляет всем
- `apps/backend` — NestJS REST API для всех

**Полный бизнес-флоу:** читай `docs/BusinessFlows.md` — там всё: зачем, почему, как.
**Архитектура:** читай `docs/Overview` — там структура БД, таблицы, типы курсов.

---

## Критические правила

### ❌ НЕ ТРОГАЙ без явного запроса:
- `apps/landing/` — эталонная реализация бизнес-логики
- `packages/utils/src/bookingScheduler.ts` — `calculateLessonDates()` — единственная функция для генерации уроков, везде
- Stripe webhook логику

### ✅ ВСЕГДА:
- Используй `calculateLessonDates()` из `@atena/utils` — не пиши свой алгоритм дат
- Два платежа на бронь: `type='payment'` (курс) + `type='registration_fee'` (взнос €30)
- Ищи клиента в `bookings` по `purchaser_email` / `purchaser_phone` / `purchaser_tax_code` — не `email`/`phone`
- Взнос проверяй по данным **студента** (при isForChild — ребёнка, не родителя)
- **GIT & PROD VERCEL:** Автор коммитов ВСЕГДА строго `atenaschooldev <atenaschool.dev@gmail.com>`. Продакшн Vercel привязан к аккаунту `atenaschooldev`. Пушить через `git push all main` (или `git push prod main`).

### 🔍 ПЕРЕД КОДИНГОМ:
- Посмотри как это сделано на лендинге (`apps/landing/src/features/checkout/`)
- Проверь существующий бэкенд сервис (`checkout.service.ts`, `portal.service.ts`)
- Не дублируй логику — она уже есть
