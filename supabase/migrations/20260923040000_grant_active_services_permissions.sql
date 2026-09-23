-- Migration: Grant SELECT permissions on active_services view
-- Date: 2026-09-23

-- Ensure all Supabase roles and postgres superuser can query active_services
GRANT SELECT ON public.active_services TO anon, authenticated, service_role, postgres;
ALTER VIEW public.active_services SET (security_invoker = true);
