-- ============================================================================
-- Migration: 20260926060000_performance_indexes_and_cron.sql
-- Purpose:
--   1. Add performance B-Tree composite indexes for high-frequency queries
--   2. Maintenance functions for auto-expiring stale bookings & memberships
--   3. Safe pg_cron job registration (if pg_cron is enabled)
-- ============================================================================

-- 1. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_purchaser_email
  ON public.bookings (purchaser_email);

CREATE INDEX IF NOT EXISTS idx_bookings_created_status
  ON public.bookings (created_at DESC, payment_status);

CREATE INDEX IF NOT EXISTS idx_bookings_student_id
  ON public.bookings (student_id);

CREATE INDEX IF NOT EXISTS idx_lessons_student_starts_at
  ON public.lessons (student_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_lessons_course_starts_at
  ON public.lessons (course_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_payments_booking_status
  ON public.payments (booking_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_created_at
  ON public.payments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status_created
  ON public.notification_logs (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annual_memberships_tax_year
  ON public.annual_memberships (tax_code, academic_year);

CREATE INDEX IF NOT EXISTS idx_admin_api_logs_created_at
  ON public.admin_api_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_api_logs_created_at
  ON public.app_api_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_landing_api_logs_created_at
  ON public.landing_api_logs (created_at DESC);


-- 2. Maintenance Functions

-- 2.1 Expire stale pending Stripe bookings (> 24 hours without payment)
CREATE OR REPLACE FUNCTION public.expire_stale_pending_stripe_bookings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count integer := 0;
BEGIN
  -- Status 0 = PENDING, Status 2 = CANCELLED
  -- Payment Method: 2 (Stripe)
  UPDATE public.bookings
  SET 
    payment_status = 2, -- CANCELLED
    notes = COALESCE(notes, '') || ' [Auto-cancelled: Stripe checkout expired after 24 hours]',
    updated_at = NOW()
  WHERE 
    payment_status = 0
    AND payment_method = 2
    AND created_at < (NOW() - INTERVAL '24 hours');

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- 2.2 Expire annual memberships past their expiry date
CREATE OR REPLACE FUNCTION public.expire_annual_memberships()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated_count integer := 0;
BEGIN
  -- Status: 'active' -> 'expired'
  UPDATE public.annual_memberships
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE 
    status = 'active'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$$;

-- 2.3 Cleanup API logs older than N days (default 90) across all 3 log tables
CREATE OR REPLACE FUNCTION public.cleanup_old_api_logs(p_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count integer := 0;
  v_temp integer := 0;
BEGIN
  DELETE FROM public.admin_api_logs WHERE created_at < (NOW() - (p_days || ' days')::INTERVAL);
  GET DIAGNOSTICS v_temp = ROW_COUNT;
  v_deleted_count := v_deleted_count + v_temp;

  DELETE FROM public.app_api_logs WHERE created_at < (NOW() - (p_days || ' days')::INTERVAL);
  GET DIAGNOSTICS v_temp = ROW_COUNT;
  v_deleted_count := v_deleted_count + v_temp;

  DELETE FROM public.landing_api_logs WHERE created_at < (NOW() - (p_days || ' days')::INTERVAL);
  GET DIAGNOSTICS v_temp = ROW_COUNT;
  v_deleted_count := v_deleted_count + v_temp;

  RETURN v_deleted_count;
END;
$$;


-- 3. pg_cron Setup (Safe registration if pg_cron extension is available)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Cancel existing jobs if they were already scheduled
    PERFORM cron.unschedule(jobname)
    FROM cron.job
    WHERE jobname IN ('atena_daily_cleanup', 'atena_expire_bookings', 'atena_expire_memberships');

    -- Schedule daily maintenance at 03:00 UTC
    PERFORM cron.schedule(
      'atena_expire_bookings',
      '0 */6 * * *', -- Every 6 hours
      'SELECT public.expire_stale_pending_stripe_bookings();'
    );

    PERFORM cron.schedule(
      'atena_expire_memberships',
      '0 3 * * *', -- Daily at 03:00 UTC
      'SELECT public.expire_annual_memberships();'
    );

    PERFORM cron.schedule(
      'atena_daily_cleanup',
      '30 3 * * 0', -- Every Sunday at 03:30 UTC
      'SELECT public.cleanup_old_api_logs(90);'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore error if pg_cron schema or privileges are restricted
    RAISE NOTICE 'pg_cron registration skipped: %', SQLERRM;
END;
$$;
