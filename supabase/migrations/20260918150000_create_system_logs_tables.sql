-- ============================================================================
-- ATENA SCHOOL — SYSTEM LOGS TABLES (API, EMAIL, TELEGRAM)
-- ============================================================================

-- 1. API Logs (Backend Controllers & Actions Audit)
CREATE TABLE IF NOT EXISTS api_logs (
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

CREATE INDEX IF NOT EXISTS idx_api_logs_controller_action ON api_logs(controller, action);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);

ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to api_logs"
    ON api_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role IN (1, 2)
        )
    );

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
