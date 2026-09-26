-- Migration: 20260926100000_dynamic_academic_year_db_defaults.sql
-- Description: Makes academic_year defaults dynamically calculated based on current Italian academic year (Sep 1 - Aug 31)

CREATE OR REPLACE FUNCTION public.current_academic_year()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT 
    CASE 
      WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 9 
      THEN EXTRACT(YEAR FROM CURRENT_DATE)::text || '/' || (EXTRACT(YEAR FROM CURRENT_DATE) + 1)::text
      ELSE (EXTRACT(YEAR FROM CURRENT_DATE) - 1)::text || '/' || EXTRACT(YEAR FROM CURRENT_DATE)::text
    END;
$$;

-- Update annual_memberships column default
ALTER TABLE public.annual_memberships 
  ALTER COLUMN academic_year SET DEFAULT public.current_academic_year();

-- Update school_profiles column default
ALTER TABLE public.school_profiles 
  ALTER COLUMN academic_year SET DEFAULT public.current_academic_year();
