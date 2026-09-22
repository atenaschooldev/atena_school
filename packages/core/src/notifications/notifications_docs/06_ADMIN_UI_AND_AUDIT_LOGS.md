# 🖥️ 06. Админка, Аудит и Логирование

Административный интерфейс модуля уведомлений (`apps/admin/src/features/notifications`) предоставляет инструменты для визуального редактирования шаблонов, инспекции триггеров, тестирования и аудита доставок.

---

## 1. Компоненты панели управления

1. **`NotificationsView` (`notifications-view.tsx`):**
   * Корневой экран с тремя ключевыми вкладками:
     * **Шаблоны (Templates):** сводные метрики (всего шаблонов, Email, Telegram, активные), фильтрация по каналам и статусам, табличный список, переключатели активности и вызов редакторов.
     * **Триггеры (Triggers):** просмотр системных правил автоматизации, связанных событий и условий фильтрации.
     * **Журнал отправок (Logs):** постраничный просмотр истории доставок.
2. **`VisualTemplateBuilder` (`visual-template-builder.tsx`):**
   * Двухканальный визуальный конструктор блоков с перетаскиванием (@dnd-kit), редактированием свойств блоков (цвета темы, стили шапки, тексты) и live preview.
3. **`TriggerEditorDrawer` (`trigger-editor-drawer.tsx`):**
   * Боковая панель для детальной инспекции правил триггеров, параметров задержки и условий.
4. **`TestSendModal` (`test-send-modal.tsx`):**
   * Модальное окно тестовой отправки письма или Telegram-сообщения на указанный адрес / чат с тестовыми данными.
5. **`NotificationLogsView` (`notification-logs-view.tsx`):**
   * Таблица истории отправок с фильтрами по каналам (Email/Telegram), статусу (`SENT`/`FAILED`), поиском по адресату/теме, пагинацией и диалоговым окном детального просмотра сырого JSON payload и ответа провайдера (с таймлайном webhook-событий Resend).

---

## 2. Схема базы данных (PostgreSQL DDL / Prisma)

### 2.1. Таблица шаблонов (`notification_templates`)
```sql
CREATE TABLE public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel SMALLINT NOT NULL DEFAULT 1,          -- 1: EMAIL, 2: TELEGRAM
    notification_type SMALLINT NOT NULL DEFAULT 1,-- 1: BOOKING, 2: RECEIPT, 3: REMINDER, 4: MEMBERSHIP, 5: CONTACT
    recipient_type SMALLINT NOT NULL DEFAULT 1,   -- 1: CUSTOMER, 2: ADMIN, 3: TEACHER
    subject VARCHAR(255),
    body_html TEXT,
    body_text TEXT NOT NULL DEFAULT '',
    available_variables JSONB DEFAULT '[]'::jsonb,
    blocks_config JSONB,                          -- Schema TemplateBlocksConfig
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_templates_code ON public.notification_templates(code);
CREATE INDEX idx_notification_templates_channel ON public.notification_templates(channel);
CREATE INDEX idx_notification_templates_recipient_type ON public.notification_templates(recipient_type);
CREATE INDEX idx_notification_templates_is_active ON public.notification_templates(is_active);
```

### 2.2. Таблица триггеров (`notification_triggers`)
```sql
CREATE TABLE public.notification_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_key VARCHAR(100) NOT NULL,
    notification_template_id UUID NOT NULL REFERENCES public.notification_templates(id) ON DELETE CASCADE,
    channel SMALLINT NOT NULL DEFAULT 1,
    recipient_type SMALLINT NOT NULL DEFAULT 1,
    custom_recipient VARCHAR(255),
    conditions JSONB DEFAULT '{}'::jsonb,
    timing_type SMALLINT NOT NULL DEFAULT 1,  -- 1: IMMEDIATE, 2: DELAYED, 3: BEFORE_EVENT
    delay_seconds INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_triggers_event_key ON public.notification_triggers(event_key);
CREATE INDEX idx_notification_triggers_is_active ON public.notification_triggers(is_active);
CREATE INDEX idx_notification_triggers_notification_template_id ON public.notification_triggers(notification_template_id);
```

### 2.3. Таблица журнала отправок (`notification_logs`)
```sql
CREATE TABLE public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel SMALLINT NOT NULL,                  -- 1: EMAIL, 2: TELEGRAM
    notification_type SMALLINT NOT NULL,        -- 1: BOOKING, 2: RECEIPT, 3: REMINDER, 4: MEMBERSHIP, 5: CONTACT
    recipient VARCHAR(255) NOT NULL,            -- Email or Telegram Chat ID
    subject VARCHAR(255),                       -- Email Subject or Telegram Title
    request JSONB NOT NULL,                     -- { payload, userId, bookingId, provider, etc. }
    response JSONB,                             -- { messageId, error, webhook_events, etc. }
    status SMALLINT NOT NULL,                   -- 1: SENT, 2: FAILED
    notification_trigger_id UUID REFERENCES public.notification_triggers(id) ON DELETE SET NULL,
    notification_template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_created_at ON public.notification_logs(created_at DESC);
CREATE INDEX idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX idx_notification_logs_recipient ON public.notification_logs(recipient);
CREATE INDEX idx_notification_logs_channel ON public.notification_logs(channel);
CREATE INDEX idx_notification_logs_notification_type ON public.notification_logs(notification_type);
CREATE INDEX idx_notification_logs_trigger_id ON public.notification_logs(notification_trigger_id);
CREATE INDEX idx_notification_logs_template_id ON public.notification_logs(notification_template_id);
```

---

## 3. Безопасность и отказоустойчивость

* **Изоляция секретов:** Секреты (`RESEND_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) никогда не возвращаются в открытом виде на клиент и безопасно резолвятся на сервере.
* **Неблокирующая доставка:** Ошибки отправки вторичных алертов перехватываются через `try/catch` и не блокируют основные транзакции чекаута.
* **RLS и RBAC:** В админке доступ к просмотру и управлению шаблонами ограничен ролями `admin` и `secretary` через `AuthGuard` и `RolesGuard`.
