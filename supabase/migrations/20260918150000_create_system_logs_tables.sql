-- ============================================================================
-- ATENA SCHOOL — SYSTEM LOGS TABLES (API LOGS BY APP & NOTIFICATIONS)
-- ============================================================================

-- Drop old api_logs if exists
DROP TABLE IF EXISTS api_logs;

-- 1. Landing API Logs (Landing / Public API Audit)
CREATE TABLE IF NOT EXISTS landing_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    controller VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role SMALLINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request JSONB,
    response JSONB,
    status_code INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_landing_api_logs_controller_action ON landing_api_logs(controller, action);
CREATE INDEX IF NOT EXISTS idx_landing_api_logs_user_id ON landing_api_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_landing_api_logs_status_code ON landing_api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_landing_api_logs_created_at ON landing_api_logs(created_at DESC);

ALTER TABLE landing_api_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access to landing_api_logs' AND tablename = 'landing_api_logs') THEN
        CREATE POLICY "Admins full access to landing_api_logs" ON landing_api_logs FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2)));
    END IF;
END $$;

-- 2. App API Logs (Student / Client Portal API Audit)
CREATE TABLE IF NOT EXISTS app_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    controller VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role SMALLINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request JSONB,
    response JSONB,
    status_code INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_api_logs_controller_action ON app_api_logs(controller, action);
CREATE INDEX IF NOT EXISTS idx_app_api_logs_user_id ON app_api_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_api_logs_status_code ON app_api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_app_api_logs_created_at ON app_api_logs(created_at DESC);

ALTER TABLE app_api_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access to app_api_logs' AND tablename = 'app_api_logs') THEN
        CREATE POLICY "Admins full access to app_api_logs" ON app_api_logs FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2)));
    END IF;
END $$;

-- 3. Admin API Logs (CRM / Staff API Audit)
CREATE TABLE IF NOT EXISTS admin_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    controller VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role SMALLINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request JSONB,
    response JSONB,
    status_code INT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_api_logs_controller_action ON admin_api_logs(controller, action);
CREATE INDEX IF NOT EXISTS idx_admin_api_logs_user_id ON admin_api_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admin_api_logs_status_code ON admin_api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_admin_api_logs_created_at ON admin_api_logs(created_at DESC);

ALTER TABLE admin_api_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access to admin_api_logs' AND tablename = 'admin_api_logs') THEN
        CREATE POLICY "Admins full access to admin_api_logs" ON admin_api_logs FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2)));
    END IF;
END $$;

-- 2. Notification Logs (Unified Email & Telegram Notifications)
DROP TABLE IF EXISTS email_logs;
DROP TABLE IF EXISTS telegram_logs;

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    channel SMALLINT NOT NULL,          -- 1: EMAIL, 2: TELEGRAM
    notification_type SMALLINT NOT NULL,-- 1: BOOKING_CONFIRMATION, 2: PAYMENT_RECEIPT, etc.
    recipient VARCHAR(255) NOT NULL,    -- Email address or Telegram chat_id
    subject VARCHAR(255),               -- Email subject or message title
    request JSONB NOT NULL,             -- Request payload / template variables
    response JSONB,                     -- Response from Resend / Telegram API
    status SMALLINT NOT NULL            -- 1: SENT, 2: FAILED
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient ON notification_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_type ON notification_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);

ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins full access to notification_logs' AND tablename = 'notification_logs') THEN
        CREATE POLICY "Admins full access to notification_logs" ON notification_logs FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2)));
    END IF;
END $$;
