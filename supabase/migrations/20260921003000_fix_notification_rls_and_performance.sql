-- ============================================================================
-- ATENA SCHOOL — FIX & OPTIMIZE NOTIFICATION RLS POLICIES
-- ============================================================================
-- Fixes role checks (ADMIN=3, SECRETARY=5, SUPERADMIN=6) and wraps auth.uid()
-- in (SELECT auth.uid()) for optimal per-statement plan evaluation in Postgres.
-- ============================================================================

-- 1. notification_logs
DROP POLICY IF EXISTS "Admins full access to notification_logs" ON notification_logs;
CREATE POLICY "Admins full access to notification_logs" 
ON notification_logs 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = (SELECT auth.uid()) 
      AND users.role IN (3, 5, 6)
  )
);

-- 2. notification_templates
DROP POLICY IF EXISTS "Allow admin full access on notification_templates" ON notification_templates;
CREATE POLICY "Allow admin full access on notification_templates" 
ON notification_templates 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = (SELECT auth.uid()) 
      AND users.role IN (3, 5, 6)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = (SELECT auth.uid()) 
      AND users.role IN (3, 5, 6)
  )
);

-- 3. integration_secrets
DROP POLICY IF EXISTS "Allow admin full access on integration_secrets" ON integration_secrets;
CREATE POLICY "Allow admin full access on integration_secrets" 
ON integration_secrets 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = (SELECT auth.uid()) 
      AND users.role IN (3, 6)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = (SELECT auth.uid()) 
      AND users.role IN (3, 6)
  )
);

-- 4. High-Performance GIN Indexes for Webhook & JSONB lookups
CREATE INDEX IF NOT EXISTS idx_notification_logs_response_gin ON public.notification_logs USING gin (response);
CREATE INDEX IF NOT EXISTS idx_notification_logs_request_gin ON public.notification_logs USING gin (request);
CREATE INDEX IF NOT EXISTS idx_notification_triggers_conditions_gin ON public.notification_triggers USING gin (conditions);

-- 5. Data Retention & Log Lifecycle Automation (Prunes payload blobs older than retention window)
CREATE OR REPLACE FUNCTION public.cleanup_old_notification_logs(days_to_keep INT DEFAULT 90)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INT;
BEGIN
    -- Delete granular raw JSON blobs for logs older than retention period to conserve disk space,
    -- while retaining delivery metrics (id, channel, status, recipient, created_at)
    UPDATE public.notification_logs
    SET 
        request = jsonb_build_object('archived', true, 'purged_at', NOW()),
        response = jsonb_build_object('archived', true, 'purged_at', NOW())
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL
      AND (request != '{"archived": true}'::jsonb OR response != '{"archived": true}'::jsonb);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


