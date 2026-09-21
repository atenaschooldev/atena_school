-- 1. Drop all updated_at triggers and function (now handled explicitly in TypeScript via new Date().toISOString())
DROP TRIGGER IF EXISTS set_app_settings_updated_at ON public.app_settings;
DROP TRIGGER IF EXISTS set_contact_messages_updated_at ON public.contact_messages;
DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
DROP TRIGGER IF EXISTS set_teachers_updated_at ON public.teachers;
DROP TRIGGER IF EXISTS set_updated_at ON public.students;
DROP TRIGGER IF EXISTS set_updated_at ON public.teachers;
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_attendance_records_updated_at ON public.attendance_records;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- 2. Drop legacy membership number generator trigger (now handled deterministically in TypeScript)
DROP TRIGGER IF EXISTS trg_assign_membership_number ON public.annual_memberships;
DROP FUNCTION IF EXISTS public.set_membership_number_if_missing() CASCADE;

-- 3. Drop legacy promo code counter trigger (now handled explicitly in TypeScript)
DROP TRIGGER IF EXISTS trg_bookings_sync_promo ON public.bookings;
DROP FUNCTION IF EXISTS public.trg_bookings_sync_promo_used_count() CASCADE;

-- 4. Drop legacy auth user linking trigger and RPCs (now handled in portal.service.ts / linkUserAccountWorkflow)
DROP TRIGGER IF EXISTS on_auth_user_link ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_auth_link() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_account(uuid, text, jsonb) CASCADE;

-- 5. Drop SQL-level log cleanup function (handled via TS cron/service)
DROP FUNCTION IF EXISTS public.cleanup_old_notification_logs(integer) CASCADE;
