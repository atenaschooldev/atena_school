-- Migration: 20260926080000_create_documents_module.sql
-- Description: Complete Document Management Module with Enums (SMALLINT), Categories, Visual Drag & Drop Templates, Snapshot Registry and Audit Logs

-- ============================================================================
-- 1. DOCUMENT CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_categories (
    id BIGSERIAL PRIMARY KEY,
    category_type SMALLINT UNIQUE NOT NULL,    -- 1=STUDENT_CONTRACTS, 2=TEACHER_CONTRACTS, 3=FINANCIAL, 4=LEGAL_AND_PRIVACY, 5=CERTIFICATES, 6=ADMINISTRATIVE
    name_it VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(64) DEFAULT 'file-text',
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Default Categories
INSERT INTO public.document_categories (category_type, name_it, name_en, name_ru, description, icon, order_index, is_active, is_system)
VALUES 
(1, 'Contratti Studenti', 'Student Contracts', 'Договоры со студентами', 'Moduli di iscrizione, regolamenti didattici e contratti formativi per allievi', 'file-text', 1, true, true),
(2, 'Contratti Docenti', 'Teacher Contracts', 'Договоры с преподавателями', 'Lettere di incarico, contratti di collaborazione e accordi con insegnanti', 'briefcase', 2, true, true),
(3, 'Ricevute e Pagamenti', 'Receipts & Payments', 'Финансовые квитанции', 'Ricevute di pagamento corsi, quote associative annuali e saldi cassa', 'receipt', 3, true, true),
(4, 'Privacy, GDPR e Deleghe', 'Privacy, GDPR & Delegations', 'GDPR и доверенности', 'Consensi privacy, liberatorie foto/video e deleghe ritiro minori (Allegato 2)', 'shield-check', 4, true, true),
(5, 'Certificati e Attestati', 'Certificates & Diplomas', 'Сертификаты и дипломы', 'Attestati di fine corso, certificazioni di livello linguistico ed esami', 'award', 5, true, true),
(6, 'Moduli Amministrativi', 'Administrative Forms', 'Административные справки', 'Certificati di frequenza per scuole pubbliche, università e pratiche amministrative', 'landmark', 6, true, true)
ON CONFLICT (category_type) DO UPDATE SET
  name_it = EXCLUDED.name_it,
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active,
  is_system = EXCLUDED.is_system;

-- ============================================================================
-- 2. DOCUMENT TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.document_templates (
    id BIGSERIAL PRIMARY KEY,
    template_type SMALLINT UNIQUE NOT NULL,    -- 1=MODULO_ISCRIZIONE, 2=CONTRATTO_DOCENTE, 3=RICEVUTA, 4=ALLEGATO_DELEGA, 5=PRIVACY_GDPR, 6=ATTESTATO, 7=CERTIFICATO
    category_type SMALLINT NOT NULL REFERENCES public.document_categories(category_type) ON UPDATE CASCADE,
    document_type SMALLINT NOT NULL,          -- Enum DocumentType (1..8)
    recipient_type SMALLINT NOT NULL,         -- Enum DocumentRecipientType (1..5)
    paper_format SMALLINT NOT NULL DEFAULT 1, -- Enum DocumentPaperFormat (1=A4 Portrait, 2=A4 Landscape, 3=Receipt Compact)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    blocks_config JSONB NOT NULL DEFAULT '{"blocks": []}'::jsonb,
    available_variables JSONB DEFAULT '[]'::jsonb,
    header_html TEXT,
    footer_html TEXT,
    css_styles TEXT,
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed System Templates
INSERT INTO public.document_templates (
  template_type,
  category_type,
  document_type,
  recipient_type,
  paper_format,
  name,
  description,
  blocks_config,
  available_variables,
  is_system,
  is_active
) VALUES 
(
  1,
  1,
  1,
  1,
  1,
  'Modulo di Iscrizione e Regolamento 2026/2027',
  'Modulo ufficiale di adesione ai corsi con accettazione del regolamento interno e calendario festività',
  '{
    "version": 1,
    "paper_format": 1,
    "theme": { "primary_color": "#0F172A", "header_style": "classic" },
    "blocks": [
      { "id": "b_header", "type": "doc_header", "title": "Intestazione Scuola", "is_enabled": true, "order": 1, "props": { "show_logo": true, "title": "MODULO DI ISCRIZIONE E REGOLAMENTO A.S. 2026/2027" } },
      { "id": "b_parties", "type": "parties_block", "title": "Dati Anagrafici Allievo e Genitore", "is_enabled": true, "order": 2, "props": { "show_student_details": true, "show_parent_details": true, "show_school_grade": true } },
      { "id": "b_course", "type": "course_table", "title": "Dettagli del Corso Scelto", "is_enabled": true, "order": 3, "props": { "show_schedule": true, "show_classroom": true } },
      { "id": "b_payment", "type": "payment_breakdown", "title": "Riepilogo Quote e Pagamento", "is_enabled": true, "order": 4, "props": { "show_vat_breakdown": true, "show_registration_fee": true } },
      { "id": "b_clauses", "type": "contract_clauses", "title": "Regolamento Didattico e Festività", "is_enabled": true, "order": 5, "props": { "show_holidays": true, "show_recovery_rules": true } },
      { "id": "b_gdpr", "type": "gdpr_privacy", "title": "Consenso Privacy e Trattamento Dati", "is_enabled": true, "order": 6, "props": { "show_media_consent": true } },
      { "id": "b_signatures", "type": "signatures", "title": "Firme di Sottoscrizione", "is_enabled": true, "order": 7, "props": { "signature_parties": ["scuola", "genitore_allievo"] } },
      { "id": "b_footer", "type": "doc_footer", "title": "Piè di Pagina", "is_enabled": true, "order": 8, "props": { "show_page_number": true, "show_tax_info": true } }
    ]
  }'::jsonb,
  '[
    {"key": "school.legal_name", "label": "Nome Scuola", "category": "school", "sample_value": "Atena School S.r.l."},
    {"key": "student.full_name", "label": "Nome Completo Allievo", "category": "student", "sample_value": "Mario Rossi"},
    {"key": "student.tax_code", "label": "Codice Fiscale Allievo", "category": "student", "sample_value": "RSSMRA08D12H501Z"},
    {"key": "student.school_grade", "label": "Scuola e Classe Frequentata", "category": "student", "sample_value": "Liceo Scientifico 3B"},
    {"key": "course.title", "label": "Titolo del Corso", "category": "course", "sample_value": "Inglese B1 Intermedio"},
    {"key": "course.schedule_text", "label": "Orario Lezioni", "category": "course", "sample_value": "Martedì e Giovedì 16:30 - 18:00"},
    {"key": "payment.amount_total", "label": "Totale Pagato (IVA Inclusa)", "category": "payment", "sample_value": "€160.00"}
  ]'::jsonb,
  true,
  true
),
(
  2,
  2,
  2,
  3,
  1,
  'Contratto Collaborazione Docente (Tariffa Oraria)',
  'Accordo di prestazione d''opera per insegnamento linguistico con clausole di riservatezza e compenso',
  '{
    "version": 1,
    "paper_format": 1,
    "blocks": [
      { "id": "b_header", "type": "doc_header", "title": "Intestazione Contratto", "is_enabled": true, "order": 1, "props": { "title": "LETTERA DI INCARICO E CONTRATTO DI COLLABORAZIONE DOCENTE" } },
      { "id": "b_parties", "type": "parties_block", "title": "Dati Docente e Scuola", "is_enabled": true, "order": 2, "props": { "show_teacher_details": true } },
      { "id": "b_clauses", "type": "contract_clauses", "title": "Oggetto dell''Incarico e Obblighi", "is_enabled": true, "order": 3, "props": { "teacher_contract": true } },
      { "id": "b_signatures", "type": "signatures", "title": "Firme", "is_enabled": true, "order": 4, "props": { "signature_parties": ["direzione", "docente"] } }
    ]
  }'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  3,
  3,
  3,
  1,
  1,
  'Ricevuta di Pagamento Ufficiale (IVA Inclusa)',
  'Ricevuta contabile con codice fiscale, scorporo IVA 22% e quota associativa annuale',
  '{
    "version": 1,
    "paper_format": 1,
    "blocks": [
      { "id": "b_header", "type": "doc_header", "title": "Intestazione Ricevuta", "is_enabled": true, "order": 1, "props": { "title": "RICEVUTA DI PAGAMENTO" } },
      { "id": "b_parties", "type": "parties_block", "title": "Dati Intestatario", "is_enabled": true, "order": 2, "props": { "show_payer_details": true } },
      { "id": "b_payment", "type": "payment_breakdown", "title": "Dettaglio Voci e IVA", "is_enabled": true, "order": 3, "props": { "show_vat_breakdown": true, "show_payment_method": true } },
      { "id": "b_signatures", "type": "signatures", "title": "Firma e Timbro", "is_enabled": true, "order": 4, "props": { "signature_parties": ["amministrazione"] } }
    ]
  }'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  4,
  4,
  4,
  2,
  1,
  'Allegato 2: Delega Ritiro Minori e Uscita Autonoma',
  'Modulo di autorizzazione ritiro allievi minori da parte di persone terze o uscita autonoma (L. 172/2017)',
  '{
    "version": 1,
    "paper_format": 1,
    "blocks": [
      { "id": "b_header", "type": "doc_header", "title": "Intestazione Allegato 2", "is_enabled": true, "order": 1, "props": { "title": "ALLEGATO 2: DELEGA RITIRO E AUTORIZZAZIONE USCITA AUTONOMA" } },
      { "id": "b_parties", "type": "parties_block", "title": "Dati Genitore e Allievo", "is_enabled": true, "order": 2, "props": {} },
      { "id": "b_delegates", "type": "minor_delegation", "title": "Delegati Ritiro Minore", "is_enabled": true, "order": 3, "props": { "show_delegates_1_2": true, "show_self_exit": true } },
      { "id": "b_signatures", "type": "signatures", "title": "Firma del Genitore", "is_enabled": true, "order": 4, "props": { "signature_parties": ["genitore"] } }
    ]
  }'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  5,
  4,
  5,
  1,
  1,
  'Informativa Privacy e Trattamento Dati Personali (GDPR)',
  'Trattamento dati ai sensi del Regolamento UE 2016/679 e consenso multimediale',
  '{
    "version": 1,
    "paper_format": 1,
    "blocks": [
      { "id": "b_header", "type": "doc_header", "title": "Intestazione GDPR", "is_enabled": true, "order": 1, "props": { "title": "INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI (ART. 13-14 REG. UE 2016/679)" } },
      { "id": "b_gdpr", "type": "gdpr_privacy", "title": "Finalità del Trattamento e Consensi", "is_enabled": true, "order": 2, "props": {} },
      { "id": "b_signatures", "type": "signatures", "title": "Firma per Consenso", "is_enabled": true, "order": 3, "props": { "signature_parties": ["interessato_genitore"] } }
    ]
  }'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  6,
  6,
  7,
  1,
  1,
  'Attestato di Frequenza e Ore Didattiche',
  'Dichiarazione ufficiale di frequenza con percentuale presenze e ore totali',
  '{
    "version": 1,
    "paper_format": 1,
    "blocks": [
      { "id": "b_header", "type": "doc_header", "title": "Intestazione Certificato", "is_enabled": true, "order": 1, "props": { "title": "CERTIFICATO DI FREQUENZA" } },
      { "id": "b_custom", "type": "custom_text", "title": "Testo Dichiarazione", "is_enabled": true, "order": 2, "props": { "text": "Si attesta che l''allievo/a {{student.full_name}} ha frequentato con profitto il corso di {{course.title}} per un monte ore totale di {{course.total_hours}} ore." } },
      { "id": "b_signatures", "type": "signatures", "title": "Firma della Direzione", "is_enabled": true, "order": 3, "props": { "signature_parties": ["direzione_didattica"] } }
    ]
  }'::jsonb,
  '[]'::jsonb,
  true,
  true
),
(
  7,
  5,
  6,
  1,
  2,
  'Certificato di Competenza Linguistica QCER',
  'Diploma di certificazione del livello linguistico raggiunto con giudizio del docente (Formato Orizzontale)',
  '{
    "version": 1,
    "paper_format": 2,
    "blocks": [
      { "id": "b_header", "type": "doc_header", "title": "Diploma Header", "is_enabled": true, "order": 1, "props": { "title": "CERTIFICATO DI LIVELLO LINGUISTICO QCER" } },
      { "id": "b_custom", "type": "custom_text", "title": "Testo Conferimento", "is_enabled": true, "order": 2, "props": { "text": "Si conferisce a {{student.full_name}} il presente attestato per aver conseguito con successo il livello {{course.level}} in lingua {{course.language}}." } },
      { "id": "b_signatures", "type": "signatures", "title": "Firme", "is_enabled": true, "order": 3, "props": { "signature_parties": ["esaminatore", "direttore"] } }
    ]
  }'::jsonb,
  '[]'::jsonb,
  true,
  true
)
ON CONFLICT (template_type) DO UPDATE SET
  category_type = EXCLUDED.category_type,
  document_type = EXCLUDED.document_type,
  recipient_type = EXCLUDED.recipient_type,
  paper_format = EXCLUDED.paper_format,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  blocks_config = EXCLUDED.blocks_config,
  available_variables = EXCLUDED.available_variables,
  is_system = EXCLUDED.is_system,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- 3. RECREATE / ENHANCE DOCUMENTS TABLE
-- ============================================================================
DROP TABLE IF EXISTS public.document_logs CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_number VARCHAR(64) NOT NULL,
    document_type SMALLINT NOT NULL,           -- Enum DocumentType
    category_type SMALLINT NOT NULL,           -- Enum DocumentCategoryType
    status SMALLINT NOT NULL DEFAULT 2,        -- Enum DocumentStatus (2=Generated)
    source SMALLINT NOT NULL DEFAULT 2,        -- Enum DocumentGenerationSource (1=Auto, 2=Manual)
    paper_format SMALLINT NOT NULL DEFAULT 1,  -- Enum DocumentPaperFormat (1=A4 Portrait)
    
    template_id BIGINT REFERENCES public.document_templates(id) ON DELETE SET NULL,
    template_type SMALLINT,                    -- Enum DocumentTemplateType
    
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    teacher_id BIGINT REFERENCES public.teachers(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    title VARCHAR(255) NOT NULL,
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_tax_code TEXT,
    
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Неизменяемый Snapshot данных
    rendered_html TEXT NOT NULL,                     -- Готовый HTML для мгновенной печати
    file_url TEXT,                                   -- Ссылка на PDF в Storage
    
    signed_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_category_type ON public.documents(category_type);
CREATE INDEX idx_documents_document_type ON public.documents(document_type);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_booking_id ON public.documents(booking_id);
CREATE INDEX idx_documents_student_id ON public.documents(student_id);
CREATE INDEX idx_documents_teacher_id ON public.documents(teacher_id);
CREATE INDEX idx_documents_recipient_email ON public.documents(recipient_email);
CREATE INDEX idx_documents_document_number ON public.documents(document_number);

-- ============================================================================
-- 4. DOCUMENT LOGS (AUDIT TRAIL)
-- ============================================================================
CREATE TABLE public.document_logs (
    id BIGSERIAL PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    action SMALLINT NOT NULL,                  -- Enum DocumentLogAction (1=Generated, 2=Viewed, 3=Printed, etc.)
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_logs_doc_id ON public.document_logs(document_id);
CREATE INDEX idx_document_logs_action ON public.document_logs(action);

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_logs ENABLE ROW LEVEL SECURITY;

-- Service Role Full Access
DROP POLICY IF EXISTS "Service role full access on document_categories" ON public.document_categories;
CREATE POLICY "Service role full access on document_categories" ON public.document_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on document_templates" ON public.document_templates;
CREATE POLICY "Service role full access on document_templates" ON public.document_templates FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on documents" ON public.documents;
CREATE POLICY "Service role full access on documents" ON public.documents FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on document_logs" ON public.document_logs;
CREATE POLICY "Service role full access on document_logs" ON public.document_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated Staff Full Access (Roles 1, 2, 3, 5, 6)
DROP POLICY IF EXISTS "Staff full access on document_categories" ON public.document_categories;
CREATE POLICY "Staff full access on document_categories" ON public.document_categories FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)));

DROP POLICY IF EXISTS "Staff full access on document_templates" ON public.document_templates;
CREATE POLICY "Staff full access on document_templates" ON public.document_templates FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)));

DROP POLICY IF EXISTS "Staff full access on documents" ON public.documents;
CREATE POLICY "Staff full access on documents" ON public.documents FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)));

DROP POLICY IF EXISTS "Staff full access on document_logs" ON public.document_logs;
CREATE POLICY "Staff full access on document_logs" ON public.document_logs FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN (1, 2, 3, 5, 6)));

-- Public / Authenticated Read-Only for Active Categories & Templates
DROP POLICY IF EXISTS "Public read active categories" ON public.document_categories;
CREATE POLICY "Public read active categories" ON public.document_categories FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "Public read active templates" ON public.document_templates;
CREATE POLICY "Public read active templates" ON public.document_templates FOR SELECT TO public USING (is_active = true);

-- Students / Customers Read Own Documents
DROP POLICY IF EXISTS "Customers read own documents" ON public.documents;
CREATE POLICY "Customers read own documents" ON public.documents FOR SELECT TO authenticated
USING (
  recipient_email = (auth.jwt() ->> 'email')
  OR user_id = auth.uid()
);

-- ============================================================================
-- 6. PERMISSIONS & GRANTS
-- ============================================================================
GRANT ALL ON TABLE public.document_categories TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.document_templates TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.documents TO postgres, service_role, authenticated, anon;
GRANT ALL ON TABLE public.document_logs TO postgres, service_role, authenticated, anon;

GRANT ALL ON SEQUENCE public.document_categories_id_seq TO postgres, service_role, authenticated, anon;
GRANT ALL ON SEQUENCE public.document_templates_id_seq TO postgres, service_role, authenticated, anon;
GRANT ALL ON SEQUENCE public.document_logs_id_seq TO postgres, service_role, authenticated, anon;

