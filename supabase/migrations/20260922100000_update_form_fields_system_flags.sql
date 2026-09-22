-- Migration: Correct is_system flags on form_fields catalog
-- Description:
--   Only core checkout/contact billing & identity fields are marked is_system = true.
--   Preset/customizable fields like 'heard_from', 'study_level', 'special_requests' are set to is_system = false.

UPDATE public.form_fields
SET is_system = FALSE, updated_at = now()
WHERE key IN ('heard_from', 'study_level', 'special_requests');

UPDATE public.form_fields
SET is_system = TRUE, updated_at = now()
WHERE key IN (
  'purchaser_first_name', 'purchaser_last_name', 'purchaser_email', 'purchaser_phone',
  'purchaser_birth_date', 'purchaser_birth_place', 'purchaser_tax_code', 'purchaser_address',
  'sdi_code',
  'student_first_name', 'student_last_name', 'student_tax_code',
  'student_birth_date', 'student_birth_place', 'student_email', 'student_phone',
  'contact_name', 'contact_email', 'contact_phone', 'contact_subject', 'contact_message'
);
