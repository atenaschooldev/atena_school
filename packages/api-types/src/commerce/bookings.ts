/**
 * ============================================================================
 * ATENA SCHOOL — COMMERCE / BOOKINGS & SUBSCRIPTIONS DOMAIN
 * ============================================================================
 * @module @atena/api-types/commerce/bookings
 * @description
 * Реестр бронирований курсов, помесячных подписок и сессий оформления:
 * - BookingPaymentStatus: 1=PENDING, 2=RESERVED, 3=PAID, 4=REFUNDED, 5=PARTIALLY_REFUNDED, 6=FAILED, 7=CANCELLED
 * - BookingStatus: 1=ACTIVE, 2=COMPLETED, 3=CANCELLED
 * - BookingSchedulingStatus: 1=SCHEDULED, 2=PENDING_COORDINATION
 * - BillingScheme: 1=FULL, 2=INSTALLMENTS, 3=PER_LESSON, 4=SUBSCRIPTION
 * - SubscriptionStatus: 1=ACTIVE, 2=PENDING_RECEPTION_PAYMENT, 3=PAST_DUE, 4=PAUSED, 5=CANCELED, 6=EXPIRED
 * - CourseBillingType: 1=ONE_TIME_ONLY, 2=SUBSCRIPTION_ONLY, 3=BOTH
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary.types';
import { PaymentMethod } from './payments';

// ----------------------------------------------------------------------------
// 1. Numeric Enums for Bookings & Subscriptions
// ----------------------------------------------------------------------------

export const BookingPaymentStatus = {
  PENDING: 1,            // Awaiting online payment (Stripe checkout)
  RESERVED: 2,           // Reserved with in-person payment (at the reception)
  PAID: 3,               // Paid in full
  REFUNDED: 4,           // Full refund issued
  PARTIALLY_REFUNDED: 5, // Partial refund issued
  FAILED: 6,             // Payment failed
  CANCELLED: 7,          // Cancelled before payment
} as const;
export type BookingPaymentStatus = (typeof BookingPaymentStatus)[keyof typeof BookingPaymentStatus];

export const BookingStatus = {
  ACTIVE: 1,    // Active enrollment — lessons in progress
  COMPLETED: 2, // Course successfully completed
  CANCELLED: 3, // Booking cancelled
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingSchedulingStatus = {
  SCHEDULED: 1,            // Lessons are scheduled in the calendar
  PENDING_COORDINATION: 2, // Awaiting schedule coordination (flexible timetable)
} as const;
export type BookingSchedulingStatus = (typeof BookingSchedulingStatus)[keyof typeof BookingSchedulingStatus];

export const BillingScheme = {
  FULL: 1,         // Full course payment upfront
  INSTALLMENTS: 2, // Payment in installments
  PER_LESSON: 3,   // Pay per lesson
  SUBSCRIPTION: 4, // Recurring monthly subscription / Abbonamento mensile
} as const;
export type BillingScheme = (typeof BillingScheme)[keyof typeof BillingScheme];

export const SubscriptionStatus = {
  ACTIVE: 1,                    // Active and paid (Attiva e pagata)
  PENDING_RECEPTION_PAYMENT: 2, // In-person subscription awaiting payment (In attesa di saldo in sede)
  PAST_DUE: 3,                  // Payment failed or overdue (Scaduta / Pagamento fallito)
  PAUSED: 4,                    // Temporarily paused / frozen (In pausa)
  CANCELED: 5,                  // Canceled by student/admin (Annullata)
  EXPIRED: 6,                   // Expired at period end (Terminata)
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const CourseBillingType = {
  ONE_TIME_ONLY: 1,     // One-time payment only (packages, certifications, single lessons)
  SUBSCRIPTION_ONLY: 2, // Subscription only (recurring monthly)
  BOTH: 3,              // Both one-time purchase and monthly subscription available
} as const;
export type CourseBillingType = (typeof CourseBillingType)[keyof typeof CourseBillingType];

// ----------------------------------------------------------------------------
// 2. Metadata Dictionaries
// ----------------------------------------------------------------------------

export const BOOKING_PAYMENT_STATUS_DICTIONARY: Record<BookingPaymentStatus, DictionaryEntry> = {
  [BookingPaymentStatus.PENDING]: {
    id: 1,
    code: 'PENDING',
    label_it: 'In attesa di pagamento',
    label_en: 'Pending payment',
    label_ru: 'Ожидает онлайн-оплаты',
    description: 'Сессия чекаута Stripe открыта, ожидает оплаты клиентом',
  },
  [BookingPaymentStatus.RESERVED]: {
    id: 2,
    code: 'RESERVED',
    label_it: 'Prenotato con saldo in sede',
    label_en: 'Reserved (pay at school)',
    label_ru: 'Забронировано с оплатой на месте',
    description: 'Бронь подтверждена клиентом с оплатой на рецепции школы',
  },
  [BookingPaymentStatus.PAID]: {
    id: 3,
    code: 'PAID',
    label_it: 'Pagato',
    label_en: 'Paid',
    label_ru: 'Оплачено',
    description: 'Оплата успешно получена в полном объёме',
  },
  [BookingPaymentStatus.REFUNDED]: {
    id: 4,
    code: 'REFUNDED',
    label_it: 'Rimborsato',
    label_en: 'Refunded',
    label_ru: 'Полный возврат',
    description: 'Произведён полный возврат денежных средств',
  },
  [BookingPaymentStatus.PARTIALLY_REFUNDED]: {
    id: 5,
    code: 'PARTIALLY_REFUNDED',
    label_it: 'Parzialmente rimborsato',
    label_en: 'Partially refunded',
    label_ru: 'Частичный возврат',
    description: 'Произведён частичный возврат средств',
  },
  [BookingPaymentStatus.FAILED]: {
    id: 6,
    code: 'FAILED',
    label_it: 'Fallito',
    label_en: 'Failed',
    label_ru: 'Ошибка оплаты',
    description: 'Транзакция оплаты отклонена банком или шлюзом',
  },
  [BookingPaymentStatus.CANCELLED]: {
    id: 7,
    code: 'CANCELLED',
    label_it: 'Annullato',
    label_en: 'Cancelled',
    label_ru: 'Отменено',
    description: 'Заказ отменён до момента оплаты',
  },
};

export const BOOKING_STATUS_DICTIONARY: Record<BookingStatus, DictionaryEntry> = {
  [BookingStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo',
    label_en: 'Active',
    label_ru: 'Активно',
    description: 'Студент зачислен, обучение продолжается',
  },
  [BookingStatus.COMPLETED]: {
    id: 2,
    code: 'COMPLETED',
    label_it: 'Completato',
    label_en: 'Completed',
    label_ru: 'Завершено',
    description: 'Все уроки пройдены, курс успешно окончен',
  },
  [BookingStatus.CANCELLED]: {
    id: 3,
    code: 'CANCELLED',
    label_it: 'Annullato',
    label_en: 'Cancelled',
    label_ru: 'Аннулировано',
    description: 'Бронирование прекращено или отменено',
  },
};

export const BOOKING_SCHEDULING_STATUS_DICTIONARY: Record<BookingSchedulingStatus, DictionaryEntry> = {
  [BookingSchedulingStatus.SCHEDULED]: {
    id: 1,
    code: 'SCHEDULED',
    label_it: 'Programmato',
    label_en: 'Scheduled',
    label_ru: 'Расписано',
    description: 'Уроки сгенерированы и внесены в расписание',
  },
  [BookingSchedulingStatus.PENDING_COORDINATION]: {
    id: 2,
    code: 'PENDING_COORDINATION',
    label_it: 'Da concordare',
    label_en: 'Pending coordination',
    label_ru: 'Ожидает согласования',
    description: 'Гибкий график: требуется согласование времени уроков',
  },
};

export const BILLING_SCHEME_DICTIONARY: Record<BillingScheme, DictionaryEntry> = {
  [BillingScheme.FULL]: {
    id: 1,
    code: 'FULL',
    label_it: 'Saldo unico',
    label_en: 'Full payment',
    label_ru: 'Полная оплата',
    description: 'Единоразовая полная оплата курса',
  },
  [BillingScheme.INSTALLMENTS]: {
    id: 2,
    code: 'INSTALLMENTS',
    label_it: 'A rate',
    label_en: 'Installments',
    label_ru: 'Оплата частями',
    description: 'Оплата по частям / ежемесячные взносы',
  },
  [BillingScheme.PER_LESSON]: {
    id: 3,
    code: 'PER_LESSON',
    label_it: 'A lezione',
    label_en: 'Per lesson',
    label_ru: 'Поурочная оплата',
    description: 'Оплата за каждое фактически посещённое занятие',
  },
  [BillingScheme.SUBSCRIPTION]: {
    id: 4,
    code: 'SUBSCRIPTION',
    label_it: 'Abbonamento mensile',
    label_en: 'Monthly subscription',
    label_ru: 'Ежемесячная подписка',
    description: 'Регулярная помесячная подписка с автопродлением или оплатой в кассе школы',
  },
};

export const SUBSCRIPTION_STATUS_DICTIONARY: Record<SubscriptionStatus, DictionaryEntry> = {
  [SubscriptionStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo',
    label_en: 'Active',
    label_ru: 'Активна',
    description: 'Подписка активна и оплачена на текущий период',
  },
  [SubscriptionStatus.PENDING_RECEPTION_PAYMENT]: {
    id: 2,
    code: 'PENDING_RECEPTION_PAYMENT',
    label_it: 'In attesa di saldo in sede',
    label_en: 'Pending in-person payment',
    label_ru: 'Ожидает оплаты в кассе',
    description: 'Подписка оформлена с оплатой наличными или картой на рецепции школы',
  },
  [SubscriptionStatus.PAST_DUE]: {
    id: 3,
    code: 'PAST_DUE',
    label_it: 'Pagamento scaduto',
    label_en: 'Past due',
    label_ru: 'Просрочена',
    description: 'Банк отклонил автосписание средств за следующий период',
  },
  [SubscriptionStatus.PAUSED]: {
    id: 4,
    code: 'PAUSED',
    label_it: 'In pausa',
    label_en: 'Paused',
    label_ru: 'На паузе',
    description: 'Подписка временно приостановлена (каникулы/заморозка)',
  },
  [SubscriptionStatus.CANCELED]: {
    id: 5,
    code: 'CANCELED',
    label_it: 'Disdetta / In chiusura',
    label_en: 'Canceled (ends at period end)',
    label_ru: 'Отменена',
    description: 'Автопродление отключено, студент доучивается до конца оплаченного месяца',
  },
  [SubscriptionStatus.EXPIRED]: {
    id: 6,
    code: 'EXPIRED',
    label_it: 'Terminata',
    label_en: 'Expired',
    label_ru: 'Истекла',
    description: 'Срок действия подписки завершен',
  },
};

export const COURSE_BILLING_TYPE_DICTIONARY: Record<CourseBillingType, DictionaryEntry> = {
  [CourseBillingType.ONE_TIME_ONLY]: {
    id: 1,
    code: 'ONE_TIME_ONLY',
    label_it: 'Solo saldo unico',
    label_en: 'One-time only',
    label_ru: 'Только разовая оплата',
    description: 'Курс доступен только для разовой единовременной покупки (пакеты, сертификаты)',
  },
  [CourseBillingType.SUBSCRIPTION_ONLY]: {
    id: 2,
    code: 'SUBSCRIPTION_ONLY',
    label_it: 'Solo abbonamento',
    label_en: 'Subscription only',
    label_ru: 'Только по подписке',
    description: 'Курс доступен исключительно по ежемесячной подписке / абонементу',
  },
  [CourseBillingType.BOTH]: {
    id: 3,
    code: 'BOTH',
    label_it: 'Entrambe le modalità',
    label_en: 'Both one-time & subscription',
    label_ru: 'Разово или по подписке',
    description: 'Студент может выбрать как оплатить весь курс сразу, так и оформить ежемесячный абонемент',
  },
};

// ----------------------------------------------------------------------------
// 3. Helper Bi-directional Mappings
// ----------------------------------------------------------------------------

export const BOOKING_PAYMENT_STATUS_STRING_TO_ID: Record<string, BookingPaymentStatus> = {
  pending: BookingPaymentStatus.PENDING,
  pending_payment: BookingPaymentStatus.PENDING,
  reserved: BookingPaymentStatus.RESERVED,
  paid: BookingPaymentStatus.PAID,
  completed: BookingPaymentStatus.PAID,
  refunded: BookingPaymentStatus.REFUNDED,
  partially_refunded: BookingPaymentStatus.PARTIALLY_REFUNDED,
  failed: BookingPaymentStatus.FAILED,
  cancelled: BookingPaymentStatus.CANCELLED,
  disputed: BookingPaymentStatus.FAILED,
};

export const BOOKING_PAYMENT_STATUS_ID_TO_STRING: Record<BookingPaymentStatus, string> = {
  [BookingPaymentStatus.PENDING]: 'pending',
  [BookingPaymentStatus.RESERVED]: 'reserved',
  [BookingPaymentStatus.PAID]: 'paid',
  [BookingPaymentStatus.REFUNDED]: 'refunded',
  [BookingPaymentStatus.PARTIALLY_REFUNDED]: 'partially_refunded',
  [BookingPaymentStatus.FAILED]: 'failed',
  [BookingPaymentStatus.CANCELLED]: 'cancelled',
};

export const BOOKING_STATUS_STRING_TO_ID: Record<string, BookingStatus> = {
  active: BookingStatus.ACTIVE,
  completed: BookingStatus.COMPLETED,
  cancelled: BookingStatus.CANCELLED,
};

export const BOOKING_STATUS_ID_TO_STRING: Record<BookingStatus, string> = {
  [BookingStatus.ACTIVE]: 'active',
  [BookingStatus.COMPLETED]: 'completed',
  [BookingStatus.CANCELLED]: 'cancelled',
};

export const BOOKING_SCHEDULING_STATUS_STRING_TO_ID: Record<string, BookingSchedulingStatus> = {
  scheduled: BookingSchedulingStatus.SCHEDULED,
  pending_coordination: BookingSchedulingStatus.PENDING_COORDINATION,
  pending: BookingSchedulingStatus.PENDING_COORDINATION,
  flexible: BookingSchedulingStatus.PENDING_COORDINATION,
};

export const BOOKING_SCHEDULING_STATUS_ID_TO_STRING: Record<BookingSchedulingStatus, string> = {
  [BookingSchedulingStatus.SCHEDULED]: 'scheduled',
  [BookingSchedulingStatus.PENDING_COORDINATION]: 'pending_coordination',
};

export const BILLING_SCHEME_STRING_TO_ID: Record<string, BillingScheme> = {
  full: BillingScheme.FULL,
  installments: BillingScheme.INSTALLMENTS,
  per_lesson: BillingScheme.PER_LESSON,
  subscription: BillingScheme.SUBSCRIPTION,
  abbonamento: BillingScheme.SUBSCRIPTION,
};

export const BILLING_SCHEME_ID_TO_STRING: Record<BillingScheme, string> = {
  [BillingScheme.FULL]: 'full',
  [BillingScheme.INSTALLMENTS]: 'installments',
  [BillingScheme.PER_LESSON]: 'per_lesson',
  [BillingScheme.SUBSCRIPTION]: 'subscription',
};

export const SUBSCRIPTION_STATUS_STRING_TO_ID: Record<string, SubscriptionStatus> = {
  active: SubscriptionStatus.ACTIVE,
  pending_reception_payment: SubscriptionStatus.PENDING_RECEPTION_PAYMENT,
  pending: SubscriptionStatus.PENDING_RECEPTION_PAYMENT,
  past_due: SubscriptionStatus.PAST_DUE,
  paused: SubscriptionStatus.PAUSED,
  canceled: SubscriptionStatus.CANCELED,
  cancelled: SubscriptionStatus.CANCELED,
  expired: SubscriptionStatus.EXPIRED,
};

export const SUBSCRIPTION_STATUS_ID_TO_STRING: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'active',
  [SubscriptionStatus.PENDING_RECEPTION_PAYMENT]: 'pending_reception_payment',
  [SubscriptionStatus.PAST_DUE]: 'past_due',
  [SubscriptionStatus.PAUSED]: 'paused',
  [SubscriptionStatus.CANCELED]: 'canceled',
  [SubscriptionStatus.EXPIRED]: 'expired',
};

export const COURSE_BILLING_TYPE_STRING_TO_ID: Record<string, CourseBillingType> = {
  one_time_only: CourseBillingType.ONE_TIME_ONLY,
  one_time: CourseBillingType.ONE_TIME_ONLY,
  subscription_only: CourseBillingType.SUBSCRIPTION_ONLY,
  subscription: CourseBillingType.SUBSCRIPTION_ONLY,
  both: CourseBillingType.BOTH,
};

export const COURSE_BILLING_TYPE_ID_TO_STRING: Record<CourseBillingType, string> = {
  [CourseBillingType.ONE_TIME_ONLY]: 'one_time_only',
  [CourseBillingType.SUBSCRIPTION_ONLY]: 'subscription_only',
  [CourseBillingType.BOTH]: 'both',
};

// ----------------------------------------------------------------------------
// 4. Safe Parsers
// ----------------------------------------------------------------------------

export function parseBillingScheme(val: unknown): BillingScheme {
  if (typeof val === 'number' && val in BILLING_SCHEME_DICTIONARY) {
    return val as BillingScheme;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = BILLING_SCHEME_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in BILLING_SCHEME_DICTIONARY) {
      return num as BillingScheme;
    }
  }
  return BillingScheme.FULL;
}

export function parseSubscriptionStatus(val: unknown): SubscriptionStatus {
  if (typeof val === 'number' && val in SUBSCRIPTION_STATUS_DICTIONARY) {
    return val as SubscriptionStatus;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = SUBSCRIPTION_STATUS_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in SUBSCRIPTION_STATUS_DICTIONARY) {
      return num as SubscriptionStatus;
    }
  }
  return SubscriptionStatus.ACTIVE;
}

export function parseCourseBillingType(val: unknown): CourseBillingType {
  if (typeof val === 'number' && val in COURSE_BILLING_TYPE_DICTIONARY) {
    return val as CourseBillingType;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = COURSE_BILLING_TYPE_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in COURSE_BILLING_TYPE_DICTIONARY) {
      return num as CourseBillingType;
    }
  }
  return CourseBillingType.ONE_TIME_ONLY;
}

export function parseBookingPaymentStatus(val: unknown): BookingPaymentStatus {
  if (typeof val === 'number' && val in BOOKING_PAYMENT_STATUS_DICTIONARY) {
    return val as BookingPaymentStatus;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = BOOKING_PAYMENT_STATUS_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in BOOKING_PAYMENT_STATUS_DICTIONARY) {
      return num as BookingPaymentStatus;
    }
  }
  return BookingPaymentStatus.PENDING;
}

// ----------------------------------------------------------------------------
// 5. Booking Records & Response DTO Interfaces
// ----------------------------------------------------------------------------

export interface BookingRecord {
  id: string;
  course_id: string;
  course_name: string;
  item_name?: string;
  name?: string;
  title_it?: string;
  title?: string;
  purchaser_name: string;
  purchaser_email: string;
  purchaser_phone?: string;
  purchaser_tax_code?: string;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  student_tax_code?: string;
  student_birth_date?: string;
  booking_date: string;
  start_date: string;
  starts_at?: string;
  date?: string;
  schedule_days?: number[];
  start_time?: string;
  end_time?: string;
  time?: string;
  orario?: string;
  schedule_type?: string;
  status: string;
  booking_status?: BookingStatus | number;
  scheduling_status?: BookingSchedulingStatus | number;
  payment_status: BookingPaymentStatus | number;
  payment_method: PaymentMethod | number;
  billing_scheme?: BillingScheme | number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: SubscriptionStatus | number | null;
  cancel_at_period_end?: boolean | null;
  subscription_starts_at?: string | null;
  subscription_ends_at?: string | null;
  amount_paid: number;
  registration_fee: number;
  course_price?: number;
  item_price?: number;
  total_amount?: number;
  amount?: number;
  notes?: string;
  created_at?: string;
}

export interface EnrichedBooking extends BookingRecord {
  item_id: string;
  item_type: string;
  item_title: string;
  price: number;
  teacher_name: string;
  location?: string;
  is_future: boolean;
  status: string;
  booking_status?: BookingStatus | number;
  slot_starts_at?: string;
}

export interface BookingPaymentItem {
  id: string;
  amount: number;
  type: string | number;
  status: string | number;
  payment_method?: string | number;
  academic_year?: string;
  created_at?: string;
}

export interface BookingLessonItem {
  id: string;
  starts_at: string;
  ends_at: string;
  status: number | string;
}

export interface BookingDetailsRecord extends BookingRecord {
  payment_status_label?: string;
  payment_method_label?: string;
  course_price?: number;
  item_price?: number;
  total_price?: number;
  payments?: BookingPaymentItem[];
  lessons_count?: number;
  lessons?: BookingLessonItem[];
}

export interface BookingDetailsResponse {
  success: boolean;
  booking?: BookingDetailsRecord;
  error?: string;
}

export interface FeeStatusResponse {
  success?: boolean;
  annualFeePaid: boolean;
  academicYear?: string;
  requiresFee: boolean;
  membership?: any;
  userFound?: boolean;
  feeReservedInBooking?: boolean;
  error?: string;
}

export interface BookingDto {
  id: string;
  courseId: string | null;
  courseName: string;

  // Purchaser
  purchaserName: string | null;
  purchaserEmail: string | null;
  purchaserPhone: string | null;
  purchaserTaxCode: string | null;

  // Student
  studentName: string;
  studentEmail: string | null;
  studentPhone: string | null;
  studentTaxCode: string | null;
  studentBirthDate: string | null;

  // Financials
  amountPaid: number;
  registrationFee: number;
  discountAmount: number;
  promoCode: string | null;

  // Statuses
  bookingStatus: number;
  paymentStatus: number;
  paymentMethod: number;
  billingScheme: number;
  schedulingStatus: number;

  // Schedule
  startDate: string | null;
  scheduleDays: number[];
  startTime: string | null;
  endTime: string | null;
  totalLessonsCount: number | null;

  // Notes & Metadata
  notes: string | null;
  createdAt: string;
}

export function formatBookingDto(b: Record<string, any>): BookingDto {
  return {
    id: b.id,
    courseId: b.course_id || b.courseId || null,
    courseName: b.course_name || b.courseName || 'Corso Atena School',

    purchaserName: b.purchaser_name || b.purchaserName || null,
    purchaserEmail: b.purchaser_email || b.purchaserEmail || null,
    purchaserPhone: b.purchaser_phone || b.purchaserPhone || null,
    purchaserTaxCode: b.purchaser_tax_code || b.purchaserTaxCode || null,

    studentName: b.student_name || b.studentName || b.purchaser_name || b.purchaserName || '',
    studentEmail: b.student_email || b.studentEmail || null,
    studentPhone: b.student_phone || b.studentPhone || null,
    studentTaxCode: b.student_tax_code || b.studentTaxCode || null,
    studentBirthDate: b.student_birth_date ? String(b.student_birth_date).split('T')[0] : (b.studentBirthDate ? String(b.studentBirthDate).split('T')[0] : null),

    amountPaid: Number(b.amount_paid != null ? b.amount_paid : (b.amountPaid != null ? b.amountPaid : 0)),
    registrationFee: Number(b.registration_fee != null ? b.registration_fee : (b.registrationFee != null ? b.registrationFee : 0)),
    discountAmount: Number(b.discount_amount != null ? b.discount_amount : (b.discountAmount != null ? b.discountAmount : 0)),
    promoCode: b.promo_code || b.promoCode || null,

    bookingStatus: Number(b.booking_status != null ? b.booking_status : (b.bookingStatus != null ? b.bookingStatus : 1)),
    paymentStatus: Number(b.payment_status != null ? b.payment_status : (b.paymentStatus != null ? b.paymentStatus : 1)),
    paymentMethod: Number(b.payment_method != null ? b.payment_method : (b.paymentMethod != null ? b.paymentMethod : 1)),
    billingScheme: Number(b.billing_scheme != null ? b.billing_scheme : (b.billingScheme != null ? b.billingScheme : 1)),
    schedulingStatus: Number(b.scheduling_status != null ? b.scheduling_status : (b.schedulingStatus != null ? b.schedulingStatus : 1)),

    startDate: b.start_date ? String(b.start_date).split('T')[0] : (b.startDate ? String(b.startDate).split('T')[0] : null),
    scheduleDays: Array.isArray(b.schedule_days) ? b.schedule_days : (Array.isArray(b.scheduleDays) ? b.scheduleDays : []),
    startTime: b.start_time || b.startTime || null,
    endTime: b.end_time || b.endTime || null,
    totalLessonsCount: b.total_lessons_count != null ? Number(b.total_lessons_count) : (b.totalLessonsCount != null ? Number(b.totalLessonsCount) : null),

    notes: b.notes || null,
    createdAt: b.created_at ? new Date(b.created_at).toISOString() : (b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString()),
  };
}

export interface ReservationResponse {
  success: boolean;
  bookingId?: string;
  booking?: BookingDto;
  error?: string;
  details?: Record<string, string[]>;
}

export interface CheckoutSessionResponse {
  success: boolean;
  url?: string;
  bookingId?: string;
  booking?: BookingDto;
  error?: string;
  details?: Record<string, string[]>;
}


export interface SiteContentResponse {
  success: boolean;
  hero?: any;
  about?: any;
  testimonials?: any[];
  contact?: any;
}
