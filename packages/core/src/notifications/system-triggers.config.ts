import { NotificationChannel, RecipientType } from '@atena/api-types';

export interface SystemTriggerDefinition {
  id: string;
  name: string;
  description: string;
  event_key: string;
  template_code: string;
  channel: NotificationChannel;
  recipient_type: RecipientType | 4; // 1: CUSTOMER, 2: ADMIN, 3: TEACHER, 4: CUSTOM
  custom_recipient?: string | null;
  conditions?: Record<string, any> | null;
  timing_type: 'immediate' | 'delayed' | 'before_event';
  delay_seconds: number;
  is_active: boolean;
}

export const SYSTEM_TRIGGERS: SystemTriggerDefinition[] = [
  // 1. Stripe Payment Succeeded
  {
    id: 'trg_stripe_payment_receipt_customer',
    name: 'Ricevuta Pagamento Stripe al Cliente',
    description: 'Invia ricevuta di pagamento dettagliata via email quando la transazione Stripe va a buon fine',
    event_key: 'booking.created_stripe',
    template_code: 'payment_receipt_customer',
    channel: NotificationChannel.EMAIL,
    recipient_type: RecipientType.CUSTOMER,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },
  {
    id: 'trg_stripe_booking_alert_admin_tg',
    name: 'Notifica Telegram Nuova Iscrizione Stripe',
    description: 'Invia card interattiva con riepilogo e pulsanti rapidi nel canale Telegram della segreteria',
    event_key: 'booking.created_stripe',
    template_code: 'telegram_booking_alert',
    channel: NotificationChannel.TELEGRAM,
    recipient_type: RecipientType.ADMIN,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },
  {
    id: 'trg_stripe_booking_alert_admin_email',
    name: 'Notifica Email Nuova Iscrizione Stripe alla Segreteria',
    description: 'Invia riepilogo anagrafico e contabile via email all\'amministrazione',
    event_key: 'booking.created_stripe',
    template_code: 'booking_alert_admin',
    channel: NotificationChannel.EMAIL,
    recipient_type: RecipientType.ADMIN,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },

  // 2. Booking Pending Cash / On-Site Payment
  {
    id: 'trg_cash_booking_confirmation_customer',
    name: 'Conferma Prenotazione con Saldo in Sede al Cliente',
    description: 'Invia email con istruzioni di saldo in segreteria e riepilogo orari corso',
    event_key: 'booking.pending_cash',
    template_code: 'booking_confirmation_customer',
    channel: NotificationChannel.EMAIL,
    recipient_type: RecipientType.CUSTOMER,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },
  {
    id: 'trg_cash_booking_alert_admin_tg',
    name: 'Notifica Telegram Prenotazione Saldo in Sede',
    description: 'Invia card interattiva con pulsanti di saldo rapido nel canale Telegram',
    event_key: 'booking.pending_cash',
    template_code: 'telegram_booking_alert',
    channel: NotificationChannel.TELEGRAM,
    recipient_type: RecipientType.ADMIN,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },
  {
    id: 'trg_cash_booking_alert_admin_email',
    name: 'Notifica Email Prenotazione Saldo in Sede',
    description: 'Invia alert alla segreteria per prenotazioni da saldare in sede',
    event_key: 'booking.pending_cash',
    template_code: 'booking_alert_admin',
    channel: NotificationChannel.EMAIL,
    recipient_type: RecipientType.ADMIN,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },

  // 3. Contact Form Submission
  {
    id: 'trg_contact_lead_alert_tg',
    name: 'Notifica Telegram Richiesta di Contatto',
    description: 'Invia alert istantaneo con link diretto WhatsApp per ricontattare il lead',
    event_key: 'contact_form.submitted',
    template_code: 'telegram_lead_alert',
    channel: NotificationChannel.TELEGRAM,
    recipient_type: RecipientType.ADMIN,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },
  {
    id: 'trg_contact_lead_admin_email',
    name: 'Notifica Email Richiesta Contatto alla Segreteria',
    description: 'Invia il messaggio e i contatti del lead alla casella della scuola',
    event_key: 'contact_form.submitted',
    template_code: 'contact_lead_admin',
    channel: NotificationChannel.EMAIL,
    recipient_type: RecipientType.ADMIN,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },

  // 4. Booking Cancelled
  {
    id: 'trg_booking_cancelled_customer',
    name: 'Notifica Cancellazione Iscrizione al Cliente',
    description: 'Invia conferma di annullamento prenotazione al cliente',
    event_key: 'booking.cancelled',
    template_code: 'booking_cancellation_customer',
    channel: NotificationChannel.EMAIL,
    recipient_type: RecipientType.CUSTOMER,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },

  // 5. Membership Card Issued
  {
    id: 'trg_membership_card_customer',
    name: 'Invio Tessera Associativa al Socio',
    description: 'Invia tessera associativa annuale con numero tessera e validità',
    event_key: 'membership.card_issued',
    template_code: 'membership_card_customer',
    channel: NotificationChannel.EMAIL,
    recipient_type: RecipientType.CUSTOMER,
    timing_type: 'immediate',
    delay_seconds: 0,
    is_active: true,
  },
];
