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

-- 2. Email Logs (Resend / SMTP Notification Audit)
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recipient VARCHAR(255) NOT NULL,
    notification_type SMALLINT NOT NULL,
    subject VARCHAR(255),
    request JSONB NOT NULL,
    response JSONB,
    status SMALLINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_notification_type ON email_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to email_logs"
    ON email_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role IN (1, 2)
        )
    );

-- 3. Telegram Logs (Telegram Bot Notifications Audit)
CREATE TABLE IF NOT EXISTS telegram_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    chat_id VARCHAR(64) NOT NULL,
    notification_type SMALLINT NOT NULL,
    message_text TEXT NOT NULL,
    request JSONB,
    response JSONB,
    status SMALLINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telegram_logs_chat_id ON telegram_logs(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_logs_notification_type ON telegram_logs(notification_type);
CREATE INDEX IF NOT EXISTS idx_telegram_logs_status ON telegram_logs(status);
CREATE INDEX IF NOT EXISTS idx_telegram_logs_created_at ON telegram_logs(created_at DESC);

ALTER TABLE telegram_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to telegram_logs"
    ON telegram_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role IN (1, 2)
        )
    );
