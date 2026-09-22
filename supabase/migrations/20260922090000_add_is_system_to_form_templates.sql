-- ============================================================================
-- Migration: Add is_system to form_templates; protect built-in system templates
-- Timestamp: 20260922090000
-- Description:
--   1. Adds is_system BOOLEAN column to public.form_templates.
--   2. Creates index on is_system for fast filtering.
--   3. Marks the two built-in system templates as is_system = true.
--   4. Adds DB-level protection: prevents deletion of system templates via trigger.
-- ============================================================================

-- 1. Add is_system column
ALTER TABLE public.form_templates
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Index
CREATE INDEX IF NOT EXISTS idx_form_templates_is_system ON public.form_templates(is_system);

-- 3. Mark built-in templates as system
UPDATE public.form_templates
SET is_system = true
WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002'
);

-- 4. DB-level protection: disallow DELETE on system templates
CREATE OR REPLACE FUNCTION public.prevent_system_template_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_system = true THEN
        RAISE EXCEPTION 'Cannot delete system form template: %', OLD.id;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_system_templates ON public.form_templates;
CREATE TRIGGER protect_system_templates
    BEFORE DELETE ON public.form_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_system_template_deletion();
