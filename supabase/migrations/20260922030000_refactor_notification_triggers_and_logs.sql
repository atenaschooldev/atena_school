-- ============================================================================
-- Migration: 20260922030000_refactor_notification_triggers_and_logs.sql
-- Description:
-- 1. notification_triggers:
--    - Rename template_id -> notification_template_id
--    - Convert timing_type from VARCHAR(50) to SMALLINT (1: IMMEDIATE, 2: DELAYED, 3: BEFORE_EVENT)
-- 2. notification_logs:
--    - Add notification_trigger_id UUID (FK to notification_triggers.id ON DELETE SET NULL)
--    - Add notification_template_id UUID (FK to notification_templates.id ON DELETE SET NULL)
--    - Add indexes on notification_trigger_id and notification_template_id
-- ============================================================================

-- 1. notification_triggers: Rename template_id -> notification_template_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'notification_triggers' 
          AND column_name = 'template_id'
    ) THEN
        ALTER TABLE public.notification_triggers RENAME COLUMN template_id TO notification_template_id;
    END IF;
END $$;

-- Update index name if old one exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'notification_triggers' AND indexname = 'idx_notification_triggers_template_id') THEN
        ALTER INDEX public.idx_notification_triggers_template_id RENAME TO idx_notification_triggers_notification_template_id;
    ELSIF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'notification_triggers' AND indexname = 'idx_notification_triggers_notification_template_id') THEN
        CREATE INDEX idx_notification_triggers_notification_template_id ON public.notification_triggers(notification_template_id);
    END IF;
END $$;

-- 2. notification_triggers: Convert timing_type to SMALLINT (1: IMMEDIATE, 2: DELAYED, 3: BEFORE_EVENT)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'notification_triggers' 
          AND column_name = 'timing_type' 
          AND data_type = 'character varying'
    ) THEN
        ALTER TABLE public.notification_triggers ALTER COLUMN timing_type DROP DEFAULT;

        ALTER TABLE public.notification_triggers 
          ALTER COLUMN timing_type TYPE SMALLINT 
          USING (
            CASE 
              WHEN timing_type = 'immediate' THEN 1
              WHEN timing_type = 'delayed' THEN 2
              WHEN timing_type = 'before_event' THEN 3
              WHEN timing_type ~ '^[0-9]+$' THEN timing_type::smallint
              ELSE 1
            END
          );

        ALTER TABLE public.notification_triggers ALTER COLUMN timing_type SET DEFAULT 1;
    END IF;
END $$;

-- 3. notification_logs: Add notification_trigger_id and notification_template_id
ALTER TABLE public.notification_logs
  ADD COLUMN IF NOT EXISTS notification_trigger_id UUID REFERENCES public.notification_triggers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notification_template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_trigger_id ON public.notification_logs(notification_trigger_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_template_id ON public.notification_logs(notification_template_id);
