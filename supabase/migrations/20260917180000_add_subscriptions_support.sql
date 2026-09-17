-- Migration: Add Subscriptions Support and Hybrid Course Monetization
-- Date: 2026-09-17

-- 1. Extend courses table
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS billing_type smallint DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subscription_price numeric,
  ADD COLUMN IF NOT EXISTS stripe_monthly_price_id text;

-- 2. Extend bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status smallint,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- 3. Add subscriptions_enabled setting to app_settings
INSERT INTO app_settings (key, value, description, updated_at)
VALUES (
  'subscriptions_enabled',
  'false'::jsonb,
  'Enable or disable monthly subscription / abbonamento mensile feature on checkout',
  NOW()
)
ON CONFLICT (key) DO NOTHING;

-- 4. Set default billing_type and subscription_price for group language courses
UPDATE courses
SET billing_type = 3,
    subscription_price = price
WHERE category = 'languages'
  AND name NOT ILIKE '%Lezioni Private%'
  AND name NOT ILIKE '%Pacchetto%';
