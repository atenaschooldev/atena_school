# Модуль Документов (`documents`)

Этот модуль реализует электронный документооборот: генерацию контрактов на обучение, GDPR-согласий, рисование цифровой подписи на canvas-элементе и скачивание готовых документов.

---

## Архитектура и Структура файлов

```
documents/
├── components/
│   ├── document-pdf-preview.tsx    # Чистый UI-компонент предпросмотра PDF листа (DocumentPdfPreview)
│   ├── document-preview-dialog.tsx # Диалог предпросмотра и подписи контракта
│   └── documenti-view.tsx          # Главная страница (разметка, управление формами)
├── hooks/
│   └── use-documents.ts            # Бизнес-логика, холст подписи, CRUD методы (useDocuments)
├── index.ts                        # Точка экспорта Public API фичи
└── types.ts                        # Схемы данных документов
```

---

## 1. Типы данных (`types.ts`)

- **`DocumentRecord`** ([types.ts](../../features/documents/types.ts))
  - `id`: Уникальный номер контракта (например, `DOC-2026-001`).
  - `studentName`, `studentLastName`: Имя и фамилия студента.
  - `email`, `telefono`: Контакты.
  - `dataIscrizione`: Дата зачисления.
  - `genitoreName`, `genitoreLastName`: Данные о родителе (опционально).
  - `createdAt`: Дата создания документа.

---

## 2. Логика и Состояние (`hooks/use-documents.ts`)

- **`useDocuments`** ([use-documents.ts](../../features/documents/hooks/use-documents.ts))
  Кастомный хук для управления логикой электронного документооборота:
  - Рисование цифровой подписи (события мыши и touch-скрина на HTML5 `<canvas>`).
  - Масштабирование (Zoom) и скачивание/печать документов.
  - Состояние форм ввода данных студента и родителя.

---

## 3. Компоненты Отображения (UI)

- **`DocumentiView`** ([documenti-view.tsx](../../features/documents/components/documenti-view.tsx))
  Легковесный оркестратор страницы документов. Отображает архив договоров в виде `DataTable` или форму создания/просмотра сплит-панели.
- **`DocumentPdfPreview`** ([document-pdf-preview.tsx](../../features/documents/components/document-pdf-preview.tsx))
  Презентационный UI-компонент печатного листа формата A4 с масштабированием, печатью, экспортом и штампом школы.
- **`DocumentPreviewDialog`** ([document-preview-dialog.tsx](../../features/documents/components/document-preview-dialog.tsx))
  Модальное окно просмотра контракта. Генерирует готовый к печати бланк (договор) в фирменном стиле школы, заполняя переменные шаблона данными из анкеты, включая отрисовку цифровой подписи внизу листа.
