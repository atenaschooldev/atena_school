-- ==============================================================================
-- Migration: 20261006180000_create_marketing_popups.sql
-- Description: Creates marketing_popups table and marketing-assets storage bucket
-- Supports image-only, text-only, and combined promo popups with scheduling and triggers
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.marketing_popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    content_type VARCHAR(32) NOT NULL DEFAULT 'combined', -- 'image_only' | 'text_only' | 'combined'
    
    -- Visual & Text content
    image_url TEXT,
    badge_text VARCHAR(100),
    display_title VARCHAR(255),
    display_text TEXT,
    cta_text VARCHAR(100),
    cta_url TEXT,
    secondary_cta_text VARCHAR(100),
    
    -- Trigger rules
    trigger_type VARCHAR(32) NOT NULL DEFAULT 'delay', -- 'delay' | 'scroll' | 'exit_intent' | 'immediate'
    trigger_delay_seconds INT NOT NULL DEFAULT 5,
    trigger_scroll_percentage INT NOT NULL DEFAULT 40,
    
    -- Display limits & targeting
    frequency VARCHAR(32) NOT NULL DEFAULT 'once_per_day', -- 'once_per_session' | 'once_per_day' | 'once_forever' | 'always'
    target_routes TEXT[] NOT NULL DEFAULT ARRAY['*']::TEXT[],
    
    -- Scheduling & Priority
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    priority INT NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_marketing_popups_active ON public.marketing_popups (is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_popups_schedule ON public.marketing_popups (start_date, end_date);

-- Enable RLS
ALTER TABLE public.marketing_popups ENABLE ROW LEVEL SECURITY;

-- Public can read active popups within date range
DROP POLICY IF EXISTS "Public can view active marketing popups" ON public.marketing_popups;
CREATE POLICY "Public can view active marketing popups"
    ON public.marketing_popups
    FOR SELECT
    TO anon, authenticated
    USING (
        is_active = true
        AND (start_date IS NULL OR start_date <= now())
        AND (end_date IS NULL OR end_date >= now())
    );

-- Authenticated admins / service role have full access
DROP POLICY IF EXISTS "Service role and admins full access on marketing_popups" ON public.marketing_popups;
CREATE POLICY "Service role and admins full access on marketing_popups"
    ON public.marketing_popups
    FOR ALL
    TO authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Ensure public storage bucket 'marketing-assets' exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'marketing-assets',
    'marketing-assets',
    true,
    10485760, -- 10MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/avif'];

-- Storage bucket RLS policies
DROP POLICY IF EXISTS "Public can read marketing assets" ON storage.objects;
CREATE POLICY "Public can read marketing assets"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'marketing-assets');

DROP POLICY IF EXISTS "Authenticated can upload marketing assets" ON storage.objects;
CREATE POLICY "Authenticated can upload marketing assets"
    ON storage.objects FOR INSERT
    TO authenticated, service_role
    WITH CHECK (bucket_id = 'marketing-assets');

DROP POLICY IF EXISTS "Authenticated can manage marketing assets" ON storage.objects;
CREATE POLICY "Authenticated can manage marketing assets"
    ON storage.objects FOR ALL
    TO authenticated, service_role
    USING (bucket_id = 'marketing-assets');
