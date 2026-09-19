-- Drop legacy sync trigger and used_count column for promo_codes (usage is derived dynamically from bookings table)
DROP TRIGGER IF EXISTS trigger_sync_promo_codes_used_count ON public.bookings;
DROP FUNCTION IF EXISTS public.sync_promo_codes_used_count();
ALTER TABLE public.promo_codes DROP COLUMN IF EXISTS used_count;
