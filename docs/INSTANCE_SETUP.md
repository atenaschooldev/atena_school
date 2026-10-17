# 🚀 Руководство по развертыванию нового инстанса школы (White-Label)

Это пошаговое руководство объясняет, как за 5 минут настроить и запустить платформу для новой школы.

---

## 📍 Главный принцип: Единая точка конфигурации

Все настройки бренда, цветов, фичей и контактов собраны в **одном файле**:
👉 [`apps/landing/src/config/brand.config.ts`](file:///Users/krimson/PROJECTS/atena_school/apps/landing/src/config/brand.config.ts)

Вам **не нужно** искать и менять тексты или цвета по 50 файлам проекта. Все компоненты лендинга, чекаута и писем используют токены и данные из этого файла.

---

## ⚡ Пошаговый запуск нового инстанса за 4 шага

### Шаг 1: Настройте `brand.config.ts`

Откройте [`apps/landing/src/config/brand.config.ts`](file:///Users/krimson/PROJECTS/atena_school/apps/landing/src/config/brand.config.ts) и заполните данные новой школы:

```typescript
export const brandConfig: BrandConfig = {
  // 1. Идентичность школы
  school: {
    name: 'Milano Language Academy',
    legalName: 'Milano Language Academy S.r.l.',
    tagline: 'Impara le lingue nel cuore di Milano',
    founders: 'MARCO & GIULIA, FONDATORI',
    logoUrl: '/assets/logo.webp',
  },

  // 2. Геолокация и физический адрес
  location: {
    city: 'Milano',
    province: 'MI',
    address: 'Via Dante 14',
    cap: '20121',
    country: 'Italia',
    mapsUrl: 'https://maps.google.com/...',
  },

  // 3. Контакты
  contacts: {
    phone: '+39 02 1234 5678',
    landline: '02 1234 5678',
    whatsapp: '+39 02 1234 5678',
    email: 'info@milanola.it',
    secretariatEmail: 'segreteria@milanola.it',
    supportEmail: 'supporto@milanola.it',
    secretariatHours: 'Lunedì - Venerdì 09:00 - 18:00',
  },

  // 4. Юридические данные и банк
  legal: {
    vatCode: 'P.IVA 12345678901',
    iban: 'IT60X0542811101000000987654',
    bankName: 'Intesa Sanpaolo',
    accountHolder: 'Milano Language Academy S.r.l.',
  },

  // 5. Фирменные цвета инстанса
  theme: {
    primary: '#0B4F6C',         // Основной цвет (кнопки, заголовки)
    primaryHover: '#083B52',    // Hover основного
    primaryDark: '#042433',     // Темный фон шапки / плашек
    secondary: '#01BAEF',       // Контрастный / CTA цвет
    secondaryHover: '#0096C7',  // Hover вторичного
    secondaryLight: '#E8F7FC',  // Светлый фон бейджей
    accent: '#E8F7FC',
  },

  // 6. Переключатели фичей
  features: {
    enableEnglishTest: true,        // Показывать онлайн-тест уровня
    enableAccreditations: true,     // Показывать бейджи Cambridge/Trinity
    enableStatsBanner: true,        // Показывать бегущую строку
    registrationFeeEnabled: true,   // Включен ли регистрационный сбор (€30)
    registrationFeeEur: 30,
    academicYear: '2026/2027',
  },

  // 7. Аккредитации и центры тестирования
  accreditations: [
    {
      id: 'cambridge',
      name: 'Cambridge English',
      label: 'Preparazione Esami',
      href: 'https://www.cambridgeenglish.org/',
      showInHero: true,
      showInStats: true,
    },
  ],
};
```

---

### Шаг 2: Инициализируйте базу данных в Supabase

1. Создайте новый проект в [Supabase Dashboard](https://supabase.com/dashboard).
2. Примените начальную схему таблиц из `supabase/init_schema.sql` (или миграции).
3. Запустите генератор сида школы:
   ```bash
   pnpm seed:instance
   ```
4. Скрипт создаст файл `supabase/instance_seed.sql`.
5. Откройте **Supabase Dashboard** -> **SQL Editor** -> вставьте содержимое `supabase/instance_seed.sql` и нажмите **Run**.
   *(Либо, если у вас прописан `DATABASE_URL`, выполните напрямую: `pnpm seed:instance --execute`)*.

---

### Шаг 3: Настройте переменные окружения (.env)

Для Vercel или локального запуска скопируйте ключи из Supabase и Stripe:

```env
# 🟢 Supabase нового инстанса
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# 🟢 Публичные адреса (Vercel или кастомный домен)
NEXT_PUBLIC_SITE_URL=https://milanola.it
NEXT_PUBLIC_APP_URL=https://app.milanola.it
NEXT_PUBLIC_BACKEND_URL=https://api.milanola.it

# 🟢 Stripe нового инстанса
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 🟢 Уведомления (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Milano Language Academy <info@milanola.it>
```

---

### Шаг 4: Разверните на Vercel

```bash
# Проверка сборки перед пушем
pnpm --filter landing build

# Пуш в репозиторий инстанса
git add .
git commit -m "feat: configure instance for Milano Language Academy"
git push all main
```

---

## 🏢 Что клиент (директор / секретарь) настраивает сам в CRM

После деплоя директор школы входит в CRM (`apps/admin`) и управляет школой без вашего участия:

| Раздел в CRM | Что настраивает клиент |
|---|---|
| **`/settings/account`** | Название, слоган, контакты, часы работы, IBAN, загрузка логотипа, смена цветов |
| **`/courses`** | Создание курсов (языки, уровни A1-C2, возрастные группы) |
| **`/schedules`** | Расписание занятий, даты начала, дни недели, аудитории |
| **`/teachers`** | Преподаватели и назначения на курсы |
| **`/settings/billing`** | Подключение Stripe Connect или собственных ключей Stripe |
| **`/settings/fees`** | Включение/отключение годового регистрационного взноса (€30) |

Любое изменение данных в CRM мгновенно отображается на лендинге, в чекауте и в чеках бронирования благодаря паттерну **Database-First**.

---

## 💡 Архитектурные гарантии
- **0ms задержки:** Все цвета и параметры кэшируются на Edge CDN Next.js (ISR).
- **Fallback безопасности:** Если база данных недоступна или запись в `school_profiles` еще не создана, сайт на 100% отображает данные из `brand.config.ts`.
- **Никаких утечек старого бренда:** Все 40+ компонентов лендинга и чекаута привязаны к дизайн-токенам `var(--primary)` и `var(--secondary)`.
