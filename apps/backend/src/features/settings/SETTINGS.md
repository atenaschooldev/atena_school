# Модуль Настроек Пользователя (`settings`)

Этот модуль отвечает за хранение и обновление индивидуальных настроек пользователей (язык интерфейса, тема оформления, уведомления).

---

## Архитектура и Структура файлов

```
settings/
├── domain/
│   └── settings.repository.interface.ts # Абстрактный репозиторий SettingsRepository
├── impl/
│   └── prisma-settings.repository.ts    # Реализация настроек на Prisma
├── settings.controller.ts                # Маршруты управления настройками
├── settings.service.ts                   # Бизнес-логика настроек
└── settings.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`SettingsRepository`** ([settings.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/settings/domain/settings.repository.interface.ts))
  Абстрактный класс репозитория. Предоставляет следующие методы:
  * `getSettings(userId: string)` — получить настройки для указанного пользователя.
  * `updateSettings(userId: string, data: { language?: string; theme?: string; notificationsEnabled?: boolean })` — сохранить изменения настроек.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaSettingsRepository`** ([prisma-settings.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/settings/impl/prisma-settings.repository.ts))
  Осуществляет доступ к настройкам. На текущем этапе настройки возвращаются с дефолтными значениями (язык: `it`, тема: `dark`, уведомления: `true`) после верификации существования пользователя в таблице `users` через `PrismaService`. При расширении схемы данных (добавлении таблицы настроек или полей в `users`), логика изменится только внутри этого файла.

---

## 3. Сервисный слой (`settings.service.ts`)

* **`SettingsService`** ([settings.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/settings/settings.service.ts))
  * Посредник между контроллером и репозиторием.
  * Инжектирует `SettingsRepository` и вызывает соответствующие методы для текущего пользователя.

---

## 4. Контроллер (`settings.controller.ts`)

Определяет эндпоинты API:

* **`GET /settings`**:
  Возвращает настройки текущего авторизованного пользователя на основе сессии (запрос защищен `AuthGuard`).
* **`PUT /settings`**:
  Обновляет настройки пользователя (принимает JSON с полями `language`, `theme`, `notificationsEnabled`).
