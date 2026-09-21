# 🖥️ 06. Админка, Аудит и Логирование

Административный интерфейс модуля уведомлений (`apps/admin/src/features/notifications`) предоставляет инструменты для визуального редактирования шаблонов, тестирования и аудита доставок.

---

## 1. Компоненты панели управления

1. **`NotificationsView` (`notifications-view.tsx`):**
   * Корневой экран с табами: **Шаблоны**, **Триггеры**, **Журнал отправок (Логи)** и **Статистика**.
2. **`VisualTemplateBuilder` (`visual-template-builder.tsx`):**
   * Полнофункциональный визуальный No-Code конструктор блоков с перетаскиванием (drag-and-drop), редактированием параметров блоков (цвета, шрифты, заголовки) и интерактивным live preview.
3. **`TriggerEditorDrawer` (`trigger-editor-drawer.tsx`):**
   * Боковая панель для инспекции системных правил и условий фильтрации.
4. **`TestSendModal` (`test-send-modal.tsx`):**
   * Инструмент мгновенной отправки тестового письма или Telegram-сообщения на указанный адрес/чат с подстановкой тестовых данных для проверки верстки перед публикацией.
5. **`NotificationLogsView` (`notification-logs-view.tsx`):**
   * Таблица аудита с фильтрами по каналам (Email/Telegram), статусу (`SENT`/`FAILED`), поиском по email получателя и просмотром полного JSON payload запроса и ответа провайдера.
   * Кнопка **Повторить отправку (Retry)** для сбойных писем.

---

## 2. Схема базы данных (PostgreSQL DDL)

### 2.1. Таблица шаблонов (`notification_templates`)
```sql
CREATE TABLE public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    channel SMALLINT NOT NULL DEFAULT 1,         -- 1: EMAIL, 2: TELEGRAM
    notification_type SMALLINT NOT NULL DEFAULT 1,-- 1: BOOKING, 2: RECEIPT, 3: REMINDER, 4: MEMBERSHIP, 5: CONTACT
    recipient_type SMALLINT NOT NULL DEFAULT 1,   -- 1: CUSTOMER, 2: ADMIN, 3: TEACHER
    subject TEXT,
    body_html TEXT,
    body_text TEXT,
    blocks_config JSONB,                        -- Visual block compiler schema
    available_variables TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_code ON public.notification_templates(code);
CREATE INDEX idx_notification_templates_channel ON public.notification_templates(channel);
```

### 2.2. Таблица журнала отправок (`notification_logs`)
```sql
CREATE TABLE public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel SMALLINT NOT NULL,                  -- 1: EMAIL, 2: TELEGRAM
    notification_type SMALLINT NOT NULL,        -- 1: BOOKING, 2: RECEIPT, 3: REMINDER, 4: MEMBERSHIP, 5: CONTACT
    recipient TEXT NOT NULL,                    -- Email or Telegram Chat ID
    subject TEXT,                               -- Email Subject
    request JSONB NOT NULL DEFAULT '{}'::jsonb, -- { payload, userId, bookingId, provider }
    response JSONB,                             -- { messageId, error, svixId }
    status SMALLINT NOT NULL,                   -- 1: SENT, 2: FAILED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_created_at ON public.notification_logs(created_at DESC);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notification_logs_recipient ON public.notification_logs(recipient);
CREATE INDEX idx_notification_logs_channel ON public.notification_logs(channel);
```

---

## 3. Политика безопасности и обработка ошибок

* **Изоляция секретов:** Секреты (`RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`) никогда не возвращаются на клиентскую сторону админки в открытом виде (маскируются при чтении).
* **Неблокирующая доставка:** Ошибки при отправке вторичных алертов (например, Telegram для секретариата) перехватываются через `try/catch` и логируются в `console.warn` и `notification_logs`, не прерывая успешный ответ пользователю при чекауте.
* **RLS Policies (Row Level Security):** Таблицы шаблонов и логов доступны на чтение и запись только аутентифицированным администраторам с ролью `admin` или через `service_role`.
