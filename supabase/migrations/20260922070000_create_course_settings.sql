-- ============================================================================
-- Migration: Create course_settings presets table & link courses.settings_id -> course_settings.id
-- Timestamp: 20260922070000
-- Description:
--   1. Creates public.course_settings table (standalone configuration templates/presets).
--   2. Adds settings_id UUID REFERENCES course_settings(id) ON DELETE SET NULL to courses table.
--   3. Populates settings from existing courses and links each course to its course_settings record.
--   4. Configures RLS policies for read and write.
-- ============================================================================

-- 1. Create or alter course_settings table
CREATE TABLE IF NOT EXISTS public.course_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Configurazione Corso',
    
    -- 1=FIXED_SCHEDULE, 2=FLEXIBLE_SCHEDULE, 4=CERTIFICATION
    delivery_mode SMALLINT NOT NULL DEFAULT 1,
    
    schedule_days INT[] DEFAULT '{}',
    start_time VARCHAR(8),
    end_time VARCHAR(8),
    lesson_duration_minutes INT,
    lessons_per_week INT,
    total_lessons INT,
    total_hours NUMERIC(5,2),
    
    min_students INT DEFAULT 1,
    max_students INT DEFAULT 8,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure name column exists if table was created previously
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'course_settings' AND column_name = 'name'
    ) THEN
        ALTER TABLE public.course_settings ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Configurazione Corso';
    END IF;
END $$;

-- 2. Add settings_id column to courses if not exists
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS settings_id UUID REFERENCES public.course_settings(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_courses_settings_id ON public.courses(settings_id);

-- 3. Populate course_settings and link courses.settings_id
DO $$
DECLARE
    r RECORD;
    new_settings_id UUID;
    calc_mode SMALLINT;
    setting_name TEXT;
BEGIN
    FOR r IN SELECT * FROM public.courses LOOP
        calc_mode := CASE 
            WHEN r.course_format = 4 THEN 4 -- CERTIFICATION
            WHEN r.schedule_type = 2 THEN 2 -- FLEXIBLE_SCHEDULE
            ELSE 1                          -- FIXED_SCHEDULE
        END;
        
        setting_name := CASE 
            WHEN calc_mode = 4 THEN COALESCE(r.name, 'Corso') || ' (EIPASS ' || COALESCE(r.total_hours::text, '30') || 'h)'
            WHEN calc_mode = 2 THEN COALESCE(r.name, 'Corso') || ' (Flessibile ' || COALESCE(r.lesson_duration_minutes::text, '60') || 'm)'
            ELSE COALESCE(r.name, 'Corso') || ' (' || COALESCE(r.start_time, '') || '-' || COALESCE(r.end_time, '') || ')'
        END;

        -- Check if course already has a settings_id
        IF r.settings_id IS NULL THEN
            INSERT INTO public.course_settings (
                name,
                delivery_mode,
                schedule_days,
                start_time,
                end_time,
                lesson_duration_minutes,
                lessons_per_week,
                total_lessons,
                total_hours,
                min_students,
                max_students
            ) VALUES (
                setting_name,
                calc_mode,
                COALESCE(r.schedule_days, '{}'),
                r.start_time,
                r.end_time,
                r.lesson_duration_minutes,
                r.lessons_per_week,
                r.total_lessons,
                r.total_hours,
                1,
                8
            ) RETURNING id INTO new_settings_id;

            UPDATE public.courses SET settings_id = new_settings_id WHERE id = r.id;
        ELSE
            -- Update existing settings record with latest course values and name
            UPDATE public.course_settings SET
                name = setting_name,
                delivery_mode = calc_mode,
                schedule_days = COALESCE(r.schedule_days, '{}'),
                start_time = r.start_time,
                end_time = r.end_time,
                lesson_duration_minutes = r.lesson_duration_minutes,
                lessons_per_week = r.lessons_per_week,
                total_lessons = r.total_lessons,
                total_hours = r.total_hours,
                updated_at = now()
            WHERE id = r.settings_id;
        END IF;
    END LOOP;
END $$;

-- 4. Clean up any obsolete course_id column from course_settings if it existed in prior iteration
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'course_settings' AND column_name = 'course_id'
    ) THEN
        ALTER TABLE public.course_settings DROP COLUMN course_id CASCADE;
    END IF;
END $$;

-- 5. Enable RLS
ALTER TABLE public.course_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated and anonymous clients
DROP POLICY IF EXISTS "Allow public read access to course_settings" ON public.course_settings;
CREATE POLICY "Allow public read access to course_settings"
    ON public.course_settings
    FOR SELECT
    USING (true);

-- Allow full access to service_role
DROP POLICY IF EXISTS "Allow service_role full access to course_settings" ON public.course_settings;
CREATE POLICY "Allow service_role full access to course_settings"
    ON public.course_settings
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role' OR auth.role() = 'service_role');

-- 6. Grants
GRANT ALL ON public.course_settings TO postgres, service_role;
GRANT SELECT ON public.course_settings TO anon, authenticated;

