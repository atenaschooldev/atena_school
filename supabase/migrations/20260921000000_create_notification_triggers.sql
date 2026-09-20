-- ============================================================================
-- ATENA SCHOOL — NOTIFICATION TRIGGERS & AUTOMATION RULES MIGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notification_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_key VARCHAR(100) NOT NULL,
    template_id UUID NOT NULL REFERENCES public.notification_templates(id) ON DELETE CASCADE,
    channel SMALLINT NOT NULL DEFAULT 1, -- 1: EMAIL, 2: TELEGRAM
    recipient_type SMALLINT NOT NULL DEFAULT 1, -- 1: CUSTOMER, 2: ADMIN, 3: STUDENT, 4: CUSTOM
    custom_recipient VARCHAR(255),
    conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    timing_type VARCHAR(50) NOT NULL DEFAULT 'immediate',
    delay_seconds INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_notification_triggers_event_key ON public.notification_triggers(event_key);
CREATE INDEX IF NOT EXISTS idx_notification_triggers_is_active ON public.notification_triggers(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_triggers_template_id ON public.notification_triggers(template_id);

-- Enable RLS
ALTER TABLE public.notification_triggers ENABLE ROW LEVEL SECURITY;

-- 1. Service role has full access
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow service_role full access on notification_triggers' AND tablename = 'notification_triggers') THEN
        CREATE POLICY "Allow service_role full access on notification_triggers" ON public.notification_triggers
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 2. Authenticated users can read triggers
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read notification_triggers' AND tablename = 'notification_triggers') THEN
        CREATE POLICY "Allow authenticated read notification_triggers" ON public.notification_triggers
        FOR SELECT TO authenticated
        USING (true);
    END IF;
END $$;

-- 3. Admins / Secretaries can manage triggers (role IN 3, 5, 6)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin manage notification_triggers' AND tablename = 'notification_triggers') THEN
        CREATE POLICY "Allow admin manage notification_triggers" ON public.notification_triggers
        FOR ALL TO authenticated
        USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (3, 5, 6)))
        WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role IN (3, 5, 6)));
    END IF;
END $$;

-- 4. Permissions
GRANT ALL ON TABLE public.notification_triggers TO postgres, service_role, authenticated;

-- ============================================================================
-- SEED DEFAULT AUTOMATION TRIGGERS LINKED TO TEMPLATES
-- ============================================================================

DO $$
DECLARE
    tmpl_receipt_customer UUID;
    tmpl_confirm_customer UUID;
    tmpl_alert_admin UUID;
    tmpl_lead_admin UUID;
    tmpl_tg_booking UUID;
    tmpl_tg_lead UUID;
    tmpl_tg_payment UUID;
BEGIN
    SELECT id INTO tmpl_receipt_customer FROM public.notification_templates WHERE code = 'payment_receipt_customer' LIMIT 1;
    SELECT id INTO tmpl_confirm_customer FROM public.notification_templates WHERE code = 'booking_confirmation_customer' LIMIT 1;
    SELECT id INTO tmpl_alert_admin FROM public.notification_templates WHERE code = 'booking_alert_admin' LIMIT 1;
    SELECT id INTO tmpl_lead_admin FROM public.notification_templates WHERE code = 'contact_lead_admin' LIMIT 1;
    SELECT id INTO tmpl_tg_booking FROM public.notification_templates WHERE code = 'telegram_booking_alert' LIMIT 1;
    SELECT id INTO tmpl_tg_lead FROM public.notification_templates WHERE code = 'telegram_lead_alert' LIMIT 1;
    SELECT id INTO tmpl_tg_payment FROM public.notification_templates WHERE code = 'telegram_payment_alert' LIMIT 1;

    -- Trigger 1: Stripe Payment -> Customer Receipt Email
    IF tmpl_receipt_customer IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.notification_triggers WHERE event_key = 'booking.created_stripe' AND template_id = tmpl_receipt_customer) THEN
        INSERT INTO public.notification_triggers (name, description, event_key, template_id, channel, recipient_type, conditions, timing_type, is_active)
        VALUES ('Ricevuta Stripe al Cliente', 'Invia la ricevuta fiscale dettagliata subito dopo la transazione online', 'booking.created_stripe', tmpl_receipt_customer, 1, 1, '{}'::jsonb, 'immediate', true);
    END IF;

    -- Trigger 2: Cash / Sede Booking -> Customer Instructions Email
    IF tmpl_confirm_customer IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.notification_triggers WHERE event_key = 'booking.pending_cash' AND template_id = tmpl_confirm_customer) THEN
        INSERT INTO public.notification_triggers (name, description, event_key, template_id, channel, recipient_type, conditions, timing_type, is_active)
        VALUES ('Conferma Prenotazione con Saldo in Sede', 'Invia le coordinate bancarie IBAN e le istruzioni di saldo in sede', 'booking.pending_cash', tmpl_confirm_customer, 1, 1, '{}'::jsonb, 'immediate', true);
    END IF;

    -- Trigger 3: Any Booking -> Admin Email Alert
    IF tmpl_alert_admin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.notification_triggers WHERE event_key = 'booking.created_stripe' AND template_id = tmpl_alert_admin) THEN
        INSERT INTO public.notification_triggers (name, description, event_key, template_id, channel, recipient_type, conditions, timing_type, is_active)
        VALUES ('Alert Email Segreteria: Nuova Iscrizione', 'Invia una notifica con riepilogo alla casella di posta della segreteria', 'booking.created_stripe', tmpl_alert_admin, 1, 2, '{}'::jsonb, 'immediate', true);
    END IF;

    -- Trigger 4: Stripe Payment -> Telegram Alert
    IF tmpl_tg_payment IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.notification_triggers WHERE event_key = 'booking.created_stripe' AND template_id = tmpl_tg_payment) THEN
        INSERT INTO public.notification_triggers (name, description, event_key, template_id, channel, recipient_type, conditions, timing_type, is_active)
        VALUES ('Telegram: Alert Pagamento Incassato', 'Notifica istantanea su Telegram bot all''incasso di una quota corso', 'booking.created_stripe', tmpl_tg_payment, 2, 2, '{}'::jsonb, 'immediate', true);
    END IF;

    -- Trigger 5: Cash Booking -> Telegram Alert
    IF tmpl_tg_booking IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.notification_triggers WHERE event_key = 'booking.pending_cash' AND template_id = tmpl_tg_booking) THEN
        INSERT INTO public.notification_triggers (name, description, event_key, template_id, channel, recipient_type, conditions, timing_type, is_active)
        VALUES ('Telegram: Alert Nuova Iscrizione in Sede', 'Notifica su Telegram per preparare la scheda allievo in segreteria', 'booking.pending_cash', tmpl_tg_booking, 2, 2, '{}'::jsonb, 'immediate', true);
    END IF;

    -- Trigger 6: Contact Message -> Admin Email
    IF tmpl_lead_admin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.notification_triggers WHERE event_key = 'contact_form.submitted' AND template_id = tmpl_lead_admin) THEN
        INSERT INTO public.notification_triggers (name, description, event_key, template_id, channel, recipient_type, conditions, timing_type, is_active)
        VALUES ('Email: Nuova Richiesta dal Modulo Contatti', 'Inoltra il messaggio e i contatti dell''utente alla segreteria', 'contact_form.submitted', tmpl_lead_admin, 1, 2, '{}'::jsonb, 'immediate', true);
    END IF;

    -- Trigger 7: Contact Message -> Telegram Alert
    IF tmpl_tg_lead IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.notification_triggers WHERE event_key = 'contact_form.submitted' AND template_id = tmpl_tg_lead) THEN
        INSERT INTO public.notification_triggers (name, description, event_key, template_id, channel, recipient_type, conditions, timing_type, is_active)
        VALUES ('Telegram: Alert Nuovo Messaggio Sito', 'Notifica immediata su Telegram bot con recapito telefonico ed email', 'contact_form.submitted', tmpl_tg_lead, 2, 2, '{}'::jsonb, 'immediate', true);
    END IF;
END $$;
