# 🏛️ Atena School — Landing & Self-Checkout Portal

Клиентский лендинг и платформа самостоятельного онлайн-бронирования курсов для языковой школы **Atena School** (Читтанова, Италия). Приложение оптимизировано для высокой конверсии, максимального SEO, мгновенной скорости загрузки и прозрачного флоу оплаты.

---

## 🛠 Технологический стек

- **Фреймворк**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Язык**: TypeScript (строгая типизация)
- **Стилизация**: [Tailwind CSS](https://tailwindcss.com/) + кастомная дизайн-система Atena UI
- **База данных и Auth**: [Supabase](https://supabase.com/) (`@supabase/ssr`)
- **Эквайринг & Платежи**: [Stripe](https://stripe.com/) (Node.js SDK, Checkout Sessions, Webhooks)
- **Интернационализация**: [next-intl](https://next-intl-docs.vercel.app/)
- **Формы и валидация**: `react-hook-form` + `@hookform/resolvers` + `@atena/validators` (Zod)
- **Иконки**: `@phosphor-icons/react`
- **Анимации & Эффекты**: GSAP, Canvas Confetti, CSS-модули
- **Тестирование**: [Vitest](https://vitest.dev/)

---

## 📂 Архитектура и структура каталогов

Проект организован по принципу **Feature-Driven Development**. Все страницы в каталоге `src/app/` представляют собой тонкие серверные/Suspense обёртки, а бизнес-логика, хуки, компоненты и вьюхи изолированы в модулях `src/features/`.

```
apps/landing/src/
├── app/                          # Исключительно тонкие роуты Next.js и метаданные
│   ├── api/                      # Серверные REST API хэндлеры лендинга (/api/landing/*)
│   │   ├── auth/                 # Авторизация и Magic-link генерация
│   │   ├── bookings/             # Проверка статуса бронирований
│   │   ├── checkout/             # Stripe Session, Reserve, Check Fee, Verify Payment
│   │   ├── contact/              # Отправка сообщений из формы обратной связи
│   │   ├── courses/              # Публичный список и детали курсов
│   │   ├── mail/                 # Отправка транзакционных писем (Resend/SMTP)
│   │   ├── portal/               # Stripe Customer Portal
│   │   ├── telegram/             # Уведомления администраторам в Telegram
│   │   └── webhooks/stripe/      # Обработка событий Stripe (checkout.session.completed и др.)
│   ├── book/
│   │   └── [type]/[id]/page.tsx  # Роут редиректа на страницу курса
│   ├── checkout/
│   │   ├── [id]/page.tsx         # Тонкий Suspense-роут -> <CheckoutView />
│   │   └── success/
│   │       ├── [id]/page.tsx     # Редирект на success-страницу с query-параметрами
│   │       └── page.tsx          # Тонкий Suspense-роут -> <CheckoutSuccessView />
│   ├── cookies/page.tsx          # Страница Cookie Policy (GDPR)
│   ├── corsi/
│   │   ├── page.tsx              # Каталог курсов с SEO Schema
│   │   └── [id]/page.tsx         # Тонкий серверный роут с SEO -> <CourseDetailView />
│   ├── privacy/page.tsx          # Страница Privacy Policy (GDPR)
│   ├── test-inglese/page.tsx     # Тонкий роут -> <EnglishTest />
│   ├── global-error.tsx          # Глобальный перехватчик критических ошибок
│   ├── layout.tsx                # Root Layout с компонентами из @/components/layout
│   ├── not-found.tsx             # Кастомная 404 страница
│   ├── page.tsx                  # Home Route (<HeroSection />, <StatsSection />, etc.)
│   ├── robots.ts                 # Динамический robots.txt
│   └── sitemap.ts                # Динамический sitemap.xml
│
├── components/
│   ├── layout/                   # Сквозной layout (Navbar, Footer, CookieBanner, ScrollToTop, GoogleAnalytics, ScrollAnimateProvider)
│   ├── seo/                      # SEO-схемы Schema.org (BreadcrumbSchema, FaqSchema, CourseSchema)
│   └── ui/                       # Атомарные UI-компоненты (Button, Input, Dialog, LogoLoop, Calendar, etc.)
│
├── config/                       # Конфигурация окружения (Zod-валидированный env)
├── constants/                    # Константы (ежегодный взнос €30, типы оплат, тарифные схемы)
│
├── features/                     # Доменные модули (Feature-Driven Architecture)
│   ├── about/                    # Секция "О школе" (AboutSection)
│   ├── booking/                  # Календарь выбора слотов, хук useBooking
│   ├── checkout/                 # Чекаут: CheckoutView, CheckoutSuccessView, CheckoutStepper, хуки useCheckout / useCheckoutSuccess
│   ├── contact/                  # Форма обратной связи: ContactSection, useContactForm
│   ├── courses/                  # Курсы: CourseDetailView, CoursesCatalog, CourseCard, CambridgeCard, EipassCard, FaqSidebar
│   ├── home/                     # Главная: HeroSection, StatsSection, CtaBanner, homeService
│   ├── reviews/                  # Отзывы студентов: TestimonialsSection
│   ├── teachers/                 # Преподаватели: TeachersSection
│   └── test-inglese/             # Интерактивный тест CEFR: EnglishTest, useEnglishQuiz
│
├── hooks/                        # Общие React-хуки (useMounted и др.)
├── i18n/                         # Конфигурация локализации (next-intl, routing, messages)
├── lib/                          # Утилиты, Supabase-клиенты, analytics, server services
│   ├── server/                   # Серверные сервисы (checkout-service, email-service, telegram-service)
│   ├── supabase/                 # Инициализация Supabase Client / Server / Middleware
│   └── utils/                    # Генератор расписания (@atena/utils), форматирование дат и валют
└── types/                        # Дополнительные TypeScript интерфейсы лендинга
```

---

## 🎯 Основные функциональные модули

### 1. 🏠 Главная страница (`features/home`)
- **Hero Section**: Динамический заголовок с призывом к действию и быстрым переходом к каталогу или бесплатному тесту.
- **Интерактивная статистика**: Анимированные счетчики учеников, часов и бегущая строка аккредитаций (`LogoLoop`: Cambridge, Trinity, EIPASS).
- **Секции доверия**: О школе, преподавателях, отзывы реальных студентов и контактная форма с защитой от спама.

### 2. 📚 Каталог и детали курсов (`features/courses`)
- **Каталог**: Фильтрация по направлениям (дети, взрослые, EIPASS, Cambridge, подготовка к экзаменам), мгновенный поиск.
- **Страница курса (`CourseDetailView`)**:
  - Выбор гибкого/фиксированного расписания.
  - Интерактивный выбор первой даты и времени урока через календарь.
  - Расчёт дат занятий через эталонную функцию `@atena/utils` (`calculateLessonDates`).
  - Полный блок FAQ и SEO JSON-LD микроразметка `Course` и `BreadcrumbList`.

### 3. 💳 Чекаут и оплата (`features/checkout`)
- **Проверка ежегодного членского взноса (€30)**:
  - Автоматическая валидация через `Codice Fiscale` и email студента.
  - Если взнос оплачен в текущем году — повторно не начисляется.
- **Гибкие схемы оплаты**:
  - Разовая полная оплата курса (`BillingScheme.FULL`).
  - Ежемесячная подписка (`BillingScheme.SUBSCRIPTION` / Stripe Subscriptions).
  - Бронирование без онлайн-оплаты с расчётом на месте в школе (`type='cash'`).
- **Синхронизация**: Прямое создание Stripe Checkout Session через бэкенд-сервисы и обработка вебхуков.

### 4. 🎉 Экран успешной оплаты (`features/checkout/views/CheckoutSuccessView`)
- Отображение чека и параметров бронирования (дата первого урока, стоимость курса, регистрационный взнос).
- Генерация и отправка Magic Link для мгновенного входа в личный кабинет (`apps/app`).
- Быстрый вход через Google OAuth.

### 5. 📝 Онлайн-тест по английскому языку (`features/test-inglese`)
- 6 адаптивных вопросов с определением ориентировочного уровня по шкале CEFR (A1, A2, B1, B2, C1, C2).
- Мгновенный результат, конфетти-эффект и кнопка подбора подходящего курса.

---

## 🚀 Запуск и разработка

### 1. Установка зависимостей (из корня монорепозитория)
```bash
pnpm install
```

### 2. Запуск локального сервера разработки
```bash
# Только лендинг
pnpm --filter landing dev

# Или все сервисы монорепозитория
pnpm dev
```
Лендинг будет доступен по адресу: [http://localhost:3000](http://localhost:3000).

### 3. Запуск тестов
```bash
pnpm --filter landing test
```

### 4. Сборка для продакшена
```bash
pnpm --filter landing build
```

---

## 🔐 Переменные окружения (`.env.local`)

| Переменная | Описание |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL текущего сайта лендинга (напр. `https://atena-school.it` или `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | URL личного кабинета студента (напр. `http://localhost:3002`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Публичный URL инстанса Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Анонимный ключ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Сервисный ключ Supabase для серверных API роутов |
| `STRIPE_SECRET_KEY` | Секретный ключ Stripe API |
| `STRIPE_WEBHOOK_SECRET` | Секретный ключ подписи вебхуков Stripe (`whsec_...`) |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота для отправки уведомлений |
| `TELEGRAM_CHAT_ID` | ID чата/канала для оповещений о бронированиях |
| `RESEND_API_KEY` | API-ключ Resend для отправки email |

---

## 📄 Лицензия
Принадлежит **Atena School S.R.L.S.** Все права защищены.
