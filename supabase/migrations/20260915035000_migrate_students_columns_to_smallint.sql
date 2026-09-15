-- Migration: migrate students table columns (status, language_level) to SMALLINT
-- Status: 1 = ACTIVE, 2 = INACTIVE, 3 = PAUSED, 4 = GRADUATED, 5 = ARCHIVED
-- LanguageLevel: 1 = A1, 2 = A2, 3 = B1, 4 = B2, 5 = C1, 6 = C2

DO $$
BEGIN
  -- 1. Migrate status column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.students 
      ALTER COLUMN status DROP DEFAULT,
      ALTER COLUMN status TYPE SMALLINT USING (
        CASE 
          WHEN LOWER(TRIM(status::text)) IN ('1', 'active', 'attivo') THEN 1
          WHEN LOWER(TRIM(status::text)) IN ('2', 'inactive', 'inattivo', 'pending', 'in_attesa') THEN 2
          WHEN LOWER(TRIM(status::text)) IN ('3', 'paused', 'in_pausa', 'in pausa') THEN 3
          WHEN LOWER(TRIM(status::text)) IN ('4', 'graduated', 'diplomato', 'concluso') THEN 4
          WHEN LOWER(TRIM(status::text)) IN ('5', 'archived', 'archiviato') THEN 5
          ELSE 1
        END
      ),
      ALTER COLUMN status SET DEFAULT 1,
      ALTER COLUMN status SET NOT NULL;
  END IF;

  -- 2. Migrate language_level column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'language_level'
  ) THEN
    ALTER TABLE public.students 
      ALTER COLUMN language_level DROP DEFAULT,
      ALTER COLUMN language_level TYPE SMALLINT USING (
        CASE 
          WHEN UPPER(TRIM(language_level::text)) IN ('1', 'A1') THEN 1
          WHEN UPPER(TRIM(language_level::text)) IN ('2', 'A2') THEN 2
          WHEN UPPER(TRIM(language_level::text)) IN ('3', 'B1') THEN 3
          WHEN UPPER(TRIM(language_level::text)) IN ('4', 'B2') THEN 4
          WHEN UPPER(TRIM(language_level::text)) IN ('5', 'C1') THEN 5
          WHEN UPPER(TRIM(language_level::text)) IN ('6', 'C2') THEN 6
          ELSE 1
        END
      ),
      ALTER COLUMN language_level SET DEFAULT 1,
      ALTER COLUMN language_level SET NOT NULL;
  END IF;
END $$;
