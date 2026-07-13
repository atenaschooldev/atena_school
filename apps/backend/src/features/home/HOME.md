# Модуль Аналитики и Панели Управления (`home`)

Этот модуль собирает и возвращает агрегированную статистику успеваемости, посещаемости и активности для отображения на главной странице (дашборде) CRM.

---

## Архитектура и Структура файлов

```
home/
├── domain/
│   └── analytics.repository.interface.ts # Интерфейс репозитория AnalyticsRepository
├── impl/
│   └── prisma-analytics.repository.ts    # Реализация сбора метрик на Prisma
├── home.controller.ts                    # Маршруты дашборда
├── home.service.ts                       # Логика агрегации метрик
└── home.module.ts                        # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`AnalyticsRepository`** ([analytics.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/home/domain/analytics.repository.interface.ts))
  Абстрактный класс репозитория. Задает структуру отчета для главной страницы (`DashboardStats`) и объявляет метод:
  * `getDashboardStats()` — собрать статистику активности.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaAnalyticsRepository`** ([prisma-analytics.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/home/impl/prisma-analytics.repository.ts))
  Выполняет агрегацию данных по всей базе данных:
  * Подсчитывает количество активных студентов (где `status = 'active'`).
  * Подсчитывает количество активных преподавателей (где `status = 'active'`).
  * Подсчитывает количество запущенных курсов (где `status = 'active'`).
  * Подсчитывает количество будущих уроков в расписании (где `startDate >= now`).
  * Вычисляет процент посещаемости как отношение отметок `present` к общему количеству записей в таблице `attendance`.
  * Выгружает последние 5 логов активности администраторов из таблицы `activity_logs`.

---

## 3. Сервисный слой (`home.service.ts`)

* **`HomeService`** ([home.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/home/home.service.ts))
  Вызывает метод `getDashboardStats()` у зарегистрированного провайдера `AnalyticsRepository`.

---

## 4. Контроллер (`home.controller.ts`)

Определяет эндпоинты API:

* **`GET /home/dashboard`** — получить сводные данные для дашборда. Доступ открыт для администраторов и преподавателей (`@Roles('admin', 'teacher')`).
