-- Drop legacy sync trigger for promo_codes used_count (usage is now derived dynamically from bookings table)
DROP TRIGGER IF EXISTS trigger_sync_promo_codes_used_count ON public.bookings;
DROP FUNCTION IF EXISTS public.sync_promo_codes_used_count();
