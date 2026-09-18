-- Migration: Update Active Services View with strict payment criteria and annual membership indicators
-- Date: 2026-09-18
-- Description: Ensures active_services only includes courses that are genuinely paid/active, and surfaces student_annual_fee_paid.

DROP VIEW IF EXISTS public.active_services CASCADE;

CREATE VIEW public.active_services 
WITH (security_invoker = true) AS
SELECT 
  b.id AS booking_id,
  b.student_id,
  b.user_id,
  b.student_name,
  b.student_email,
  b.student_phone,
  b.student_tax_code,
  b.student_birth_date,
  COALESCE(s.annual_fee_paid, false) AS student_annual_fee_paid,
  s.annual_fee_paid_at AS student_annual_fee_paid_at,
  b.purchaser_name,
  b.purchaser_email,
  b.purchaser_phone,
  b.purchaser_tax_code,
  b.course_id,
  COALESCE(b.course_name, c.name) AS course_name,
  c.category AS course_category,
  c.course_format,
  c.schedule_type AS course_schedule_type,
  b.billing_scheme,
  b.payment_status,
  b.booking_status,
  b.scheduling_status,
  b.payment_method,
  b.amount_paid,
  b.registration_fee,
  b.stripe_customer_id,
  b.stripe_subscription_id,
  b.subscription_status,
  b.subscription_starts_at,
  b.subscription_ends_at,
  b.cancel_at_period_end,
  b.start_date,
  b.start_time,
  b.end_time,
  b.schedule_days,
  b.total_lessons_count,
  
  -- Aggregated lesson metrics
  COALESCE(l_stats.completed_lessons, 0) AS completed_lessons_count,
  COALESCE(l_stats.total_scheduled_lessons, 0) AS scheduled_lessons_count,
  GREATEST(COALESCE(b.total_lessons_count, 0) - COALESCE(l_stats.completed_lessons, 0), 0) AS remaining_lessons_count,
  l_stats.next_lesson_at,
  
  b.created_at,
  b.updated_at
FROM bookings b
LEFT JOIN courses c ON b.course_id = c.id
LEFT JOIN students s ON b.student_id = s.id
LEFT JOIN LATERAL (
  SELECT 
    COUNT(l.id) AS total_scheduled_lessons,
    COUNT(l.id) FILTER (WHERE l.attendance = 2 OR l.status = 2) AS completed_lessons,
    MIN(l.starts_at) FILTER (WHERE l.starts_at >= NOW()) AS next_lesson_at
  FROM lessons l
  WHERE l.booking_id = b.id
) l_stats ON true
WHERE 
  -- 1. Booking is active (not cancelled or completed)
  b.booking_status = 1
  -- 2. Fact of payment for the course is confirmed (Full payment, active Stripe subscription, or verified course payment in ledger)
  AND (
    b.payment_status = 3 -- PAID
    OR b.subscription_status = 1 -- Stripe Subscription ACTIVE
    OR EXISTS (
      SELECT 1 FROM payments p 
      WHERE p.booking_id = b.id 
        AND p.type = 1 -- COURSE_PAYMENT
        AND p.status = 2 -- PAID
    )
  )
  -- 3. Subscription is not cancelled
  AND (b.subscription_status IS NULL OR b.subscription_status != 3);

COMMENT ON VIEW active_services IS 'Virtual Table for active student course enrollments and recurring subscriptions with real-time lesson progress and annual membership fee indicators.';
