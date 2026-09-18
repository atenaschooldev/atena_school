-- Migration: Add automatic membership_number generator trigger on annual_memberships
-- Date: 2026-09-18
-- Description: Automatically assigns ATN-YYYY-XXXX to any active membership created or updated without a membership_number.

CREATE OR REPLACE FUNCTION public.set_membership_number_if_missing()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  existing_count INT;
BEGIN
  -- Only trigger when status is ACTIVE (1) and membership_number is NULL
  IF NEW.status = 1 AND (NEW.membership_number IS NULL OR trim(NEW.membership_number) = '') THEN
    year_prefix := split_part(COALESCE(NEW.academic_year, '2026/2027'), '/', 1);
    
    SELECT COUNT(*)
    INTO existing_count
    FROM public.annual_memberships
    WHERE academic_year = NEW.academic_year
      AND membership_number IS NOT NULL;
      
    NEW.membership_number := 'ATN-' || year_prefix || '-' || lpad((existing_count + 1)::text, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_membership_number ON public.annual_memberships;

CREATE TRIGGER trg_assign_membership_number
BEFORE INSERT OR UPDATE ON public.annual_memberships
FOR EACH ROW
EXECUTE FUNCTION public.set_membership_number_if_missing();

COMMENT ON FUNCTION public.set_membership_number_if_missing() IS 'Safety trigger to ensure all active memberships always receive sequential ATN-YYYY-XXXX number.';
