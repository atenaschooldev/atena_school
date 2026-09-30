-- ============================================================================
-- Migration: Allow multiple targets in form_fields table
-- Timestamp: 20260930043000
-- Description:
--   Expands the `target` column in `public.form_fields` from VARCHAR(32) to VARCHAR(128)
--   to support multiple comma-separated targets (e.g., 'purchaser,student,booking,contact').
-- ============================================================================

ALTER TABLE IF EXISTS public.form_fields 
  ALTER COLUMN target TYPE VARCHAR(128);
