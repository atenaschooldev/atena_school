-- Migration: Migrate lessons status, attendance, and location_type enum columns to smallint
-- Table affected: public.lessons (status, attendance, location_type)

BEGIN;

-- 1. Drop existing default values
ALTER TABLE public.lessons ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.lessons ALTER COLUMN attendance DROP DEFAULT;
ALTER TABLE public.lessons ALTER COLUMN location_type DROP DEFAULT;

-- 2. Alter column types to smallint with data mapping
ALTER TABLE public.lessons
  ALTER COLUMN status TYPE smallint USING (
    CASE lower(trim(status::text))
      WHEN 'scheduled' THEN 1
      WHEN 'programmata' THEN 1
      WHEN 'completed' THEN 2
      WHEN 'completata' THEN 2
      WHEN 'cancelled' THEN 3
      WHEN 'annullata' THEN 3
      WHEN 'rescheduled' THEN 4
      WHEN 'riprogrammata' THEN 4
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      ELSE 1
    END
  );

ALTER TABLE public.lessons
  ALTER COLUMN attendance TYPE smallint USING (
    CASE lower(trim(attendance::text))
      WHEN 'pending' THEN 1
      WHEN 'in_attesa' THEN 1
      WHEN 'present' THEN 2
      WHEN 'presente' THEN 2
      WHEN 'absent' THEN 3
      WHEN 'assente' THEN 3
      WHEN 'late' THEN 4
      WHEN 'in_ritardo' THEN 4
      WHEN 'excused' THEN 5
      WHEN 'giustificato' THEN 5
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      WHEN '5' THEN 5
      ELSE 1
    END
  );

ALTER TABLE public.lessons
  ALTER COLUMN location_type TYPE smallint USING (
    CASE lower(trim(location_type::text))
      WHEN 'in_person' THEN 1
      WHEN 'in_presenza' THEN 1
      WHEN 'presenza' THEN 1
      WHEN 'offline' THEN 1
      WHEN 'online' THEN 2
      WHEN 'hybrid' THEN 3
      WHEN 'ibrido' THEN 3
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      ELSE 1
    END
  );

-- 3. Set numeric default values
ALTER TABLE public.lessons ALTER COLUMN status SET DEFAULT 1;
ALTER TABLE public.lessons ALTER COLUMN attendance SET DEFAULT 1;
ALTER TABLE public.lessons ALTER COLUMN location_type SET DEFAULT 1;

COMMIT;
