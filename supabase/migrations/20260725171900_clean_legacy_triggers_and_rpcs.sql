-- Migration: Clean legacy DB business triggers and RPC functions
-- All business logic and enrollment rules are now handled by NestJS apps/backend.

-- 1. Drop legacy DB business triggers
DROP TRIGGER IF EXISTS trg_sync_annual_membership ON public.bookings;
DROP TRIGGER IF EXISTS trg_booking_student_enrollment ON public.bookings;
DROP TRIGGER IF EXISTS booking_status_transition_trigger ON public.bookings;
DROP TRIGGER IF EXISTS trg_sync_annual_membership_students ON public.students;
DROP TRIGGER IF EXISTS trg_sync_annual_membership_payments ON public.payments;
DROP TRIGGER IF EXISTS tr_update_courses_on_student_status_change ON public.students;

-- 2. Drop legacy PL/pgSQL business functions and RPC procedures
DROP FUNCTION IF EXISTS public.sync_annual_membership_on_booking_payment();
DROP FUNCTION IF EXISTS public.handle_booking_student_enrollment();
DROP FUNCTION IF EXISTS public.check_booking_status_transition();
DROP FUNCTION IF EXISTS public.sync_annual_membership_from_students();
DROP FUNCTION IF EXISTS public.sync_annual_membership_from_payments();
DROP FUNCTION IF EXISTS public.update_courses_on_student_status_change();
DROP FUNCTION IF EXISTS public.check_annual_membership_status(text, text, text);
DROP FUNCTION IF EXISTS public.create_or_update_reservation_rpc(uuid, text, text, text, text, text, text, boolean, text, text, text, text, text, text, boolean, text);
DROP FUNCTION IF EXISTS public.get_booking_details_rpc(uuid);
DROP FUNCTION IF EXISTS public.sync_user_profile_from_bookings(uuid, text);
