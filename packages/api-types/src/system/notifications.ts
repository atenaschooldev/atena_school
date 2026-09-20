/**
 * ============================================================================
 * ATENA SCHOOL — SYSTEM / NOTIFICATIONS & ITEM TYPES DOMAIN
 * ============================================================================
 * @module @atena/api-types/system/notifications
 * @description
 * Типы системных почтовых транзакций и категории образовательных услуг:
 * - ItemType: 1=COURSE, 2=SINGLE_LESSON, 3=PACKAGE, 4=CERTIFICATION
 * - NotificationType: 1=BOOKING_CONFIRMATION, 2=PAYMENT_RECEIPT, 3=PAYMENT_REMINDER, 4=MEMBERSHIP_CARD, 5=CONTACT_FORM
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. Item Types
// ----------------------------------------------------------------------------

export const ItemType = {
  COURSE: 1,        // Standard regular course / Corso Standard / Стандартный курс
  SINGLE_LESSON: 2, // Single lesson / Lezione Singola / Разовый урок
  PACKAGE: 3,       // Hours package / Pacchetto Ore / Пакет часов
  CERTIFICATION: 4, // Exam session / Esame Certificazione / Экзамен
} as const;
export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const ITEM_TYPE_DICTIONARY: Record<ItemType, DictionaryEntry> = {
  [ItemType.COURSE]: {
    id: 1,
    code: 'COURSE',
    label_it: 'Corso Standard',
    label_en: 'Standard Course',
    label_ru: 'Стандартный курс',
    description: 'Регулярный групповой или индивидуальный курс школы',
  },
  [ItemType.SINGLE_LESSON]: {
    id: 2,
    code: 'SINGLE_LESSON',
    label_it: 'Lezione Singola',
    label_en: 'Single Lesson',
    label_ru: 'Разовое занятие',
    description: 'Однократный индивидуальный урок или консультация',
  },
  [ItemType.PACKAGE]: {
    id: 3,
    code: 'PACKAGE',
    label_it: 'Pacchetto Ore / Lezioni',
    label_en: 'Hour / Lesson Package',
    label_ru: 'Пакет занятий',
    description: 'Блок уроков (например, 10 или 20 часов)',
  },
  [ItemType.CERTIFICATION]: {
    id: 4,
    code: 'CERTIFICATION',
    label_it: 'Esame di Certificazione',
    label_en: 'Certification Exam',
    label_ru: 'Сертификационный экзамен',
    description: 'Экзаменационный ваучер / сессия (EIPASS, Cambridge)',
  },
};

export function parseItemType(val: any): ItemType {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as ItemType;
    return ItemType.COURSE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'course' || s === 'corso') return ItemType.COURSE;
  if (s === '2' || s === 'lesson' || s === 'lezione' || s === 'single') return ItemType.SINGLE_LESSON;
  if (s === '3' || s === 'package' || s === 'pacchetto') return ItemType.PACKAGE;
  if (s === '4' || s === 'certification' || s === 'certificazione' || s === 'shop') return ItemType.CERTIFICATION;
  return ItemType.COURSE;
}

// ----------------------------------------------------------------------------
// 2. Notification Types (Resend Transactional Emails)
// ----------------------------------------------------------------------------

export const NotificationType = {
  BOOKING_CONFIRMATION: 1, // Booking confirmation email / Conferma prenotazione
  PAYMENT_RECEIPT: 2,      // Payment receipt with breakdown / Ricevuta pagamento
  PAYMENT_REMINDER: 3,     // Reception payment reminder / Promemoria saldo
  MEMBERSHIP_CARD: 4,      // Annual membership card / Tessera associativa
  CONTACT_FORM: 5,         // Contact request from landing / Richiesta contatto
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NOTIFICATION_TYPE_DICTIONARY: Record<NotificationType, DictionaryEntry> = {
  [NotificationType.BOOKING_CONFIRMATION]: {
    id: 1,
    code: 'BOOKING_CONFIRMATION',
    label_it: 'Conferma Prenotazione',
    label_en: 'Booking Confirmation',
    label_ru: 'Подтверждение бронирования',
    description: 'Уведомление клиенту и школе об успешной записи на курс',
  },
  [NotificationType.PAYMENT_RECEIPT]: {
    id: 2,
    code: 'PAYMENT_RECEIPT',
    label_it: 'Ricevuta di Pagamento',
    label_en: 'Payment Receipt',
    label_ru: 'Квитанция об оплате',
    description: 'Финансовая квитанция с детализацией курса и взноса €30',
  },
  [NotificationType.PAYMENT_REMINDER]: {
    id: 3,
    code: 'PAYMENT_REMINDER',
    label_it: 'Promemoria Saldo',
    label_en: 'Payment Reminder',
    label_ru: 'Напоминание об оплате',
    description: 'Напоминание о необходимости доплаты в секретариате',
  },
  [NotificationType.MEMBERSHIP_CARD]: {
    id: 4,
    code: 'MEMBERSHIP_CARD',
    label_it: 'Tessera Associativa',
    label_en: 'Membership Card',
    label_ru: 'Членская карта',
    description: 'Подтверждение членства ассоциации на учебный год',
  },
  [NotificationType.CONTACT_FORM]: {
    id: 5,
    code: 'CONTACT_FORM',
    label_it: 'Richiesta di Contatto',
    label_en: 'Contact Request',
    label_ru: 'Заявка с сайта',
    description: 'Сообщение из формы обратной связи лендинга',
  },
};

// ----------------------------------------------------------------------------
// 3. Notification Channels & Statuses
// ----------------------------------------------------------------------------

export const NotificationChannel = {
  EMAIL: 1,
  TELEGRAM: 2,
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NOTIFICATION_CHANNEL_DICTIONARY: Record<NotificationChannel, DictionaryEntry> = {
  [NotificationChannel.EMAIL]: {
    id: 1,
    code: 'EMAIL',
    label_it: 'Email',
    label_en: 'Email',
    label_ru: 'Электронная почта',
    description: 'Транзакционные письма через Resend',
  },
  [NotificationChannel.TELEGRAM]: {
    id: 2,
    code: 'TELEGRAM',
    label_it: 'Telegram',
    label_en: 'Telegram',
    label_ru: 'Telegram',
    description: 'Уведомления в Telegram-канал секретариата',
  },
};

export function parseNotificationChannel(val: any): NotificationChannel {
  if (typeof val === 'number') {
    if (val === 1 || val === 2) return val as NotificationChannel;
    return NotificationChannel.EMAIL;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'email' || s === 'mail') return NotificationChannel.EMAIL;
  if (s === '2' || s === 'telegram' || s === 'tg') return NotificationChannel.TELEGRAM;
  return NotificationChannel.EMAIL;
}

// ----------------------------------------------------------------------------
// 3b. Recipient Types (Target audience for notification templates)
// ----------------------------------------------------------------------------

export const RecipientType = {
  CUSTOMER: 1,
  ADMIN: 2,
} as const;
export type RecipientType = (typeof RecipientType)[keyof typeof RecipientType];

export const RECIPIENT_TYPE_DICTIONARY: Record<RecipientType, DictionaryEntry> = {
  [RecipientType.CUSTOMER]: {
    id: 1,
    code: 'CUSTOMER',
    label_it: 'Cliente',
    label_en: 'Customer',
    label_ru: 'Клиент',
    description: 'Уведомления, отправляемые студенту или родителю',
  },
  [RecipientType.ADMIN]: {
    id: 2,
    code: 'ADMIN',
    label_it: 'Amministrazione',
    label_en: 'Administration',
    label_ru: 'Администрация школы',
    description: 'Уведомления и алерты секретариату и руководству',
  },
};

export function parseRecipientType(val: any): RecipientType {
  if (typeof val === 'number') {
    if (val === 1 || val === 2) return val as RecipientType;
    return RecipientType.CUSTOMER;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'customer' || s === 'cliente') return RecipientType.CUSTOMER;
  if (s === '2' || s === 'admin' || s === 'amministrazione') return RecipientType.ADMIN;
  return RecipientType.CUSTOMER;
}

export const NotificationStatus = {
  SENT: 1,
  FAILED: 2,
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NOTIFICATION_STATUS_DICTIONARY: Record<NotificationStatus, DictionaryEntry> = {
  [NotificationStatus.SENT]: {
    id: 1,
    code: 'SENT',
    label_it: 'Inviato',
    label_en: 'Sent',
    label_ru: 'Отправлено',
    description: 'Уведомление успешно доставлено / отправлено провайдеру',
  },
  [NotificationStatus.FAILED]: {
    id: 2,
    code: 'FAILED',
    label_it: 'Fallito',
    label_en: 'Failed',
    label_ru: 'Ошибка отправки',
    description: 'Ошибка при отправке уведомления через провайдера',
  },
};

// ----------------------------------------------------------------------------
// 3c. Notification Templates Visual Block Types & Interfaces
// ----------------------------------------------------------------------------

export type TemplateBlockType =
  | 'header'
  | 'greeting'
  | 'summary_table'
  | 'contact_summary_table'
  | 'cta_button'
  | 'bank_details'
  | 'school_location'
  | 'notes'
  | 'custom_text'
  | 'footer'
  | 'tg_header'
  | 'tg_student_info'
  | 'tg_course_info'
  | 'tg_payment_info'
  | 'tg_custom_text'
  | 'tg_inline_buttons';

export interface TemplateBlock {
  id: string;
  type: TemplateBlockType;
  title: string;
  is_enabled: boolean;
  order: number;
  props: Record<string, any>;
}

export interface TemplateBlocksConfig {
  version: number;
  channel: NotificationChannel;
  theme?: {
    primary_color?: string;
    accent_color?: string;
    background_pattern?: boolean;
    header_style?: 'navy_grid' | 'clean_white' | 'dark_gradient';
  };
  blocks: TemplateBlock[];
}

export interface NotificationTemplateRecord {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  channel: NotificationChannel;
  notification_type: NotificationType;
  recipient_type: RecipientType;
  subject?: string | null;
  subject_template?: string | null;
  body_html?: string | null;
  body_text?: string | null;
  body_template?: string | null;
  blocks_config?: TemplateBlocksConfig | null;
  available_variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationTemplateDto {
  code: string;
  name: string;
  description?: string;
  channel: NotificationChannel;
  notification_type?: NotificationType;
  recipient_type?: RecipientType;
  subject?: string;
  subject_template?: string;
  body_html?: string;
  body_text?: string;
  body_template?: string;
  blocks_config?: TemplateBlocksConfig;
  available_variables?: string[];
  is_active?: boolean;
}

export interface UpdateNotificationTemplateDto {
  name?: string;
  description?: string;
  subject?: string;
  subject_template?: string;
  body_html?: string;
  body_text?: string;
  body_template?: string;
  blocks_config?: TemplateBlocksConfig;
  is_active?: boolean;
}

export interface TestSendNotificationDto {
  template_id?: string;
  code?: string;
  recipient: string;
  subject?: string;
  subject_template?: string;
  body_html?: string;
  body_text?: string;
  body_template?: string;
  blocks_config?: TemplateBlocksConfig;
  sample_data?: Record<string, any>;
}

// ----------------------------------------------------------------------------
// 3d. System Event Registry & Notification Triggers
// ----------------------------------------------------------------------------

export interface SystemEventVariable {
  key: string;
  label_it: string;
  label_en: string;
  example: string;
}

export interface SystemEventDefinition {
  event_key: string;
  category: 'booking' | 'payment' | 'lead' | 'lesson';
  label_it: string;
  label_en: string;
  description_it: string;
  description_en: string;
  available_variables: SystemEventVariable[];
}

export const SYSTEM_EVENTS_REGISTRY: Record<string, SystemEventDefinition> = {
  'booking.created_stripe': {
    event_key: 'booking.created_stripe',
    category: 'payment',
    label_it: 'Pagamento Stripe Confermato',
    label_en: 'Stripe Payment Succeeded',
    description_it: 'Scatta quando una transazione su Stripe va a buon fine',
    description_en: 'Fires when a Stripe checkout transaction succeeds',
    available_variables: [
      { key: 'purchaser_name', label_it: 'Nome Acquirente', label_en: 'Purchaser Name', example: 'Mario Rossi' },
      { key: 'purchaser_email', label_it: 'Email Acquirente', label_en: 'Purchaser Email', example: 'mario.rossi@gmail.com' },
      { key: 'purchaser_phone', label_it: 'Telefono Acquirente', label_en: 'Purchaser Phone', example: '+39 333 1234567' },
      { key: 'student_name', label_it: 'Nome Studente', label_en: 'Student Name', example: 'Luca Rossi' },
      { key: 'course_name', label_it: 'Nome Corso', label_en: 'Course Name', example: 'Kids English (6-7 anni)' },
      { key: 'course_price', label_it: 'Prezzo Corso', label_en: 'Course Price', example: '73.20' },
      { key: 'registration_fee', label_it: 'Quota Iscrizione (€)', label_en: 'Reg Fee (€)', example: '30.00' },
      { key: 'total_amount', label_it: 'Totale (€)', label_en: 'Total Amount (€)', example: '103.20' },
      { key: 'amount_paid', label_it: 'Importo Incassato', label_en: 'Amount Paid', example: '103.20' },
      { key: 'start_date', label_it: 'Data di Inizio', label_en: 'Start Date', example: '2026-10-06' },
      { key: 'lesson_schedule', label_it: 'Orario Lezioni', label_en: 'Lesson Schedule', example: 'Martedì e Giovedì 17:00-18:00' },
      { key: 'booking_id', label_it: 'ID Prenotazione', label_en: 'Booking ID', example: '10bde731-f620-4e16-a240-63bb08b86d70' },
      { key: 'dashboard_url', label_it: 'Link Portale Studente', label_en: 'Student Portal URL', example: 'https://app.atenaschool.com' },
    ],
  },
  'booking.pending_cash': {
    event_key: 'booking.pending_cash',
    category: 'payment',
    label_it: 'Prenotazione con Saldo in Sede',
    label_en: 'New Booking with In-Person Payment',
    description_it: 'Scatta quando il cliente prenota scegliendo di saldare in contanti o bonifico',
    description_en: 'Fires when client books with cash or bank transfer option',
    available_variables: [
      { key: 'purchaser_name', label_it: 'Nome Acquirente', label_en: 'Purchaser Name', example: 'Mario Rossi' },
      { key: 'purchaser_email', label_it: 'Email Acquirente', label_en: 'Purchaser Email', example: 'mario.rossi@gmail.com' },
      { key: 'purchaser_phone', label_it: 'Telefono Acquirente', label_en: 'Purchaser Phone', example: '+39 333 1234567' },
      { key: 'student_name', label_it: 'Nome Studente', label_en: 'Student Name', example: 'Luca Rossi' },
      { key: 'course_name', label_it: 'Nome Corso', label_en: 'Course Name', example: 'Kids English (6-7 anni)' },
      { key: 'total_amount', label_it: 'Totale da Saldare (€)', label_en: 'Total to Pay (€)', example: '103.20' },
      { key: 'start_date', label_it: 'Data di Inizio', label_en: 'Start Date', example: '2026-10-06' },
      { key: 'lesson_schedule', label_it: 'Orario Lezioni', label_en: 'Lesson Schedule', example: 'Martedì e Giovedì 17:00-18:00' },
      { key: 'booking_id', label_it: 'ID Prenotazione', label_en: 'Booking ID', example: '10bde731-f620-4e16-a240-63bb08b86d70' },
    ],
  },
  'contact_form.submitted': {
    event_key: 'contact_form.submitted',
    category: 'lead',
    label_it: 'Richiesta di Contatto dal Sito',
    label_en: 'Contact / Lead Form Submission',
    description_it: 'Scatta quando un utente invia una richiesta tramite il form contatti',
    description_en: 'Fires when user submits a contact inquiry form on the landing page',
    available_variables: [
      { key: 'sender_name', label_it: 'Nome Mittente', label_en: 'Sender Name', example: 'Giuseppe Verdi' },
      { key: 'sender_email', label_it: 'Email Mittente', label_en: 'Sender Email', example: 'giuseppe.verdi@gmail.com' },
      { key: 'sender_phone', label_it: 'Telefono Mittente', label_en: 'Sender Phone', example: '+39 333 9876543' },
      { key: 'interest', label_it: 'Interesse / Corso', label_en: 'Interest / Course', example: 'Corso Cambridge B2' },
      { key: 'topic', label_it: 'Argomento', label_en: 'Topic', example: 'Informazioni Iscrizioni' },
      { key: 'message', label_it: 'Testo Messaggio', label_en: 'Message Body', example: 'Vorrei sapere quando iniziano i nuovi corsi serali.' },
    ],
  },
};

export interface NotificationTriggerRecord {
  id: string;
  name: string;
  description?: string | null;
  event_key: string;
  template_id: string;
  template?: NotificationTemplateRecord;
  channel: NotificationChannel;
  recipient_type: RecipientType | 3 | 4; // 1: CUSTOMER, 2: ADMIN, 3: STUDENT, 4: CUSTOM
  custom_recipient?: string | null;
  conditions?: Record<string, any> | null;
  timing_type: 'immediate' | 'delayed' | 'before_event';
  delay_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationTriggerDto {
  name: string;
  description?: string;
  event_key: string;
  template_id: string;
  channel: NotificationChannel;
  recipient_type: number;
  custom_recipient?: string;
  conditions?: Record<string, any>;
  timing_type?: string;
  delay_seconds?: number;
  is_active?: boolean;
}

export interface UpdateNotificationTriggerDto {
  name?: string;
  description?: string;
  event_key?: string;
  template_id?: string;
  channel?: NotificationChannel;
  recipient_type?: number;
  custom_recipient?: string;
  conditions?: Record<string, any>;
  timing_type?: string;
  delay_seconds?: number;
  is_active?: boolean;
}

// ----------------------------------------------------------------------------
// 4. Log Types / Interfaces
// ----------------------------------------------------------------------------

export interface BaseApiLog {
  id: string;
  created_at: string;
  controller: string;
  action: string;
  http_method: string;
  endpoint: string;
  user_id?: string | null;
  user_role?: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request?: Record<string, any> | null;
  response?: Record<string, any> | null;
  status_code: number;
}

export type LandingApiLog = BaseApiLog;
export type AppApiLog = BaseApiLog;
export type AdminApiLog = BaseApiLog;
export type ApiLog = BaseApiLog;


export interface NotificationLog {
  id: string;
  created_at: string;
  channel: NotificationChannel;
  notification_type: NotificationType;
  recipient: string;
  subject?: string | null;
  request: Record<string, any>;
  response?: Record<string, any> | null;
  status: NotificationStatus;
}

