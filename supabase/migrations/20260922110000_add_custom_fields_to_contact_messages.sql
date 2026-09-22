-- Migration: Add custom_fields and form_id to contact_messages
-- Enables storing dynamic custom form answers from landing contact forms.

ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.form_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contact_messages_custom_fields ON public.contact_messages USING gin (custom_fields);
