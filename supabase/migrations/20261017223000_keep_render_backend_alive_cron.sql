-- ==============================================================================
-- PING RENDER BACKEND TO PREVENT SLEEP MODE (COLD STARTS)
-- ==============================================================================
-- Render Free Tier Web Services go to sleep after 15 minutes of inactivity.
-- This cron job uses Supabase pg_cron + pg_net to ping /health every 10 minutes.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Unschedule previous job if exists
DO $$
BEGIN
  PERFORM cron.unschedule('keep-render-alive');
EXCEPTION WHEN OTHERS THEN
  -- ignore if not found
END $$;

-- Schedule keep-alive ping every 10 minutes
SELECT cron.schedule(
  'keep-render-alive',
  '*/10 * * * *',
  'SELECT net.http_get(url := ''https://atena-backend.onrender.com/health'');'
);
