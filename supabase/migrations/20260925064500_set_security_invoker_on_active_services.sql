-- Migration: Set security_invoker = true on active_services view
-- Ensures RLS from underlying tables (bookings, courses, students, lessons) is strictly enforced for client callers

ALTER VIEW public.active_services SET (security_invoker = true);
