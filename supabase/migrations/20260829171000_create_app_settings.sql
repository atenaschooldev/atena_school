-- Migration: Create app_settings table for dynamic system configurations (e.g. Stripe toggle)

CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default stripe setting (disabled for MVP)
INSERT INTO public.app_settings (key, value, description)
VALUES ('stripe_enabled', 'false'::jsonb, 'Enable or disable Stripe online payment gateway on checkout')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for landing page checkout queries)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Allow public read access on app_settings'
  ) THEN
    CREATE POLICY "Allow public read access on app_settings"
      ON public.app_settings
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Allow service_role full access (for backend admin updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Allow service_role full access on app_settings'
  ) THEN
    CREATE POLICY "Allow service_role full access on app_settings"
      ON public.app_settings
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
