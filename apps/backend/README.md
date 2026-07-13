# Atena School CRM Backend

Бэкенд-система академического управления (CRM) для школы иностранных языков **Atena School**, разработанная на фреймворке **NestJS** с использованием **Fastify** в качестве веб-сервера, **Prisma ORM** для работы с базой данных и интеграцией со сторонними сервисами (Supabase Auth/DB, Google Calendar/Meet, Google Drive, WeasyPrint, Nodemailer).

---

## Ключевые особенности архитектуры

* **Независимость от вендора (Clean Architecture / Repository Pattern)**:
  Бизнес-логика полностью изолирована от деталей СУБД. Приложения и сервисы зависят только от абстрактных интерфейсов репозиториев (TS Abstract Classes). Реализация доступа к данным выполнена с использованием Prisma, но может быть легко заменена на любую другую СУБД или ORM без изменений в слоях контроллеров и сервисов.
* **Feature-First (вертикальные слайсы)**:
  Каждая бизнес-фича сгруппирована в отдельный независимый модуль (маршруты, логика, сущности, работа с базой данных). Это предотвращает разрастание кодовой базы и делает систему невероятно простой для расширения и масштабирования.
* **Автогенерация типов для фронтенда (Flutter)**:
  Вся спецификация API автоматически собирается в стандарт OpenAPI (Swagger). Специальный генератор во Flutter-проекте автоматически считывает схему и генерирует готовые типы моделей данных и HTTP-клиенты (Retrofit / Dio), исключая расхождения в форматах данных.

---

## Навигация по документации

Ниже представлены ссылки на детальные руководства для каждого слоя и модуля проекта:

### 📂 Архитектурные разделы
* **[Инструкция для ИИ-агентов (AI_GUIDELINES.md)](AI_GUIDELINES.md)** — Правила разработки, стек технологий, философия и правила написания кода для ИИ-ассистентов.
* **[Глобальное ядро (CORE.md)](src/core/CORE.md)** — Ролевая авторизация, обработка ошибок, JWT-валидация и базы данных (Prisma, Supabase).
* **[Общие сервисы (SHARED.md)](src/shared/SHARED.md)** — Утилиты рендеринга PDF-файлов (WeasyPrint).
* **[Принцип разработки фич (FEATURES.md)](src/features/FEATURES.md)** — Гайд по структуре модулей и добавлению новых сущностей в проект.

### 📂 Бизнес-модули (Фичи)
* **[Аутентификация и пользователи (AUTH.md)](src/features/auth/AUTH.md)**
* **[Настройки интерфейса (SETTINGS.md)](src/features/settings/SETTINGS.md)**
* **[Студенты и договоры (STUDENTS.md)](src/features/students/STUDENTS.md)**
* **[Преподаватели (TEACHERS.md)](src/features/teachers/TEACHERS.md)**
* **[Учебные программы (COURSES.md)](src/features/courses/COURSES.md)**
* **[Планирование и уроки (SCHEDULES.md)](src/features/schedules/SCHEDULES.md)**
* **[Журнал посещаемости (ATTENDANCE.md)](src/features/attendance/ATTENDANCE.md)**
* **[Успеваемость и навыки (GRADES.md)](src/features/grades/GRADES.md)**
* **[Печать документов (DOCUMENTS.md)](src/features/documents/DOCUMENTS.md)**
* **[Финансы и оплаты (PAYMENTS.md)](src/features/payments/PAYMENTS.md)**
* **[Почтовый сервис (MAIL.md)](src/features/mail/MAIL.md)**
* **[Аудит-лог действий (ACTIVITY_LOGS.md)](src/features/activity_logs/ACTIVITY_LOGS.md)**
* **[Панель аналитики (HOME.md)](src/features/home/HOME.md)**

---

## Быстрый запуск

### Требования
* Node.js v18+
* Установленный менеджер пакетов npm.

### Установка зависимостей
```bash
npm install
```

### Настройка окружения
Создайте файл `.env` в корневой директории и добавьте параметры согласно инструкции в [CORE.md](src/core/CORE.md#переменные-окружения-для-конфигурации-smtp-env) (для локального оффлайн-запуска достаточно оставить заглушки из `.env.example`).

### Запуск в режиме разработки
```bash
npm run start:dev
```
Сервер будет доступен по адресу `http://localhost:8000`. 
Документация API (Swagger UI): `http://localhost:8000/docs`.

### Сборка production-версии
```bash
npm run build
```

### Обновление API-клиента для Flutter
Если вы внесли изменения в контроллеры или DTO, запустите обновление контракта:
```bash
# 1. Генерируем новый swagger.json на бэкенде:
npm run generate:spec

# 2. Переходим во Flutter-проект и запускаем кодогенерацию:
cd ../frontend
dart run swagger_parser
dart run build_runner build -d
```
