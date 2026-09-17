-- Migration: Enable security_invoker on active_services view
-- Description: Ensures the active_services view enforces Row Level Security (RLS) of underlying tables and removes the UNRESTRICTED badge in Supabase Studio.

ALTER VIEW IF EXISTS public.active_services SET (security_invoker = true);
