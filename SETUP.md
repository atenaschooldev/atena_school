# 🚀 Инструкция по локальному развертыванию Atena School

Этот репозиторий представляет собой Turborepo-монорепозиторий, включающий публичный сайт-лендинг с онлайн-бронированием, CRM для администраторов, личный кабинет студента и NestJS REST API.

---

## 📋 1. Системные требования

Перед началом работы убедитесь, что у вас установлены:
- **Node.js**: `v20.x` LTS или новее
- **pnpm**: `v9+` или `v11+`
  ```bash
  # Включение и активация pnpm через corepack:
  corepack enable
  corepack prepare pnpm@11.13.1 --activate

  # Либо установка через npm глобально:
  npm install -g pnpm
  ```
- Доступ к инстансу **Supabase** (PostgreSQL БД и Auth) и ключи **Stripe** (для тестовых платежей).

---

## 📦 2. Установка зависимостей и генерация Prisma

Выполните в корне репозитория:

```bash
# 1. Установка всех зависимостей монорепозитория
pnpm install

# 2. Генерация Prisma Client для бэкенда
cd apps/backend
npx prisma generate
cd ../..
```

---

## ⚙️ 3. Настройка переменных окружения (`.env`)

Создайте файлы `.env` в директориях приложений:

### 🔹 `apps/backend/.env`
```env
PORT=4000
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:3000"
```

### 🔹 `apps/landing/.env` (Публичный сайт)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 🔹 `apps/app/.env` (Личный кабинет студента)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 🔹 `apps/admin/.env` (CRM администратора)
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_ADMIN_TOKEN=
```

---

## ▶️ 4. Запуск всех проектов

Для одновременного запуска всех ключевых сервисов в режиме разработки выполните команду из корня проекта:

```bash
pnpm dev:all
```

Эта команда запускает Turborepo и выводит статус сервисов.

### 🌐 Доступные локальные адреса:

| Сервис | Локальный URL | Назначение |
| :--- | :--- | :--- |
| 🌐 **Landing** (`apps/landing`) | [http://localhost:3000](http://localhost:3000) | Публичный сайт, выбор курсов и бронирование |
| 🏢 **Admin CRM** (`apps/admin`) | [http://localhost:3001](http://localhost:3001) | Панель управления для администраторов/секретарей |
| 👤 **Student App** (`apps/app`) | [http://localhost:3002](http://localhost:3002) | Личный кабинет студента (расписание, уроки) |
| ⚙️ **Backend API** (`apps/backend`) | [http://localhost:4000](http://localhost:4000) | NestJS REST API |
| 📚 **Swagger Docs** | [http://localhost:4000/docs](http://localhost:4000/docs) | Интерактивная документация к API |

---

## 🛠️ 5. Запуск отдельных сервисов и вспомогательные команды

- **Запуск только одного сервиса**:
  - `pnpm --filter backend dev` — только NestJS API
  - `pnpm --filter admin dev` — только CRM-панель
  - `pnpm --filter landing dev` — только Лендинг
  - `pnpm --filter app dev` — только Личный кабинет студента
- **Сборка всех проектов**:
  ```bash
  pnpm build
  ```
- **Проверка линтером и форматирование**:
  ```bash
  pnpm lint
  pnpm format
  ```
