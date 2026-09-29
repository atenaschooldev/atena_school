-- ============================================================================
-- Migration: Clean up course_settings to pure educational format presets
-- Timestamp: 20260930033000
-- Description:
--   1. Drops per-instance schedule columns (schedule_days, start_time, end_time) from course_settings.
--   2. Drops min_students and max_students from course_settings (capacity belongs to groups).
--   3. Keeps pure format attributes: delivery_mode, lesson_duration_minutes, lessons_per_week, total_lessons, total_hours.
-- ============================================================================

ALTER TABLE public.course_settings
  DROP COLUMN IF EXISTS min_students,
  DROP COLUMN IF EXISTS max_students,
  DROP COLUMN IF EXISTS schedule_days,
  DROP COLUMN IF EXISTS start_time,
  DROP COLUMN IF EXISTS end_time;
