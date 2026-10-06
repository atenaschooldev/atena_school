-- Add image_fit column to marketing_popups
ALTER TABLE public.marketing_popups
ADD COLUMN IF NOT EXISTS image_fit text DEFAULT 'ambient' CHECK (image_fit IN ('ambient', 'cover', 'contain', 'padded'));

COMMENT ON COLUMN public.marketing_popups.image_fit IS 'Rendering style for images in hybrid mode: ambient (blur glow, no crop), cover (full-bleed banner), contain (solid bg uncropped), padded (in-card rounded image)';
