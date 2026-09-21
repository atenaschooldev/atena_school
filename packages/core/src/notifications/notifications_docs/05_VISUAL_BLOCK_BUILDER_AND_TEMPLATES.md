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

## 2. Детальная спецификация всех 16 типов блоков

### 2.1. Блоки Email (`channel = 1`):

1. **`header` (Шапка письма):**
   * `show_logo`: отображать логотип школы (`boolean`).
   * `custom_title`: переопределить название школы (`string`).
   * `custom_subtitle`: подзаголовок шапки (`string`).
   * `logo_size`: размер логотипа (`sm`, `md`, `lg`).

2. **`greeting` (Приветствие):**
   * `greeting_text`: текст приветствия (`"Ciao {{student_name}}!"`).
   * `subtext`: вступительный абзац (`"Ti confermiamo l'iscrizione al corso."`).

3. **`summary_table` (Сводная таблица бронирования):**
   * `show_course_price`: показывать строку стоимости курса (`boolean`).
   * `show_reg_fee`: показывать строку ежегодного взноса €30 (`boolean`).
   * `show_discount`: показывать скидку по промокоду (`boolean`).
   * `show_total`: показывать итоговую сумму к оплате (`boolean`).
   * `show_schedule`: показывать дни и время уроков (`boolean`).
   * `show_dates`: показывать дату старта (`boolean`).
   * `highlight_color`: цвет акцентной рамки или плашки.

4. **`contact_summary_table` (Карточка лида / сообщения):**
   * `show_sender_info`: контакты клиента (имя, телефон, email).
   * `show_interest`: интересующий курс.
   * `show_message`: полный текст сообщения.

5. **`bank_details` (Банковские реквизиты IBAN):**
   * `iban`: номер IBAN (по умолчанию подтягивается из профиля школы).
   * `account_holder`: владелец счета / ассоциация.
   * `bank_name`: наименование банка.
   * `bic_swift`: BIC/SWIFT код.
   * `payment_reason_template`: назначение платежа (`"Saldo corso {{course_name}} - {{student_name}}"`).

6. **`school_location` (Адрес и часы работы):**
   * `show_address`: юридический / фактический адрес филиала.
   * `show_phone`: телефон секретариата.
   * `show_hours`: часы работы секретариата.
   * `show_map_link`: кнопка открытия в Google Maps.

7. **`cta_button` (Кнопка действия):**
   * `button_text`: текст на кнопке (`"Accedi al Portale Studente"`).
   * `button_url`: ссылка (`"{{dashboard_url}}"`).
   * `button_color`: цвет кнопки (HEX).
   * `alignment`: выравнивание (`left`, `center`, `right`).

8. **`custom_text` (Произвольный HTML / текст):**
   * `content`: текст с разметкой и переменными `{{key}}`.

9. **`notes` (Важные примечания):**
   * `title`: заголовок плашки (`"Importante"`).
   * `content`: текст требований (документы, подтверждение уровня).
   * `style_variant`: `'info'` (синий), `'warning'` (желтый), `'success'` (зеленый).

10. **`footer` (Подвал письма):**
    * `show_social_links`: ссылки на Instagram, Facebook.
    * `show_legal_notes`: реквизиты некоммерческой ассоциации.
    * `custom_copyright`: строка копирайта.

---

### 2.2. Блоки Telegram (`channel = 2`):

11. **`tg_header`:**
    * `title_text`: заголовок сообщения с эмодзи (`"🏛️ *NUOVA ISCRIZIONE*"`).
    * `divider`: разделительная линия (`boolean`).

12. **`tg_student_info`:**
    * `show_purchaser`: выводить блок заказчика/родителя.
    * `show_student`: выводить блок студента/ребенка.
    * `show_tax_code`: выводить Codice Fiscale.
    * `show_fiscal_data`: выводить поля PEC и SDI.

13. **`tg_course_info`:**
    * `show_dates`: дата начала.
    * `show_schedule`: расписание занятий.
    * `show_location`: формат (In Presenza / Online).

14. **`tg_payment_info`:**
    * `show_breakdown`: разбивка (курс + взнос €30 + промокод).
    * `show_status_badge`: статус оплаты (Pagato / Saldo in Sede).

15. **`tg_custom_text`:**
    * `content`: произвольный текст с поддержкой тегов Telegram HTML (`<b>`, `<i>`, `<code>`, `<a href="...">`).

16. **`tg_inline_buttons`:**
    * `enable_settle_fee`: кнопка `fee` (Salda Quota €30).
    * `enable_settle_course`: кнопка `course` (Salda Corso).
    * `enable_settle_all`: кнопка `all` (Salda Tutto).
    * `enable_cancel`: кнопка `cancel` (Annulla).
    * `enable_whatsapp`: прямая ссылка в WhatsApp.
    * `enable_stripe`: ссылка на платеж в Stripe.
    * `enable_crm`: ссылка в карточку CRM.
    * `enable_lang_switch`: кнопка смены языка (`it` / `en`).

---

## 3. Настройки темы (`theme`)

Конструктор позволяет настраивать глобальный стиль письма:
* `header_style`:
  * `'navy_grid'` — фирменный темно-синий градиент с декоративной сеткой.
  * `'clean_white'` — минималистичный белый стиль с темным логотипом.
  * `'dark_gradient'` — элегантный темный фон для премиальных курсов.
* `primary_color`: основной цвет кнопок, плашек и заголовков (HEX).
* `accent_color`: дополнительный цвет для бейджей и выделений.
* `background_pattern`: декоративный геометрический фон.
