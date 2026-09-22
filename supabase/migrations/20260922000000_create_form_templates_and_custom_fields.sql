-- ============================================================================
-- Migration: Create form_templates and add custom_fields to bookings
-- ============================================================================

-- 1. Create form_templates table
CREATE TABLE IF NOT EXISTS public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(32) NOT NULL DEFAULT 'booking',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  category_slug VARCHAR(64),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  fields_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by type, category, course
CREATE INDEX IF NOT EXISTS idx_form_templates_type_active ON public.form_templates(form_type, is_active);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON public.form_templates(category_slug) WHERE category_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_templates_course ON public.form_templates(course_id) WHERE course_id IS NOT NULL;

-- 2. Enable RLS
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active templates
DROP POLICY IF EXISTS "Public can view active form templates" ON public.form_templates;
CREATE POLICY "Public can view active form templates"
  ON public.form_templates
  FOR SELECT
  USING (is_active = true);

-- Allow service_role and authenticated users full access
DROP POLICY IF EXISTS "Authenticated users have full access to form templates" ON public.form_templates;
CREATE POLICY "Authenticated users have full access to form templates"
  ON public.form_templates
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. Add custom_fields and form_id to bookings if not exists
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.form_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_custom_fields ON public.bookings USING gin(custom_fields);

-- 4. Seed initial default templates if empty
INSERT INTO public.form_templates (
  id,
  title,
  description,
  form_type,
  is_default,
  is_active,
  fields_config
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Modulo Iscrizione Standard',
  'Modulo predefinito per la prenotazione e acquisto dei corsi',
  1,
  TRUE,
  TRUE,
  '[
    {
      "id": "field-study-level",
      "key": "study_level",
      "label": "Livello di partenza stimato",
      "placeholder": "Seleziona il tuo livello o conoscenza",
      "field_type": "select",
      "target": "student",
      "is_required": false,
      "is_enabled": true,
      "sort_order": 1,
      "options": [
        {"label": "Principiante assoluto (A0/A1)", "value": "A1"},
        {"label": "Elementare / Intermedio (A2/B1)", "value": "B1"},
        {"label": "Intermedio superiore / Avanzato (B2/C1)", "value": "B2"},
        {"label": "Non saprei (Vorrei fare il test)", "value": "TEST_NEEDED"}
      ]
    },
    {
      "id": "field-heard-from",
      "key": "heard_from",
      "label": "Come hai conosciuto Atena School?",
      "placeholder": "Seleziona come ci hai trovati",
      "field_type": "select",
      "target": "purchaser",
      "is_required": false,
      "is_enabled": true,
      "sort_order": 2,
      "options": [
        {"label": "Passaparola / Amici", "value": "word_of_mouth"},
        {"label": "Social Network (Instagram / Facebook)", "value": "social"},
        {"label": "Ricerca Google / Mappe", "value": "google"},
        {"label": "Volantini / Cartellonistica a scuola", "value": "flyers"},
        {"label": "Altro", "value": "other"}
      ]
    },
    {
      "id": "field-additional-notes",
      "key": "additional_requests",
      "label": "Note o richieste speciali",
      "placeholder": "Es. orari preferiti, allergie, compagni di classe...",
      "field_type": "textarea",
      "target": "booking",
      "is_required": false,
      "is_enabled": true,
      "sort_order": 3
    }
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
