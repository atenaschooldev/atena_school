# 🎨 05. Визуальный конструктор и компилятор блоков

Компилятор блоков [block-compiler.ts](file:///Users/krimson/PROJECTS/atena_school/packages/core/src/notifications/block-compiler.ts) преобразует декларативную JSON-конфигурацию блоков (`blocks_config`) в адаптивный HTML для Email или форматированный текст для Telegram.

---

## 1. Схема JSON-блока (`TemplateBlock`)

Каждый визуальный шаблон состоит из массива блоков:

```ts
export type TemplateBlockType =
  | 'header'
  | 'greeting'
  | 'summary_table'
  | 'contact_summary_table'
  | 'cta_button'
  | 'bank_details'
  | 'school_location'
  | 'notes'
  | 'custom_text'
  | 'footer'
  | 'tg_header'
  | 'tg_student_info'
  | 'tg_course_info'
  | 'tg_payment_info'
  | 'tg_custom_text'
  | 'tg_inline_buttons';

export interface TemplateBlock {
  id: string;
  type: TemplateBlockType;
  title: string;
  is_enabled: boolean;
  order: number;
  props: Record<string, any>;
}

export interface TemplateBlocksConfig {
  version: number;
  channel: NotificationChannel;
  theme?: {
    primary_color?: string;
    accent_color?: string;
    background_pattern?: boolean;
    header_style?: 'navy_grid' | 'clean_white' | 'dark_gradient';
  };
  blocks: TemplateBlock[];
}
```

---

## 2. Доступные типы блоков

### 2.1. Для Email (`channel = 1`):
* `header` — брендовая шапка с логотипом школы, градиентом или navy-grid паттерном.
* `greeting` — персонализированное приветствие с подстановкой имени (`Ciao {{student_name}}!`).
* `summary_table` — сводная таблица бронирования (курс, даты, расписание, финансовая разбивка: курс + взнос €30 + скидка).
* `contact_summary_table` — карточка сообщения из контактной формы лендинга.
* `bank_details` — блок с реквизитами IBAN, назначением платежа и инструкциями для банковского перевода.
* `school_location` — блок с адресом филиала, картой и часами работы.
* `cta_button` — кнопка перехода (например, в Личный кабинет студента).
* `custom_text` — произвольный HTML / текст с поддержкой переменных `{{key}}`.
* `notes` — акцентная плашка с важными примечаниями (документы, тест уровня).
* `footer` — подвал письма с контактами школы, реквизитами ассоциации, ссылками на соцсети и копирайтом.

### 2.2. Для Telegram (`channel = 2`):
* `tg_header` — заголовок алерта с эмодзи (`🏛️ NUOVA ISCRIZIONE`).
* `tg_student_info` — блок анкетных данных покупателя и студента (имя, телефон, Codice Fiscale).
* `tg_course_info` — блок информации о курсе (название, расписание, дата старта).
* `tg_payment_info` — блок финансового статуса (оплачено онлайн / ожидается в секретариате).
* `tg_custom_text` — произвольный текст с поддержкой HTML-тегов Telegram (`<b>`, `<i>`, `<code>`).
* `tg_inline_buttons` — конфигурация интерактивных кнопок быстрых действий.

---

## 3. Компиляция и автозамена переменных

Функции компиляции в `@atena/core`:
* `renderEmailFromBlocks(blocksConfig, variables, schoolProfile)` — формирует полный HTML-документ с табличной версткой и inline-стилями для почтовых клиентов.
* `renderTelegramFromBlocks(blocksConfig, variables)` — генерирует структурированное сообщение для Telegram Bot API с экранированием тегов.
* `compileTemplateVariables(text, variables)` — производит замену тегов `{{variable_name}}` на переданные значения (при отсутствии переменной подставляется пустая строка).
