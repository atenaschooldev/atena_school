-- ============================================================================
-- Migration: Standardize form_templates (SmallInt form_type) and bookings
-- ============================================================================

-- 1. Create form_templates table if not exists
CREATE TABLE IF NOT EXISTS public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type SMALLINT NOT NULL DEFAULT 1,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  category_slug VARCHAR(64),
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  fields_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Convert form_type to SMALLINT if it was created as VARCHAR
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'form_templates' 
      AND column_name = 'form_type' 
      AND data_type LIKE '%char%'
  ) THEN
    -- Drop default first
    ALTER TABLE public.form_templates ALTER COLUMN form_type DROP DEFAULT;

    UPDATE public.form_templates
    SET form_type = CASE 
      WHEN form_type = 'booking' THEN '1'
      WHEN form_type = 'contact' THEN '2'
      WHEN form_type = 'test' THEN '3'
      WHEN form_type = 'custom' THEN '4'
      ELSE '1'
    END;

    ALTER TABLE public.form_templates 
      ALTER COLUMN form_type TYPE SMALLINT USING form_type::smallint,
      ALTER COLUMN form_type SET DEFAULT 1;
  END IF;
END $$;

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_form_templates_type_active ON public.form_templates(form_type, is_active);
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON public.form_templates(category_slug) WHERE category_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_form_templates_course ON public.form_templates(course_id) WHERE course_id IS NOT NULL;

-- 4. Enable RLS and Policies
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active form templates" ON public.form_templates;
CREATE POLICY "Public can view active form templates"
  ON public.form_templates
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users have full access to form templates" ON public.form_templates;
CREATE POLICY "Authenticated users have full access to form templates"
  ON public.form_templates
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 5. Add custom_fields and form_id to bookings if not exists
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS form_id UUID REFERENCES public.form_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_custom_fields ON public.bookings USING gin(custom_fields);
CREATE INDEX IF NOT EXISTS idx_bookings_form_id ON public.bookings(form_id) WHERE form_id IS NOT NULL;

-- 6. Upsert standard default booking form template
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
ON CONFLICT (id) DO UPDATE SET
  form_type = EXCLUDED.form_type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active;
