# Модуль Документов (`documents`)

Этот модуль реализует электронный документооборот: генерацию контрактов на обучение, GDPR-согласий, рисование цифровой подписи на canvas-элементе и скачивание готовых документов.

---

## Архитектура и Структура файлов

```
documents/
├── components/
│   ├── document-preview-dialog.tsx # Диалог предпросмотра и подписи контракта
│   └── documenti-view.tsx          # Список документов и панель заключения договоров
├── index.ts                        # Точка экспорта Public API фичи
└── types.ts                        # Схемы данных документов
```

---

## 1. Типы данных (`types.ts`)

* **`DocumentRecord`** ([types.ts](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/documents/types.ts))
  * `id`: Уникальный номер контракта (например, `DOC-2026-001`).
  * `studentName`, `studentLastName`: Имя и фамилия студента.
  * `email`, `telefono`: Контакты.
  * `dataIscrizione`: Дата зачисления.
  * `genitoreName`, `genitoreLastName`: Данные о родителе (опционально).
  * `createdAt`: Дата создания документа.

---

## 2. Основные компоненты

* **`DocumentiView`** ([documenti-view.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/documents/components/documenti-view.tsx))
  Содержит панель заключения договоров и список всех выписанных контрактов.
  * **Режим создания**: Интерактивный мастер создания договора, где менеджер заполняет анкету и передает планшет клиенту для подписи.
  * **Canvas-подпись**: Интегрированная панель рисования подписи пальцем/мышью на элементе HTML5 `<canvas>` с поддержкой очистки, сохранения в Base64 и вставки в тело печатного документа.

* **`DocumentPreviewDialog`** ([document-preview-dialog.tsx](file:///Users/krimson/PROJECTS/class-bloom-81/src/features/documents/components/document-preview-dialog.tsx))
  Модальное окно просмотра контракта. Генерирует готовый к печати бланк (договор) в фирменном стиле школы, заполняя переменные шаблона данными из анкеты, включая отрисовку цифровой подписи внизу листа.
