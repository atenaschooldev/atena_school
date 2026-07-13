# Модуль Документов (`documents`)

Этот модуль управляет генерацией печатных документов (договоров, согласий, счетов), наложением данных на PDF-шаблоны и регистрацией документов в базе данных.

---

## Архитектура и Структура файлов

```
documents/
├── domain/
│   ├── document.entity.ts                # Доменная сущность DocumentEntity
│   └── documents.repository.interface.ts # Интерфейс репозитория DocumentsRepository
├── impl/
│   └── prisma-documents.repository.ts    # Реализация репозитория на Prisma
├── documents.controller.ts                # Маршруты работы с документами
├── documents.service.ts                   # Бизнес-логика генерации и учета
└── documents.module.ts                    # Зависимости модуля
```

---

## 1. Доменный слой (`domain`)

* **`DocumentEntity`** ([document.entity.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/documents/domain/document.entity.ts))
  Доменная модель документа. Поля:
  * `id`: Уникальный идентификатор (UUID).
  * `documentNumber`: Номер/название документа (уникальное значение).
  * `fileUrl`: Ссылка на загруженный файл в Google Drive / Supabase Storage.
  * `studentName`: Имя и фамилия студента на момент формирования.
  * `studentEmail`: Электронная почта студента.
  * `parentName`: Имя родителя (если актуально).
  * `joiningDate`: Дата подписания/присоединения.
  * `templateData`: JSONB с исходными переменными, которые использовались шаблоном при генерации.

* **`DocumentsRepository`** ([documents.repository.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/documents/domain/documents.repository.interface.ts))
  Абстрактный класс репозитория:
  * `findMany()` — список всех сохраненных метаданных документов.
  * `findOne(id)` — получить метаданные конкретного документа.
  * `create(data)` — зарегистрировать новый сгенерированный документ.
  * `update(id, data)` — обновить URL файла или другие параметры.
  * `delete(id)` — удалить запись о документе.

---

## 2. Реализация репозитория (`impl`)

* **`PrismaDocumentsRepository`** ([prisma-documents.repository.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/documents/impl/prisma-documents.repository.ts))
  Реализация на Prisma. Напрямую взаимодействует с таблицей `documents`, приводя типы и преобразуя данные в форму `DocumentEntity`.

---

## 3. Сервисный слой (`documents.service.ts`)

* **`DocumentsService`** ([documents.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/features/documents/documents.service.ts))
  * Взаимодействует с зарегистрированным провайдером `'DocumentRenderer'` (сервис `WeasyPrintRendererService`) для компиляции HTML-шаблона в PDF-буфер.
  * Конвертирует бинарный файл в строку `base64` для передачи во фронтенд через API.
  * Создает и сохраняет метаданные документа в базе данных через `DocumentsRepository`.

---

## 4. Контроллер (`documents.controller.ts`)

Определяет эндпоинты API:

* **`GET /documents`** — получить список всех сгенерированных документов (доступ: `admin`, `teacher`).
* **`POST /documents/generate`** — сгенерировать новый PDF документ по шаблону. Принимает JSON с полями `document_type`, `data` (переменные для шаблона) и `language`.
