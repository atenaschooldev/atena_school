-- Migration: Initialize Sentry in integration_secrets table
-- Date: 2026-09-23

INSERT INTO public.integration_secrets (provider, credentials, is_active, updated_at)
VALUES ('sentry', '{"dsn": ""}'::jsonb, true, NOW())
ON CONFLICT (provider) DO NOTHING;
