-- 1. Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(teacher_id) ON DELETE SET NULL,
    room TEXT,
    max_students INTEGER NOT NULL DEFAULT 8,
    status SMALLINT NOT NULL DEFAULT 1,
    start_date DATE,
    end_date DATE,
    schedule_days INTEGER[],
    start_time TEXT,
    end_time TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_groups_course_id ON public.groups(course_id);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON public.groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_groups_status ON public.groups(status);

-- 2. Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    status SMALLINT NOT NULL DEFAULT 1,
    CONSTRAINT uq_group_student UNIQUE (group_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_student_id ON public.group_members(student_id);
CREATE INDEX IF NOT EXISTS idx_group_members_booking_id ON public.group_members(booking_id);

-- 3. Add group_id to lessons if not exists
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_lessons_group_id ON public.lessons(group_id);
ALTER TABLE public.lessons ALTER COLUMN booking_id DROP NOT NULL;

-- 4. Add group_id to bookings if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_group_id ON public.bookings(group_id);

-- 5. RLS policies
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for active groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on groups" ON public.groups FOR ALL USING (true);
CREATE POLICY "Allow service role full access on group_members" ON public.group_members FOR ALL USING (true);
