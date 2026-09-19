-- Migration: Add session_id and guest_identifier to landing_api_logs
-- Date: 2026-09-19
-- Description: Enables persistent guest session and fingerprint tracking across all public API requests.

ALTER TABLE IF EXISTS public.landing_api_logs 
  ADD COLUMN IF NOT EXISTS session_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS guest_identifier VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_landing_api_logs_session_id ON public.landing_api_logs(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_landing_api_logs_guest_identifier ON public.landing_api_logs(guest_identifier) WHERE guest_identifier IS NOT NULL;

COMMENT ON COLUMN public.landing_api_logs.session_id IS 'Persistent anonymous guest session/fingerprint token from cookies or request header.';
COMMENT ON COLUMN public.landing_api_logs.guest_identifier IS 'Candidate email, tax code or identifier extracted from request payload for non-authenticated guests.';
