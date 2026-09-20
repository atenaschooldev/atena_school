-- ============================================================================
-- ATENA SCHOOL — NOTIFICATION TEMPLATES MIGRATION & SEEDING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel SMALLINT NOT NULL DEFAULT 1, -- 1: EMAIL, 2: TELEGRAM
    notification_type SMALLINT NOT NULL DEFAULT 1, -- 1: BOOKING_CONFIRMATION, 2: PAYMENT_RECEIPT, 3: PAYMENT_REMINDER, 4: MEMBERSHIP_CARD, 5: CONTACT_FORM
    recipient_type SMALLINT NOT NULL DEFAULT 1, -- 1: CUSTOMER, 2: ADMIN
    subject VARCHAR(255),
    body_html TEXT,
    body_text TEXT NOT NULL DEFAULT '',
    available_variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    blocks_config JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Indices for rapid lookup
CREATE INDEX IF NOT EXISTS idx_notification_templates_code ON public.notification_templates(code);
CREATE INDEX IF NOT EXISTS idx_notification_templates_channel ON public.notification_templates(channel);
CREATE INDEX IF NOT EXISTS idx_notification_templates_recipient_type ON public.notification_templates(recipient_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON public.notification_templates(is_active);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- 1. Service role has full access
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on notification_templates' AND tablename = 'notification_templates') THEN
        CREATE POLICY "Allow service_role full access on notification_templates" ON public.notification_templates
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 2. Authenticated users can read templates
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read notification_templates' AND tablename = 'notification_templates') THEN
        CREATE POLICY "Allow authenticated read notification_templates" ON public.notification_templates
        FOR SELECT TO authenticated
        USING (true);
    END IF;
END $$;

-- 3. Admins / Secretaries can modify templates (role IN 3, 5, 6)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin manage notification_templates' AND tablename = 'notification_templates') THEN
        CREATE POLICY "Allow admin manage notification_templates" ON public.notification_templates
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (3, 5, 6)))
        WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (3, 5, 6)));
    END IF;
END $$;

-- 4. Grant table permissions
GRANT ALL ON TABLE public.notification_templates TO postgres, service_role, authenticated;

-- ============================================================================
-- SEED INITIAL SYSTEM TEMPLATES (IDEMPOTENT UPSERT)
-- ============================================================================

INSERT INTO public.notification_templates (
    code,
    name,
    description,
    channel,
    notification_type,
    recipient_type,
    subject,
    body_text,
    available_variables,
    is_active
) VALUES 
(
    'booking_confirmation_customer',
    'Conferma Prenotazione (Paga in Sede)',
    'Inviata automaticamente al cliente quando prenota un corso con saldo in sede',
    1, -- EMAIL
    1, -- BOOKING_CONFIRMATION
    1, -- CUSTOMER
    'Conferma Iscrizione: {{course_name}} • Atena School',
    'Gentile Allievo, la tua prenotazione per il corso {{course_name}} è stata registrata con successo.',
    '["student_name","purchaser_name","purchaser_email","purchaser_phone","purchaser_tax_code","course_name","course_price","registration_fee","amount_paid","total_amount","start_date","date","schedule_text","lesson_schedule","student_birth_date","student_birth_place","birth_place","student_tax_code","student_email","payment_method","payment_method_label","payment_status","payment_status_label","booking_id","promo_code","discount_amount","notes","dashboard_url","app_url","admin_url"]'::jsonb,
    true
),
(
    'payment_receipt_customer',
    'Ricevuta di Pagamento Online (Stripe)',
    'Inviata al cliente subito dopo il pagamento online con carta o abbonamento',
    1, -- EMAIL
    2, -- PAYMENT_RECEIPT
    1, -- CUSTOMER
    'Ricevuta di Pagamento: {{course_name}} • Atena School',
    'Gentile Allievo, il tuo pagamento di €{{total_amount}} per il corso {{course_name}} è andato a buon fine.',
    '["student_name","purchaser_name","purchaser_email","purchaser_phone","purchaser_tax_code","course_name","course_price","registration_fee","amount_paid","total_amount","start_date","date","schedule_text","lesson_schedule","student_birth_date","student_birth_place","birth_place","student_tax_code","student_email","payment_method","payment_method_label","payment_status","payment_status_label","booking_id","promo_code","discount_amount","notes","dashboard_url","app_url","admin_url"]'::jsonb,
    true
),
(
    'booking_alert_admin',
    'Notifica Nuova Prenotazione (Amministrazione)',
    'Inviata all''email della segreteria per ogni nuova iscrizione registrata',
    1, -- EMAIL
    1, -- BOOKING_CONFIRMATION
    2, -- ADMIN
    '🔔 Nuova Iscrizione: {{student_name}} — {{course_name}}',
    'Nuova iscrizione registrata per il corso {{course_name}}. Allievo: {{student_name}}, Referente: {{purchaser_name}}.',
    '["student_name","purchaser_name","purchaser_email","purchaser_phone","purchaser_tax_code","course_name","course_price","registration_fee","amount_paid","total_amount","start_date","date","schedule_text","lesson_schedule","student_birth_date","student_birth_place","birth_place","student_tax_code","student_email","payment_method","payment_method_label","payment_status","payment_status_label","booking_id","promo_code","discount_amount","notes","dashboard_url","app_url","admin_url"]'::jsonb,
    true
),
(
    'contact_lead_admin',
    'Nuovo Messaggio dal Sito (Contatti)',
    'Inviata alla segreteria quando un utente invia una richiesta dal modulo contatti',
    1, -- EMAIL
    5, -- CONTACT_FORM
    2, -- ADMIN
    '📩 Nuovo Messaggio dal Sito: {{sender_name}}',
    'Un utente ha inviato una richiesta di informazioni tramite il sito. Mittente: {{sender_name}} ({{sender_email}}).',
    '["sender_name","sender_email","sender_phone","interest","topic","message","message_body","admin_url"]'::jsonb,
    true
),
(
    'telegram_booking_alert',
    'Telegram: Alert Nuova Prenotazione',
    'Messaggio inviato al canale/bot Telegram della segreteria per nuove prenotazioni',
    2, -- TELEGRAM
    1, -- BOOKING_CONFIRMATION
    2, -- ADMIN
    NULL,
    '🎓 *NUOVA PRENOTAZIONE CORSO*',
    '["student_name","purchaser_name","phone","email","course_name","course_price","registration_fee","amount_paid","total_amount","start_date","date","schedule_text","lesson_schedule","payment_status","payment_status_label","booking_id","notes"]'::jsonb,
    true
),
(
    'telegram_lead_alert',
    'Telegram: Alert Richiesta Contatto',
    'Messaggio inviato su Telegram quando arriva un nuovo messaggio dal modulo contatti',
    2, -- TELEGRAM
    5, -- CONTACT_FORM
    2, -- ADMIN
    NULL,
    '📩 *NUOVO MESSAGGIO DAL SITO*',
    '["sender_name","sender_email","sender_phone","interest","topic","message","message_body"]'::jsonb,
    true
),
(
    'telegram_payment_alert',
    'Telegram: Alert Incasso Pagamento',
    'Messaggio inviato su Telegram alla conferma di un pagamento Stripe',
    2, -- TELEGRAM
    2, -- PAYMENT_RECEIPT
    2, -- ADMIN
    NULL,
    '💳 *PAGAMENTO INCASSATO (STRIPE)*',
    '["student_name","purchaser_name","phone","email","course_name","course_price","registration_fee","amount_paid","total_amount","start_date","date","schedule_text","lesson_schedule","payment_status","payment_status_label","booking_id","notes"]'::jsonb,
    true
)
ON CONFLICT (code) DO NOTHING;
