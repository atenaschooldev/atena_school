-- Migration: Migrate annual_memberships status column to smallint
-- Table affected: public.annual_memberships (status)

BEGIN;

-- 1. Drop existing default value
ALTER TABLE public.annual_memberships ALTER COLUMN status DROP DEFAULT;

-- 2. Alter column type to smallint with data mapping
ALTER TABLE public.annual_memberships
  ALTER COLUMN status TYPE smallint USING (
    CASE lower(trim(status::text))
      WHEN 'active' THEN 1
      WHEN 'attivo' THEN 1
      WHEN 'valid' THEN 1
      WHEN 'pending' THEN 2
      WHEN 'in_attesa' THEN 2
      WHEN 'in attesa' THEN 2
      WHEN 'expired' THEN 3
      WHEN 'scaduto' THEN 3
      WHEN 'revoked' THEN 4
      WHEN 'cancelled' THEN 4
      WHEN 'revocato' THEN 4
      WHEN 'annullato' THEN 4
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      ELSE 1
    END
  );

-- 3. Set numeric default value
ALTER TABLE public.annual_memberships ALTER COLUMN status SET DEFAULT 1;

COMMIT;
