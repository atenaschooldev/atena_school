-- ============================================================================
-- Migration: Create form_fields table and populate default system/custom fields
-- Timestamp: 20260922080000
-- Description:
--   1. Creates public.form_fields table for centralized fields catalog.
--   2. Adds unique key constraint and system protection (is_system = true).
--   3. Seeds core system fields (purchaser, student, booking, contact).
--   4. Sets up RLS policies.
-- ============================================================================

-- 1. Create form_fields table
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(64) UNIQUE NOT NULL,
    label_it VARCHAR(255) NOT NULL,
    label_en VARCHAR(255) NOT NULL,
    placeholder_it VARCHAR(255),
    placeholder_en VARCHAR(255),
    field_type VARCHAR(32) NOT NULL DEFAULT 'text',
    target VARCHAR(32) NOT NULL DEFAULT 'purchaser',
    options JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_required_default BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_form_fields_target ON public.form_fields(target);
CREATE INDEX IF NOT EXISTS idx_form_fields_key ON public.form_fields(key);
CREATE INDEX IF NOT EXISTS idx_form_fields_system ON public.form_fields(is_system);

-- 2. RLS Policies
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view form fields" ON public.form_fields;
CREATE POLICY "Public can view form fields"
    ON public.form_fields
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated users full access to form fields" ON public.form_fields;
CREATE POLICY "Authenticated users full access to form fields"
    ON public.form_fields
    FOR ALL
    USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 3. Seed System and Default Fields
INSERT INTO public.form_fields (
    key, label_it, label_en, placeholder_it, placeholder_en, field_type, target, is_system, is_required_default, sort_order, options
) VALUES
    -- System Purchaser Fields
    ('purchaser_first_name', 'Nome Acquirente', 'Purchaser First Name', 'es. Mario', 'e.g. John', 'text', 'purchaser', true, true, 10, '[]'::jsonb),
    ('purchaser_last_name', 'Cognome Acquirente', 'Purchaser Last Name', 'es. Rossi', 'e.g. Doe', 'text', 'purchaser', true, true, 20, '[]'::jsonb),
    ('purchaser_email', 'Email Acquirente', 'Purchaser Email', 'mario.rossi@email.com', 'john.doe@email.com', 'email', 'purchaser', true, true, 30, '[]'::jsonb),
    ('purchaser_phone', 'Telefono Acquirente', 'Purchaser Phone', '+39 333 1234567', '+1 555 123456', 'phone', 'purchaser', true, true, 40, '[]'::jsonb),
    ('purchaser_birth_date', 'Data di Nascita Acquirente', 'Purchaser Birth Date', 'GG/MM/AAAA', 'DD/MM/YYYY', 'date', 'purchaser', true, true, 50, '[]'::jsonb),
    ('purchaser_birth_place', 'Luogo di Nascita Acquirente', 'Purchaser Birth Place', 'es. Milano (MI)', 'e.g. Rome', 'text', 'purchaser', true, false, 55, '[]'::jsonb),
    ('purchaser_tax_code', 'Codice Fiscale Acquirente', 'Purchaser Tax Code', 'RSSMRA80A01H501U', 'Tax / Fiscal Code', 'text', 'purchaser', true, true, 60, '[]'::jsonb),
    ('purchaser_address', 'Indirizzo di Residenza', 'Residential Address', 'Via Roma 10, Milano', '123 Main St', 'text', 'purchaser', true, false, 70, '[]'::jsonb),
    ('sdi_code', 'Codice SDI / PEC', 'SDI Code / PEC', 'M5UXCR1 o pec@email.it', 'Electronic invoice code', 'text', 'purchaser', true, false, 80, '[]'::jsonb),

    -- System Student Fields
    ('student_first_name', 'Nome Studente', 'Student First Name', 'es. Luca', 'e.g. Alex', 'text', 'student', true, true, 100, '[]'::jsonb),
    ('student_last_name', 'Cognome Studente', 'Student Last Name', 'es. Rossi', 'e.g. Doe', 'text', 'student', true, true, 110, '[]'::jsonb),
    ('student_tax_code', 'Codice Fiscale Studente', 'Student Tax Code', 'RSSLCA10A01H501U', 'Student Fiscal Code', 'text', 'student', true, true, 120, '[]'::jsonb),
    ('student_birth_date', 'Data di Nascita Studente', 'Student Birth Date', 'GG/MM/AAAA', 'DD/MM/YYYY', 'date', 'student', true, true, 130, '[]'::jsonb),
    ('student_birth_place', 'Luogo di Nascita Studente', 'Student Birth Place', 'es. Roma (RM)', 'e.g. Rome', 'text', 'student', true, false, 135, '[]'::jsonb),
    ('student_email', 'Email Studente', 'Student Email', 'studente@email.com', 'student@email.com', 'email', 'student', true, false, 140, '[]'::jsonb),
    ('student_phone', 'Telefono Studente', 'Student Phone', '+39 340 000000', '+1 555 000000', 'phone', 'student', true, false, 145, '[]'::jsonb),
    ('study_level', 'Livello Linguistico di Partenza', 'Starting Language Level', 'Seleziona livello', 'Select level', 'select', 'student', true, false, 150, '[
        {"label": "Principiante assoluto (A0/A1)", "value": "A1"},
        {"label": "Elementare / Pre-intermedio (A2)", "value": "A2"},
        {"label": "Intermedio (B1)", "value": "B1"},
        {"label": "Intermedio superiore (B2)", "value": "B2"},
        {"label": "Avanzato (C1/C2)", "value": "C1"},
        {"label": "Non saprei (Vorrei fare il test)", "value": "TEST_NEEDED"}
    ]'::jsonb),

    -- System Booking & General Fields
    ('heard_from', 'Come ci hai conosciuto?', 'How did you hear about us?', 'Seleziona canale', 'Select channel', 'select', 'booking', true, false, 200, '[
        {"label": "Passaparola / Amici", "value": "word_of_mouth"},
        {"label": "Social Network (Instagram / Facebook)", "value": "social"},
        {"label": "Ricerca Google / Mappe", "value": "google"},
        {"label": "Volantini / Scuola", "value": "flyers"},
        {"label": "Altro", "value": "other"}
    ]'::jsonb),
    ('special_requests', 'Note o Richieste Particolari', 'Special Requests / Notes', 'Eventuali preferenze o informazioni utili...', 'Any preferences or details...', 'textarea', 'booking', true, false, 210, '[]'::jsonb),

    -- System Contact Form Fields
    ('contact_name', 'Nome e Cognome Contatto', 'Contact Full Name', 'es. Mario Rossi', 'e.g. John Doe', 'text', 'contact', true, true, 300, '[]'::jsonb),
    ('contact_email', 'Email di Contatto', 'Contact Email', 'mario.rossi@email.com', 'john.doe@email.com', 'email', 'contact', true, true, 310, '[]'::jsonb),
    ('contact_phone', 'Telefono di Contatto', 'Contact Phone', '+39 333 1234567', '+1 555 123456', 'phone', 'contact', true, false, 320, '[]'::jsonb),
    ('contact_subject', 'Oggetto Richiesta', 'Inquiry Subject', 'es. Informazioni corsi di gruppo', 'e.g. Course inquiries', 'text', 'contact', true, true, 330, '[]'::jsonb),
    ('contact_message', 'Messaggio', 'Message', 'Scrivi qui il tuo messaggio...', 'Type your message here...', 'textarea', 'contact', true, true, 340, '[]'::jsonb)
ON CONFLICT (key) DO UPDATE SET
    label_it = EXCLUDED.label_it,
    label_en = EXCLUDED.label_en,
    placeholder_it = EXCLUDED.placeholder_it,
    placeholder_en = EXCLUDED.placeholder_en,
    field_type = EXCLUDED.field_type,
    target = EXCLUDED.target,
    is_system = EXCLUDED.is_system,
    is_required_default = EXCLUDED.is_required_default,
    sort_order = EXCLUDED.sort_order,
    options = CASE WHEN EXCLUDED.options != '[]'::jsonb THEN EXCLUDED.options ELSE public.form_fields.options END,
    updated_at = now();
