-- Migration: Create Active Services View and Performance Indexes
-- Date: 2026-09-17
-- Description: Standard BigTech Virtual View for Active Enrollments / Active Services (Corsi Attivi)

-- 1. Create or Replace View: active_services
CREATE OR REPLACE VIEW active_services AS
SELECT 
  b.id AS booking_id,
  b.student_id,
  b.user_id,
  b.student_name,
  b.student_email,
  b.student_phone,
  b.student_tax_code,
  b.student_birth_date,
  b.purchaser_name,
  b.purchaser_email,
  b.purchaser_phone,
  b.purchaser_tax_code,
  b.course_id,
  COALESCE(b.course_name, c.name, c.title_it) AS course_name,
  c.category AS course_category,
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
LEFT JOIN LATERAL (
  SELECT 
    COUNT(l.id) AS total_scheduled_lessons,
    COUNT(l.id) FILTER (WHERE l.attendance = 2 OR l.status = 2) AS completed_lessons,
    MIN(l.starts_at) FILTER (WHERE l.starts_at >= NOW()) AS next_lesson_at
  FROM lessons l
  WHERE l.booking_id = b.id
) l_stats ON true
WHERE 
  -- Active service criteria:
  -- 1. Payment status is PAID (3) or CONFIRMED on-site
  b.payment_status = 3
  -- 2. Booking status is active (CONFIRMED = 2 or PENDING = 1)
  AND b.booking_status IN (1, 2)
  -- 3. Subscription status is not cancelled
  AND (b.subscription_status IS NULL OR b.subscription_status != 3);

-- 2. Add description comment on View
COMMENT ON VIEW active_services IS 'Virtual Table for active student course enrollments and recurring subscriptions with real-time lesson progress.';

-- 3. Add Partial Performance Indexes on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_active_services
ON bookings (student_id, course_id, payment_status, booking_status);

CREATE INDEX IF NOT EXISTS idx_bookings_active_subscriptions
ON bookings (stripe_subscription_id, subscription_status)
WHERE stripe_subscription_id IS NOT NULL;
