-- Migration: Migrate payments status/enum columns to smallint
-- Tables affected: public.payments (currency, payment_method, type, status, provider)

BEGIN;

-- 1. Drop existing default values
ALTER TABLE public.payments ALTER COLUMN currency DROP DEFAULT;
ALTER TABLE public.payments ALTER COLUMN payment_method DROP DEFAULT;
ALTER TABLE public.payments ALTER COLUMN type DROP DEFAULT;
ALTER TABLE public.payments ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.payments ALTER COLUMN provider DROP DEFAULT;

-- 2. Alter column types to smallint with data mapping
ALTER TABLE public.payments
  ALTER COLUMN currency TYPE smallint USING (
    CASE lower(trim(currency))
      WHEN 'eur' THEN 1
      WHEN 'usd' THEN 2
      WHEN 'gbp' THEN 3
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      ELSE 1
    END
  );

ALTER TABLE public.payments
  ALTER COLUMN payment_method TYPE smallint USING (
    CASE lower(trim(payment_method))
      WHEN 'stripe' THEN 1
      WHEN 'card_online' THEN 1
      WHEN 'card' THEN 1
      WHEN 'cash' THEN 2
      WHEN 'contanti' THEN 2
      WHEN 'pos' THEN 3
      WHEN 'bank_transfer' THEN 4
      WHEN 'transfer' THEN 4
      WHEN 'bonifico' THEN 4
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      ELSE 2
    END
  );

ALTER TABLE public.payments
  ALTER COLUMN type TYPE smallint USING (
    CASE lower(trim(type))
      WHEN 'payment' THEN 1
      WHEN 'course_payment' THEN 1
      WHEN 'registration_fee' THEN 2
      WHEN 'installment' THEN 3
      WHEN 'single_lesson' THEN 4
      WHEN 'exam_fee' THEN 5
      WHEN 'certificate_fee' THEN 6
      WHEN 'textbook_material' THEN 7
      WHEN 'material_textbook' THEN 7
      WHEN 'other' THEN 8
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      WHEN '5' THEN 5
      WHEN '6' THEN 6
      WHEN '7' THEN 7
      WHEN '8' THEN 8
      ELSE 1
    END
  );

ALTER TABLE public.payments
  ALTER COLUMN status TYPE smallint USING (
    CASE lower(trim(status))
      WHEN 'pending' THEN 1
      WHEN 'succeeded' THEN 2
      WHEN 'completed' THEN 2
      WHEN 'paid' THEN 2
      WHEN 'failed' THEN 3
      WHEN 'refunded' THEN 4
      WHEN 'partially_refunded' THEN 5
      WHEN 'cancelled' THEN 6
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      WHEN '5' THEN 5
      WHEN '6' THEN 6
      ELSE 2
    END
  );

ALTER TABLE public.payments
  ALTER COLUMN provider TYPE smallint USING (
    CASE lower(trim(provider))
      WHEN 'stripe' THEN 1
      WHEN 'manual' THEN 2
      WHEN 'pos' THEN 3
      WHEN 'manual_pos' THEN 3
      WHEN 'pos_terminal' THEN 3
      WHEN 'bank' THEN 4
      WHEN 'direct_bank' THEN 4
      WHEN '1' THEN 1
      WHEN '2' THEN 2
      WHEN '3' THEN 3
      WHEN '4' THEN 4
      ELSE 2
    END
  );

-- 3. Set numeric default values
ALTER TABLE public.payments ALTER COLUMN currency SET DEFAULT 1;
ALTER TABLE public.payments ALTER COLUMN payment_method SET DEFAULT 2;
ALTER TABLE public.payments ALTER COLUMN type SET DEFAULT 1;
ALTER TABLE public.payments ALTER COLUMN status SET DEFAULT 2;
ALTER TABLE public.payments ALTER COLUMN provider SET DEFAULT 2;

COMMIT;
