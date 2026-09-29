-- ============================================================================
-- Migration: Standardize Course Presets and Decouple Course Schedule
-- Timestamp: 20260930030000
-- Description:
--   1. Ensures public.courses table has standalone schedule and format columns
--      (schedule_days, start_time, end_time, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours, delivery_mode).
--   2. Backfills each course's schedule fields from existing course_settings.
--   3. Creates clean, standard educational presets in public.course_settings.
--   4. Re-links courses.settings_id to standard reusable presets.
--   5. Purges legacy auto-generated per-course config garbage rows from course_settings.
-- ============================================================================

-- 1. Ensure courses table has schedule and format columns
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS schedule_days INT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS start_time VARCHAR(8),
  ADD COLUMN IF NOT EXISTS end_time VARCHAR(8),
  ADD COLUMN IF NOT EXISTS lesson_duration_minutes INT,
  ADD COLUMN IF NOT EXISTS lessons_per_week INT,
  ADD COLUMN IF NOT EXISTS total_lessons INT,
  ADD COLUMN IF NOT EXISTS total_hours NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS delivery_mode SMALLINT DEFAULT 1;

-- 2. Backfill courses columns from their current course_settings
UPDATE public.courses c
SET
  schedule_days = COALESCE(cs.schedule_days, '{}'),
  start_time = cs.start_time,
  end_time = cs.end_time,
  lesson_duration_minutes = cs.lesson_duration_minutes,
  lessons_per_week = cs.lessons_per_week,
  total_lessons = cs.total_lessons,
  total_hours = cs.total_hours,
  delivery_mode = COALESCE(cs.delivery_mode, 1)
FROM public.course_settings cs
WHERE c.settings_id = cs.id;

-- 3. Insert standard reusable presets (checking name existence)
INSERT INTO public.course_settings (
  name, delivery_mode, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours, min_students, max_students, schedule_days
)
SELECT 'Gruppo Standard (75 min • 2x/settimana)', 1, 75, 2, NULL, NULL, 3, 8, '{}'
WHERE NOT EXISTS (SELECT 1 FROM public.course_settings WHERE name = 'Gruppo Standard (75 min • 2x/settimana)');

INSERT INTO public.course_settings (
  name, delivery_mode, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours, min_students, max_students, schedule_days
)
SELECT 'Gruppo Intensivo (90 min • 3x/settimana)', 1, 90, 3, NULL, NULL, 3, 10, '{}'
WHERE NOT EXISTS (SELECT 1 FROM public.course_settings WHERE name = 'Gruppo Intensivo (90 min • 3x/settimana)');

INSERT INTO public.course_settings (
  name, delivery_mode, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours, min_students, max_students, schedule_days
)
SELECT 'Bambini & Kids (45-60 min • 2x/settimana)', 1, 60, 2, NULL, NULL, 3, 8, '{}'
WHERE NOT EXISTS (SELECT 1 FROM public.course_settings WHERE name = 'Bambini & Kids (45-60 min • 2x/settimana)');

INSERT INTO public.course_settings (
  name, delivery_mode, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours, min_students, max_students, schedule_days
)
SELECT 'Pacchetto Lezioni Private (60 min • 10 lezioni)', 2, 60, NULL, 10, NULL, 1, 1, '{}'
WHERE NOT EXISTS (SELECT 1 FROM public.course_settings WHERE name = 'Pacchetto Lezioni Private (60 min • 10 lezioni)');

INSERT INTO public.course_settings (
  name, delivery_mode, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours, min_students, max_students, schedule_days
)
SELECT 'Lezione Singola Individuale (60 min • 1 lezione)', 2, 60, NULL, 1, NULL, 1, 1, '{}'
WHERE NOT EXISTS (SELECT 1 FROM public.course_settings WHERE name = 'Lezione Singola Individuale (60 min • 1 lezione)');

INSERT INTO public.course_settings (
  name, delivery_mode, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours, min_students, max_students, schedule_days
)
SELECT 'Certificazioni EIPASS / MIUR (30 Ore)', 4, NULL, NULL, NULL, 30.00, 1, 8, '{}'
WHERE NOT EXISTS (SELECT 1 FROM public.course_settings WHERE name = 'Certificazioni EIPASS / MIUR (30 Ore)');

-- 4. Re-link courses.settings_id to standard presets
DO $$
DECLARE
  preset_standard_id BIGINT;
  preset_intensivo_id BIGINT;
  preset_kids_id BIGINT;
  preset_pack10_id BIGINT;
  preset_single_id BIGINT;
  preset_eipass_id BIGINT;
BEGIN
  SELECT id INTO preset_standard_id FROM public.course_settings WHERE name = 'Gruppo Standard (75 min • 2x/settimana)' ORDER BY id DESC LIMIT 1;
  SELECT id INTO preset_intensivo_id FROM public.course_settings WHERE name = 'Gruppo Intensivo (90 min • 3x/settimana)' ORDER BY id DESC LIMIT 1;
  SELECT id INTO preset_kids_id FROM public.course_settings WHERE name = 'Bambini & Kids (45-60 min • 2x/settimana)' ORDER BY id DESC LIMIT 1;
  SELECT id INTO preset_pack10_id FROM public.course_settings WHERE name = 'Pacchetto Lezioni Private (60 min • 10 lezioni)' ORDER BY id DESC LIMIT 1;
  SELECT id INTO preset_single_id FROM public.course_settings WHERE name = 'Lezione Singola Individuale (60 min • 1 lezione)' ORDER BY id DESC LIMIT 1;
  SELECT id INTO preset_eipass_id FROM public.course_settings WHERE name = 'Certificazioni EIPASS / MIUR (30 Ore)' ORDER BY id DESC LIMIT 1;

  -- Link Certifications
  UPDATE public.courses
  SET settings_id = preset_eipass_id
  WHERE delivery_mode = 4 OR name ILIKE 'EIPASS%';

  -- Link Single Private Lesson
  UPDATE public.courses
  SET settings_id = preset_single_id
  WHERE delivery_mode = 2 AND total_lessons = 1;

  -- Link Private Package & Flexible
  UPDATE public.courses
  SET settings_id = preset_pack10_id
  WHERE delivery_mode = 2 AND (total_lessons IS NULL OR total_lessons > 1);

  -- Link Kids
  UPDATE public.courses
  SET settings_id = preset_kids_id
  WHERE delivery_mode = 1 AND (name ILIKE '%Kids%' OR name ILIKE '%Toddlers%' OR name ILIKE '%Beginners%' OR name ILIKE '%Starters%');

  -- Link Standard Group
  UPDATE public.courses
  SET settings_id = preset_standard_id
  WHERE delivery_mode = 1 AND (settings_id IS NULL OR settings_id NOT IN (preset_kids_id, preset_intensivo_id, preset_eipass_id, preset_pack10_id, preset_single_id));
END $$;

-- 5. Delete legacy auto-generated per-course config junk rows
DELETE FROM public.course_settings
WHERE id NOT IN (
  SELECT DISTINCT settings_id FROM public.courses WHERE settings_id IS NOT NULL
)
AND id NOT IN (
  SELECT id FROM public.course_settings WHERE name IN (
    'Gruppo Standard (75 min • 2x/settimana)',
    'Gruppo Intensivo (90 min • 3x/settimana)',
    'Bambini & Kids (45-60 min • 2x/settimana)',
    'Pacchetto Lezioni Private (60 min • 10 lezioni)',
    'Lezione Singola Individuale (60 min • 1 lezione)',
    'Certificazioni EIPASS / MIUR (30 Ore)'
  )
);
