-- Migration: Clean legacy DB business triggers and RPC functions
-- All business logic and enrollment rules are now handled by NestJS apps/backend.

-- 1. Drop legacy DB business triggers
DROP TRIGGER IF EXISTS trg_sync_annual_membership ON public.bookings;
DROP TRIGGER IF EXISTS trg_booking_student_enrollment ON public.bookings;
DROP TRIGGER IF EXISTS booking_status_transition_trigger ON public.bookings;
DROP TRIGGER IF EXISTS trg_sync_annual_membership_students ON public.students;
DROP TRIGGER IF EXISTS trg_sync_annual_membership_payments ON public.payments;
DROP TRIGGER IF EXISTS tr_update_courses_on_student_status_change ON public.students;

-- 2. Drop legacy PL/pgSQL business functions and RPC procedures dynamically
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
        WHERE pg_namespace.nspname = 'public' 
          AND proname IN (
            'sync_annual_membership_on_booking_payment',
            'handle_booking_student_enrollment',
            'check_booking_status_transition',
            'sync_annual_membership_from_students',
            'sync_annual_membership_from_payments',
            'update_courses_on_student_status_change',
            'check_annual_membership_status',
            'create_or_update_reservation_rpc',
            'get_booking_details_rpc',
            'sync_user_profile_from_bookings',
            'get_booking_details',
            'admin_set_booking_paid',
            'create_student_with_auth',
            'create_teacher_with_auth',
            'update_course_student_count'
          )
    ) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.proname) || '(' || r.argtypes || ') CASCADE';
    END LOOP;
END $$;
