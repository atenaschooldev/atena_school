-- ============================================================================
-- ATENA SCHOOL — INTEGRATION SECRETS (WHITE-LABEL SECRETS VAULT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integration_secrets (
    provider VARCHAR(50) PRIMARY KEY, -- 'resend', 'telegram', 'stripe'
    credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Index on provider
CREATE INDEX IF NOT EXISTS idx_integration_secrets_provider ON public.integration_secrets(provider);

-- Enable RLS
ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;

-- 1. Service role has full access
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on integration_secrets' AND tablename = 'integration_secrets') THEN
        CREATE POLICY "Allow service_role full access on integration_secrets" ON public.integration_secrets
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 2. Authenticated Admin has full access (role = 3)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin full access on integration_secrets' AND tablename = 'integration_secrets') THEN
        CREATE POLICY "Allow admin full access on integration_secrets" ON public.integration_secrets
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 3))
        WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 3));
    END IF;
END $$;

-- 3. Grant Table-Level Permissions
GRANT ALL ON TABLE public.integration_secrets TO postgres, service_role, authenticated;
