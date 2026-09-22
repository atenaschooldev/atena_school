-- ============================================================================
-- Migration: Enhance promo_codes table with applicable_course_ids and max_uses_per_user
-- ============================================================================

-- 1. Add applicable_course_ids and max_uses_per_user columns to promo_codes
ALTER TABLE public.promo_codes
  ADD COLUMN IF NOT EXISTS applicable_course_ids UUID[] DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS max_uses_per_user INT DEFAULT NULL;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_codes_applicable_courses ON public.promo_codes USING gin(applicable_course_ids);
CREATE INDEX IF NOT EXISTS idx_bookings_promo_code_id ON public.bookings(promo_code_id) WHERE promo_code_id IS NOT NULL;
