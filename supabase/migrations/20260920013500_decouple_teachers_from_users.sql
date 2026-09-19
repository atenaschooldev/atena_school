-- Migration: Decouple teachers table from users table
-- Allows creating teachers in CRM/courses without forcing an auth.users account,
-- and prevents deleting auth.users from cascade deleting teacher records.

-- 1. Add optional user_id referencing users(id) ON DELETE SET NULL
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 2. Populate user_id with existing teacher_id if user exists
UPDATE public.teachers t
SET user_id = u.id
FROM public.users u
WHERE t.teacher_id = u.id AND t.user_id IS NULL;

-- 3. Drop legacy fk_teachers_user constraint
ALTER TABLE public.teachers DROP CONSTRAINT IF EXISTS fk_teachers_user;

-- 4. Set default for teacher_id if not already set
ALTER TABLE public.teachers ALTER COLUMN teacher_id SET DEFAULT gen_random_uuid();
