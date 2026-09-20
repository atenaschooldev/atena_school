-- ============================================================================
-- DROP FOREIGN KEY CONSTRAINTS ON LOGS TABLES
-- Audit logs should never fail or block execution if a user_id is external,
-- mock, or deleted.
-- ============================================================================

ALTER TABLE IF EXISTS public.admin_api_logs DROP CONSTRAINT IF EXISTS admin_api_logs_user_id_fkey;
ALTER TABLE IF EXISTS public.app_api_logs DROP CONSTRAINT IF EXISTS app_api_logs_user_id_fkey;
ALTER TABLE IF EXISTS public.landing_api_logs DROP CONSTRAINT IF EXISTS landing_api_logs_user_id_fkey;
