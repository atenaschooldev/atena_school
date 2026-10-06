-- ==============================================================================
-- Migration: 20261006190000_extend_marketing_popups_flexibility.sql
-- Description: Adds ultra-flexible CTA actions, social links, multi-triggers,
-- positioning, device/language targeting, and promo code copy capabilities.
-- ==============================================================================

ALTER TABLE public.marketing_popups
    ADD COLUMN IF NOT EXISTS position VARCHAR(32) NOT NULL DEFAULT 'center',
    ADD COLUMN IF NOT EXISTS cta_action_type VARCHAR(32) NOT NULL DEFAULT 'link',
    ADD COLUMN IF NOT EXISTS cta_target VARCHAR(16) NOT NULL DEFAULT '_blank',
    ADD COLUMN IF NOT EXISTS promo_code_to_copy VARCHAR(100),
    ADD COLUMN IF NOT EXISTS secondary_cta_action_type VARCHAR(32) NOT NULL DEFAULT 'dismiss',
    ADD COLUMN IF NOT EXISTS secondary_cta_url TEXT,
    ADD COLUMN IF NOT EXISTS secondary_cta_target VARCHAR(16) NOT NULL DEFAULT '_blank',
    ADD COLUMN IF NOT EXISTS target_devices VARCHAR(32) NOT NULL DEFAULT 'all',
    ADD COLUMN IF NOT EXISTS target_languages TEXT[] NOT NULL DEFAULT ARRAY['*']::TEXT[],
    ADD COLUMN IF NOT EXISTS trigger_inactivity_seconds INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS multi_trigger BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS custom_theme_color VARCHAR(32);
