-- ============================================================================
-- Migration: 20260926090000_fix_documents_schema_jsonb_and_types.sql
-- Description: Standardize JSONB translations for categories & templates,
-- and provide atomic document number sequence
-- ============================================================================

BEGIN;

-- 1. Ensure document_categories has JSONB name and description
DO $$ 
BEGIN
  -- If name_it column exists, migrate to JSONB name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'document_categories' AND column_name = 'name_it'
  ) THEN
    ALTER TABLE public.document_categories ADD COLUMN IF NOT EXISTS name JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE public.document_categories ADD COLUMN IF NOT EXISTS description_jsonb JSONB DEFAULT '{}'::jsonb;

    UPDATE public.document_categories
    SET 
      name = jsonb_build_object(
        'it', COALESCE(name_it, ''),
        'en', COALESCE(name_en, name_it, ''),
        'ru', COALESCE(name_ru, name_it, '')
      ),
      description_jsonb = CASE 
        WHEN description IS NOT NULL AND description <> '' THEN jsonb_build_object('it', description)
        ELSE '{}'::jsonb 
      END
    WHERE name = '{}'::jsonb OR name IS NULL;

    ALTER TABLE public.document_categories 
      DROP COLUMN IF EXISTS name_it,
      DROP COLUMN IF EXISTS name_en,
      DROP COLUMN IF EXISTS name_ru,
      DROP COLUMN IF EXISTS description;

    ALTER TABLE public.document_categories 
      RENAME COLUMN description_jsonb TO description;
  END IF;

  -- Ensure name column is JSONB
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'document_categories' AND column_name = 'name' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.document_categories 
      ALTER COLUMN name TYPE JSONB USING (
        CASE 
          WHEN name IS NULL THEN '{}'::jsonb
          WHEN name::text ~ '^\s*\{' THEN name::text::jsonb 
          ELSE jsonb_build_object('it', name::text)
        END
      );
  END IF;

  -- Ensure description column is JSONB
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'document_categories' AND column_name = 'description' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.document_categories 
      ALTER COLUMN description TYPE JSONB USING (
        CASE 
          WHEN description IS NULL THEN '{}'::jsonb
          WHEN description::text ~ '^\s*\{' THEN description::text::jsonb 
          ELSE jsonb_build_object('it', description::text)
        END
      );
  END IF;
END $$;

-- 2. Ensure document_templates has JSONB name and description
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'document_templates' AND column_name = 'name' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.document_templates 
      ALTER COLUMN name TYPE JSONB USING (
        CASE 
          WHEN name IS NULL THEN '{}'::jsonb
          WHEN name::text ~ '^\s*\{' THEN name::text::jsonb 
          ELSE jsonb_build_object('it', name::text)
        END
      );
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'document_templates' AND column_name = 'description' AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE public.document_templates 
      ALTER COLUMN description TYPE JSONB USING (
        CASE 
          WHEN description IS NULL THEN '{}'::jsonb
          WHEN description::text ~ '^\s*\{' THEN description::text::jsonb 
          ELSE jsonb_build_object('it', description::text)
        END
      );
  END IF;
END $$;

-- 3. Create sequence for document numbering
CREATE SEQUENCE IF NOT EXISTS public.document_number_seq START WITH 1001;

COMMIT;
