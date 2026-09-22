-- ============================================================================
-- Migration: Create course_categories table, add category_id to courses,
-- and synchronize course teachers in course_teachers
-- ============================================================================

-- 1. Create course_categories table
CREATE TABLE IF NOT EXISTS public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for categories lookup
CREATE INDEX IF NOT EXISTS idx_course_categories_slug ON public.course_categories(slug);
CREATE INDEX IF NOT EXISTS idx_course_categories_is_active ON public.course_categories(is_active);

-- 2. Enable RLS on course_categories
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active course categories" ON public.course_categories;
CREATE POLICY "Public can view active course categories"
  ON public.course_categories
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users have full access to course categories" ON public.course_categories;
CREATE POLICY "Authenticated users have full access to course categories"
  ON public.course_categories
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. Seed initial standard categories
INSERT INTO public.course_categories (id, slug, name, description, sort_order, is_active)
VALUES
  (
    '00000000-0000-0000-0001-000000000001',
    'languages',
    'Corsi di Lingua',
    'Inglese, Italiano, Tedesco, Spagnolo, Francese e altre lingue straniere',
    1,
    TRUE
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    'academic',
    'Recupero Scolastico',
    'Doposcuola, ripetizioni individuali e supporto allo studio per studenti di tutte le età',
    2,
    TRUE
  ),
  (
    '00000000-0000-0000-0001-000000000003',
    'certipass',
    'Certificazioni EIPASS',
    'Certificazioni informatiche e digitali riconosciute dal MIUR e spendibili in concorsi',
    3,
    TRUE
  ),
  (
    '00000000-0000-0000-0001-000000000004',
    'other',
    'Altro / Generale',
    'Corsi speciali, seminari e attività formative generali',
    4,
    TRUE
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 4. Add category_id column to courses if not exists
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.course_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_category_id ON public.courses(category_id) WHERE category_id IS NOT NULL;

-- 5. Migrate existing courses to category_id based on category smallint
UPDATE public.courses
SET category_id = CASE
  WHEN category = 1 THEN '00000000-0000-0000-0001-000000000001'::uuid
  WHEN category = 2 THEN '00000000-0000-0000-0001-000000000002'::uuid
  WHEN category = 3 THEN '00000000-0000-0000-0001-000000000003'::uuid
  WHEN category = 4 THEN '00000000-0000-0000-0001-000000000004'::uuid
  ELSE '00000000-0000-0000-0001-000000000001'::uuid
END
WHERE category_id IS NULL;

-- 6. Ensure course_teachers table exists and has proper indexes
CREATE TABLE IF NOT EXISTS public.course_teachers (
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(teacher_id) ON DELETE CASCADE,
  role SMALLINT NOT NULL DEFAULT 1,
  is_primary BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (course_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_course_teachers_teacher_id ON public.course_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_course_teachers_course_id ON public.course_teachers(course_id);

-- 7. Sync all existing teacher_id from courses into course_teachers as primary teachers
INSERT INTO public.course_teachers (course_id, teacher_id, role, is_primary)
SELECT c.id, c.teacher_id, 1, true
FROM public.courses c
WHERE c.teacher_id IS NOT NULL
ON CONFLICT (course_id, teacher_id) DO UPDATE SET
  is_primary = true,
  role = 1;
