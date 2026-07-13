# Общие абстракции и сервисы (`src/shared`)

Директория `src/shared` содержит переиспользуемые контракты и их инфраструктурные реализации, которые не привязаны к конкретной бизнес-фиче, а используются сквозь всю систему.

---

## Структура директории

```
src/shared/
├── abstractions/   # Интерфейсы и абстрактные классы (контракты)
└── impl/           # Конкретные реализации (драйверы, утилиты)
```

---

## 1. Абстракции (`abstractions`)

Определяют контракты взаимодействия для сторонних систем. Бизнес-логика в фичах (например, генерация договоров в `documents`) должна зависеть только от этих абстракций.

* **`DocumentRenderer`** ([document-renderer.interface.ts](file:///Users/krimson/PROJECTS/nest_backend/src/shared/abstractions/document-renderer.interface.ts))
  Интерфейс для рендеринга PDF-файлов. Содержит единственный метод:
  ```typescript
  export interface DocumentRenderer {
    render(templateName: string, data: any, language?: string): Promise<Buffer>;
  }
  ```

---

## 2. Реализации (`impl`)

Инфраструктурные модули, реализующие общие абстракции.

* **`WeasyPrintRendererService`** ([weasyprint-renderer.service.ts](file:///Users/krimson/PROJECTS/nest_backend/src/shared/impl/weasyprint-renderer.service.ts))
  Реализует интерфейс `DocumentRenderer` с использованием шаблонизатора **Handlebars** и консольной утилиты **WeasyPrint**:
  
  1. **Поиск шаблона**: Ищет `.hbs` файл шаблона в папке `templates/` по переданному имени `templateName` (с поддержкой локализации, например: `contract.it.hbs` или `contract.it.html`).
  2. **Сборка HTML**: Компилирует шаблон и подставляет в него динамические данные `data` (например, имя студента, дату начала обучения и т.д.).
  3. **Конвертация в PDF**: Запускает CLI команду `weasyprint` через системный процесс `exec` (модуль `child_process`) для рендеринга HTML в готовый PDF-файл.
  
  * **Отказоустойчивость (Mock Fallback)**:
    Если утилита `weasyprint` не установлена на сервере разработки, сервис выведет предупреждение в консоль и сгенерирует простой текстовый PDF-файл средствами Node.js (запись HTML текста в буфер), предотвращая сбой работы API в локальном окружении.

---

## Как заменить вендора генерации PDF

Благодаря жесткому разделению на интерфейс и реализацию, заменить WeasyPrint на другой инструмент (например, **Puppeteer** или облачный API-сервис) можно за три простых шага:

1. Создать новую реализацию в папке `impl/` (например, `puppeteer-renderer.service.ts`), имплементирующую интерфейс `DocumentRenderer`.
2. Зарегистрировать её в `documents.module.ts`:
   ```typescript
   {
     provide: 'DocumentRenderer',
     useClass: PuppeteerRendererService, // Замена класса
   }
   ```
3. Никаких изменений в `documents.service.ts` делать не потребуется, так как он зависит исключительно от токена `'DocumentRenderer'`.
