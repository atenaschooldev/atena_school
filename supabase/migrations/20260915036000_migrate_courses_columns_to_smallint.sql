-- Migration: migrate courses table columns (status, schedule_type, course_format) to SMALLINT
-- status: 1 = ACTIVE, 2 = DRAFT, 3 = ARCHIVED
-- schedule_type: 1 = FIXED, 2 = FLEXIBLE
-- course_format: 1 = GROUP, 2 = INDIVIDUAL, 3 = ONLINE, 4 = CERTIFICATION

DO $$
BEGIN
  -- 1. Drop dependent RLS policy if exists
  DROP POLICY IF EXISTS "courses_select_public" ON public.courses;

  -- 2. Migrate status column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.courses 
      ALTER COLUMN status DROP DEFAULT,
      ALTER COLUMN status TYPE SMALLINT USING (
        CASE 
          WHEN LOWER(TRIM(status::text)) IN ('1', 'active', 'attivo', 'published') THEN 1
          WHEN LOWER(TRIM(status::text)) IN ('2', 'draft', 'bozza', 'in-programmazione', 'in_programmazione', 'scheduled', 'planned') THEN 2
          WHEN LOWER(TRIM(status::text)) IN ('3', 'archived', 'archiviato', 'concluded', 'completed', 'concluso') THEN 3
          ELSE 1
        END
      ),
      ALTER COLUMN status SET DEFAULT 1,
      ALTER COLUMN status SET NOT NULL;
  END IF;

  -- 3. Migrate schedule_type column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'schedule_type'
  ) THEN
    ALTER TABLE public.courses 
      ALTER COLUMN schedule_type DROP DEFAULT,
      ALTER COLUMN schedule_type TYPE SMALLINT USING (
        CASE 
          WHEN LOWER(TRIM(schedule_type::text)) IN ('1', 'fixed', 'fisso') THEN 1
          WHEN LOWER(TRIM(schedule_type::text)) IN ('2', 'flexible', 'flessibile', 'da concordare', 'da_concordare') THEN 2
          ELSE 1
        END
      ),
      ALTER COLUMN schedule_type SET DEFAULT 1,
      ALTER COLUMN schedule_type SET NOT NULL;
  END IF;

  -- 4. Migrate course_format column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'course_format'
  ) THEN
    ALTER TABLE public.courses 
      ALTER COLUMN course_format DROP DEFAULT,
      ALTER COLUMN course_format TYPE SMALLINT USING (
        CASE 
          WHEN LOWER(TRIM(course_format::text)) IN ('1', 'group', 'gruppo', 'di gruppo', 'di_gruppo', 'in sede') THEN 1
          WHEN LOWER(TRIM(course_format::text)) IN ('2', 'individual', 'individuale', 'private', 'privato') THEN 2
          WHEN LOWER(TRIM(course_format::text)) IN ('3', 'online') THEN 3
          WHEN LOWER(TRIM(course_format::text)) IN ('4', 'certification', 'certificazione', 'esame', 'certipass') THEN 4
          ELSE 1
        END
      ),
      ALTER COLUMN course_format SET DEFAULT 1,
      ALTER COLUMN course_format SET NOT NULL;
  END IF;

  -- 5. Recreate RLS policy with status = 1 (CourseStatus.ACTIVE)
  CREATE POLICY "courses_select_public" ON public.courses
    FOR SELECT TO public
    USING (status = 1);

END $$;
