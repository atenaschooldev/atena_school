// Centralized API Types & DTO Interfaces (Single Source of Truth)

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at?: string;
}

export interface CourseItem {
  id: string;
  name: string;
  title_it?: string;
  slug?: string;
  description?: string;
  description_it?: string;
  photo_url?: string;
  image_url?: string;
  price: number | string;
  status: CourseStatus | number | string;
  category?: string;
  schedule_days?: string[] | number[];
  schedule_type?: CourseScheduleType | number | string;
  course_format?: CourseFormat | number | string;
  billing_type?: CourseBillingType | number | string;
  subscription_price?: number | string | null;
  stripe_monthly_price_id?: string | null;
  lesson_duration_minutes?: number;
  lessons_per_week?: number | null;
  total_hours?: number | null;
  total_lessons?: number | null;
  type?: string;
  start_time?: string;
  end_time?: string;
  teacher_id?: string;
  teacher_name?: string;
  teachers?: {
    full_name: string;
  };
}

// ---------------------------------------------------------------------------
// Numeric Enums for Bookings & Subscriptions (Single Source of Truth)
// ---------------------------------------------------------------------------

export const BookingPaymentStatus = {
  PENDING: 1,            // Awaiting online payment (Stripe checkout)
  RESERVED: 2,           // Reserved with in-person payment (at the reception)
  PAID: 3,               // Paid
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

export const PaymentMethod = {
  STRIPE: 1,        // Online via Stripe
  CASH: 2,          // Cash at the reception (Contanti)
  POS: 3,           // Bank card at school POS terminal
  BANK_TRANSFER: 4, // Bank transfer (Bonifico)
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

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

export const PaymentCurrency = {
  EUR: 1, // Euro (€)
  USD: 2, // US Dollar ($)
  GBP: 3, // British Pound (£)
} as const;
export type PaymentCurrency = (typeof PaymentCurrency)[keyof typeof PaymentCurrency];

export const PaymentType = {
  COURSE_PAYMENT: 1,    // Course payment / Pagamento Corso
  REGISTRATION_FEE: 2,  // Annual registration fee €30 / Quota Iscrizione
  INSTALLMENT: 3,       // Installment payment / Rata Corso
  SINGLE_LESSON: 4,     // Single lesson / Lezione Singola
  EXAM_FEE: 5,          // Exam entry fee Cambridge/CELI / Quota Esame
  CERTIFICATE_FEE: 6,   // Certificate issuance / Rilascio Certificato
  MATERIAL_TEXTBOOK: 7, // Study materials and textbooks / Libro o Materiale Didattico
  OTHER: 8,             // Other / Altro
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const PaymentRecordStatus = {
  PENDING: 1,            // Processing / In attesa
  SUCCEEDED: 2,          // Successfully completed / Completato
  FAILED: 3,             // Payment failed / Fallito
  REFUNDED: 4,           // Full refund / Rimborsato
  PARTIALLY_REFUNDED: 5, // Partial refund / Parzialmente rimborsato
  CANCELLED: 6,          // Cancelled / Annullato
} as const;
export type PaymentRecordStatus = (typeof PaymentRecordStatus)[keyof typeof PaymentRecordStatus];

export const PaymentProvider = {
  STRIPE: 1,       // Stripe payment gateway
  MANUAL: 2,       // Manual reception cash register
  POS_TERMINAL: 3, // Physical bank POS terminal
  BANK: 4,         // Direct bank transfer (IBAN)
} as const;
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];

// ---------------------------------------------------------------------------
// Numeric Enums for Lessons (Single Source of Truth)
// ---------------------------------------------------------------------------

export const LessonStatus = {
  SCHEDULED:   1, // Scheduled / Programmata
  COMPLETED:   2, // Completed / Completata
  CANCELLED:   3, // Cancelled / Annullata
  RESCHEDULED: 4, // Rescheduled / Riprogrammata
} as const;
export type LessonStatus = (typeof LessonStatus)[keyof typeof LessonStatus];

export const LessonAttendance = {
  PENDING: 1, // Not yet recorded / Da registrare
  PRESENT: 2, // Attended / Presente
  ABSENT:  3, // Absent / Assente
  LATE:    4, // Late / In ritardo
  EXCUSED: 5, // Excused absence / Giustificato
} as const;
export type LessonAttendance = (typeof LessonAttendance)[keyof typeof LessonAttendance];

export const LessonLocationType = {
  IN_PERSON: 1, // In person / In presenza
  ONLINE:    2, // Online
  HYBRID:    3, // Hybrid / Ibrido
} as const;
export type LessonLocationType = (typeof LessonLocationType)[keyof typeof LessonLocationType];

// ---------------------------------------------------------------------------
// Dictionary Metadata & Mappings for Bookings
// ---------------------------------------------------------------------------

export interface DictionaryEntry {
  id: number;
  code: string;
  label_it: string;
  label_en: string;
  label_ru: string;
  description: string;
  it?: string;
  en?: string;
  ru?: string;
}

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

export const PAYMENT_METHOD_DICTIONARY: Record<PaymentMethod, DictionaryEntry> = {
  [PaymentMethod.STRIPE]: {
    id: 1,
    code: 'STRIPE',
    label_it: 'Carta online (Stripe)',
    label_en: 'Online card (Stripe)',
    label_ru: 'Онлайн-карта (Stripe)',
    description: 'Оплата банковской картой онлайн через Stripe',
  },
  [PaymentMethod.CASH]: {
    id: 2,
    code: 'CASH',
    label_it: 'Contanti in sede',
    label_en: 'Cash at school',
    label_ru: 'Наличные в кассе',
    description: 'Оплата наличными на рецепции школы (Contanti)',
  },
  [PaymentMethod.POS]: {
    id: 3,
    code: 'POS',
    label_it: 'POS in sede',
    label_en: 'POS at school',
    label_ru: 'Банковский терминал (POS)',
    description: 'Оплата банковской картой через терминал в школе',
  },
  [PaymentMethod.BANK_TRANSFER]: {
    id: 4,
    code: 'BANK_TRANSFER',
    label_it: 'Bonifico bancario',
    label_en: 'Bank transfer',
    label_ru: 'Банковский перевод',
    description: 'Оплата по реквизитам на расчётный счёт школы (Bonifico)',
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

// ---------------------------------------------------------------------------
// Bi-directional Helper Mappers (Safe conversion from legacy string or number)
// ---------------------------------------------------------------------------

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

export const PAYMENT_METHOD_STRING_TO_ID: Record<string, PaymentMethod> = {
  stripe: PaymentMethod.STRIPE,
  card_online: PaymentMethod.STRIPE,
  cash: PaymentMethod.CASH,
  contanti: PaymentMethod.CASH,
  pos: PaymentMethod.POS,
  card: PaymentMethod.POS,
  bank_transfer: PaymentMethod.BANK_TRANSFER,
  bonifico: PaymentMethod.BANK_TRANSFER,
  transfer: PaymentMethod.BANK_TRANSFER,
};

export const PAYMENT_METHOD_ID_TO_STRING: Record<PaymentMethod, string> = {
  [PaymentMethod.STRIPE]: 'stripe',
  [PaymentMethod.CASH]: 'cash',
  [PaymentMethod.POS]: 'pos',
  [PaymentMethod.BANK_TRANSFER]: 'bank_transfer',
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

export function parsePaymentMethod(val: unknown): PaymentMethod {
  if (typeof val === 'number' && val in PAYMENT_METHOD_DICTIONARY) {
    return val as PaymentMethod;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = PAYMENT_METHOD_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in PAYMENT_METHOD_DICTIONARY) {
      return num as PaymentMethod;
    }
  }
  return PaymentMethod.CASH;
}

// ---------------------------------------------------------------------------
// Dictionary Metadata & Mappings for Payments
// ---------------------------------------------------------------------------

export const PAYMENT_CURRENCY_DICTIONARY: Record<PaymentCurrency, DictionaryEntry> = {
  [PaymentCurrency.EUR]: {
    id: 1,
    code: 'EUR',
    label_it: 'Euro (€)',
    label_en: 'Euro (€)',
    label_ru: 'Евро (€)',
    description: 'Основная валюта школы (Италия)',
  },
  [PaymentCurrency.USD]: {
    id: 2,
    code: 'USD',
    label_it: 'Dollaro USA ($)',
    label_en: 'US Dollar ($)',
    label_ru: 'Доллар США ($)',
    description: 'Международная валюта',
  },
  [PaymentCurrency.GBP]: {
    id: 3,
    code: 'GBP',
    label_it: 'Sterlina Britannica (£)',
    label_en: 'British Pound (£)',
    label_ru: 'Фунт стерлингов (£)',
    description: 'Британский фунт',
  },
};

export const PAYMENT_TYPE_DICTIONARY: Record<PaymentType, DictionaryEntry> = {
  [PaymentType.COURSE_PAYMENT]: {
    id: 1,
    code: 'COURSE_PAYMENT',
    label_it: 'Pagamento Corso',
    label_en: 'Course Payment',
    label_ru: 'Оплата курса',
    description: 'Оплата за обучение на курсе',
  },
  [PaymentType.REGISTRATION_FEE]: {
    id: 2,
    code: 'REGISTRATION_FEE',
    label_it: 'Quota Iscrizione Annuale (€30)',
    label_en: 'Annual Registration Fee (€30)',
    label_ru: 'Годовой взнос (€30)',
    description: 'Обязательный ежегодный сбор ассоциации',
  },
  [PaymentType.INSTALLMENT]: {
    id: 3,
    code: 'INSTALLMENT',
    label_it: 'Rata Corso',
    label_en: 'Installment',
    label_ru: 'Рассрочка',
    description: 'Очередной платёж по графику рассрочки',
  },
  [PaymentType.SINGLE_LESSON]: {
    id: 4,
    code: 'SINGLE_LESSON',
    label_it: 'Lezione Singola',
    label_en: 'Single Lesson',
    label_ru: 'Разовый урок',
    description: 'Оплата за индивидуальный или разовый урок',
  },
  [PaymentType.EXAM_FEE]: {
    id: 5,
    code: 'EXAM_FEE',
    label_it: 'Quota Esame Cambridge/CELI',
    label_en: 'Exam Fee',
    label_ru: 'Экзаменационный сбор',
    description: 'Взнос за сдачу международного экзамена',
  },
  [PaymentType.CERTIFICATE_FEE]: {
    id: 6,
    code: 'CERTIFICATE_FEE',
    label_it: 'Rilascio Certificato',
    label_en: 'Certificate Issuance',
    label_ru: 'Выдача сертификата',
    description: 'Оплата за оформление и выдачу сертификата',
  },
  [PaymentType.MATERIAL_TEXTBOOK]: {
    id: 7,
    code: 'MATERIAL_TEXTBOOK',
    label_it: 'Libro / Materiale Didattico',
    label_en: 'Textbook / Learning Material',
    label_ru: 'Учебные материалы',
    description: 'Оплата учебников и учебных пособий',
  },
  [PaymentType.OTHER]: {
    id: 8,
    code: 'OTHER',
    label_it: 'Altro',
    label_en: 'Other',
    label_ru: 'Прочее',
    description: 'Прочие административные платежи',
  },
};

export const PAYMENT_RECORD_STATUS_DICTIONARY: Record<PaymentRecordStatus, DictionaryEntry> = {
  [PaymentRecordStatus.PENDING]: {
    id: 1,
    code: 'PENDING',
    label_it: 'In attesa',
    label_en: 'Pending',
    label_ru: 'В обработке',
    description: 'Транзакция ожидает подтверждения или клиринга',
  },
  [PaymentRecordStatus.SUCCEEDED]: {
    id: 2,
    code: 'SUCCEEDED',
    label_it: 'Riuscito / Pagato',
    label_en: 'Succeeded',
    label_ru: 'Успешно',
    description: 'Платёж успешно совершён, средства зачислены',
  },
  [PaymentRecordStatus.FAILED]: {
    id: 3,
    code: 'FAILED',
    label_it: 'Fallito',
    label_en: 'Failed',
    label_ru: 'Ошибка',
    description: 'Транзакция отклонена банком или шлюзом',
  },
  [PaymentRecordStatus.REFUNDED]: {
    id: 4,
    code: 'REFUNDED',
    label_it: 'Rimborsato',
    label_en: 'Refunded',
    label_ru: 'Полный возврат',
    description: 'Произведён полный возврат средств',
  },
  [PaymentRecordStatus.PARTIALLY_REFUNDED]: {
    id: 5,
    code: 'PARTIALLY_REFUNDED',
    label_it: 'Parzialmente rimborsato',
    label_en: 'Partially Refunded',
    label_ru: 'Частичный возврат',
    description: 'Произведён частичный возврат средств',
  },
  [PaymentRecordStatus.CANCELLED]: {
    id: 6,
    code: 'CANCELLED',
    label_it: 'Annullato',
    label_en: 'Cancelled',
    label_ru: 'Отменён',
    description: 'Платёж отменён до момента списания',
  },
};

export const PAYMENT_PROVIDER_DICTIONARY: Record<PaymentProvider, DictionaryEntry> = {
  [PaymentProvider.STRIPE]: {
    id: 1,
    code: 'STRIPE',
    label_it: 'Stripe Gateway',
    label_en: 'Stripe Gateway',
    label_ru: 'Шлюз Stripe',
    description: 'Автоматический онлайн-эквайринг Stripe',
  },
  [PaymentProvider.MANUAL]: {
    id: 2,
    code: 'MANUAL',
    label_it: 'Cassa Reception',
    label_en: 'Manual Reception',
    label_ru: 'Касса школы (ручная)',
    description: 'Ручная проводка секретарём в кассе школы',
  },
  [PaymentProvider.POS_TERMINAL]: {
    id: 3,
    code: 'POS_TERMINAL',
    label_it: 'Terminale POS',
    label_en: 'POS Terminal',
    label_ru: 'Терминал POS',
    description: 'Физический банковский терминал в офисе',
  },
  [PaymentProvider.BANK]: {
    id: 4,
    code: 'BANK',
    label_it: 'Bonifico Diretto',
    label_en: 'Direct Bank Transfer',
    label_ru: 'Банковский перевод',
    description: 'Прямой перевод на расчётный счёт школы',
  },
};

export const PAYMENT_CURRENCY_STRING_TO_ID: Record<string, PaymentCurrency> = {
  eur: PaymentCurrency.EUR,
  usd: PaymentCurrency.USD,
  gbp: PaymentCurrency.GBP,
};

export const PAYMENT_CURRENCY_ID_TO_STRING: Record<PaymentCurrency, string> = {
  [PaymentCurrency.EUR]: 'EUR',
  [PaymentCurrency.USD]: 'USD',
  [PaymentCurrency.GBP]: 'GBP',
};

export const PAYMENT_TYPE_STRING_TO_ID: Record<string, PaymentType> = {
  payment: PaymentType.COURSE_PAYMENT,
  course_payment: PaymentType.COURSE_PAYMENT,
  registration_fee: PaymentType.REGISTRATION_FEE,
  installment: PaymentType.INSTALLMENT,
  single_lesson: PaymentType.SINGLE_LESSON,
  exam_fee: PaymentType.EXAM_FEE,
  certificate_fee: PaymentType.CERTIFICATE_FEE,
  textbook_material: PaymentType.MATERIAL_TEXTBOOK,
  material_textbook: PaymentType.MATERIAL_TEXTBOOK,
  other: PaymentType.OTHER,
};

export const PAYMENT_TYPE_ID_TO_STRING: Record<PaymentType, string> = {
  [PaymentType.COURSE_PAYMENT]: 'course_payment',
  [PaymentType.REGISTRATION_FEE]: 'registration_fee',
  [PaymentType.INSTALLMENT]: 'installment',
  [PaymentType.SINGLE_LESSON]: 'single_lesson',
  [PaymentType.EXAM_FEE]: 'exam_fee',
  [PaymentType.CERTIFICATE_FEE]: 'certificate_fee',
  [PaymentType.MATERIAL_TEXTBOOK]: 'textbook_material',
  [PaymentType.OTHER]: 'other',
};

export const PAYMENT_RECORD_STATUS_STRING_TO_ID: Record<string, PaymentRecordStatus> = {
  pending: PaymentRecordStatus.PENDING,
  succeeded: PaymentRecordStatus.SUCCEEDED,
  completed: PaymentRecordStatus.SUCCEEDED,
  paid: PaymentRecordStatus.SUCCEEDED,
  failed: PaymentRecordStatus.FAILED,
  refunded: PaymentRecordStatus.REFUNDED,
  partially_refunded: PaymentRecordStatus.PARTIALLY_REFUNDED,
  cancelled: PaymentRecordStatus.CANCELLED,
};

export const PAYMENT_RECORD_STATUS_ID_TO_STRING: Record<PaymentRecordStatus, string> = {
  [PaymentRecordStatus.PENDING]: 'pending',
  [PaymentRecordStatus.SUCCEEDED]: 'succeeded',
  [PaymentRecordStatus.FAILED]: 'failed',
  [PaymentRecordStatus.REFUNDED]: 'refunded',
  [PaymentRecordStatus.PARTIALLY_REFUNDED]: 'partially_refunded',
  [PaymentRecordStatus.CANCELLED]: 'cancelled',
};

export const PAYMENT_PROVIDER_STRING_TO_ID: Record<string, PaymentProvider> = {
  stripe: PaymentProvider.STRIPE,
  manual: PaymentProvider.MANUAL,
  pos: PaymentProvider.POS_TERMINAL,
  manual_pos: PaymentProvider.POS_TERMINAL,
  pos_terminal: PaymentProvider.POS_TERMINAL,
  bank: PaymentProvider.BANK,
  direct_bank: PaymentProvider.BANK,
};

export const PAYMENT_PROVIDER_ID_TO_STRING: Record<PaymentProvider, string> = {
  [PaymentProvider.STRIPE]: 'stripe',
  [PaymentProvider.MANUAL]: 'manual',
  [PaymentProvider.POS_TERMINAL]: 'pos',
  [PaymentProvider.BANK]: 'bank',
};

export function parsePaymentCurrency(val: unknown): PaymentCurrency {
  if (typeof val === 'number' && val in PAYMENT_CURRENCY_DICTIONARY) {
    return val as PaymentCurrency;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = PAYMENT_CURRENCY_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in PAYMENT_CURRENCY_DICTIONARY) {
      return num as PaymentCurrency;
    }
  }
  return PaymentCurrency.EUR;
}

export function parsePaymentType(val: unknown): PaymentType {
  if (typeof val === 'number' && val in PAYMENT_TYPE_DICTIONARY) {
    return val as PaymentType;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = PAYMENT_TYPE_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in PAYMENT_TYPE_DICTIONARY) {
      return num as PaymentType;
    }
  }
  return PaymentType.COURSE_PAYMENT;
}

export function parsePaymentRecordStatus(val: unknown): PaymentRecordStatus {
  if (typeof val === 'number' && val in PAYMENT_RECORD_STATUS_DICTIONARY) {
    return val as PaymentRecordStatus;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = PAYMENT_RECORD_STATUS_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in PAYMENT_RECORD_STATUS_DICTIONARY) {
      return num as PaymentRecordStatus;
    }
  }
  return PaymentRecordStatus.SUCCEEDED;
}

export function parsePaymentProvider(val: unknown): PaymentProvider {
  if (typeof val === 'number' && val in PAYMENT_PROVIDER_DICTIONARY) {
    return val as PaymentProvider;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = PAYMENT_PROVIDER_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in PAYMENT_PROVIDER_DICTIONARY) {
      return num as PaymentProvider;
    }
  }
  return PaymentProvider.MANUAL;
}

// ---------------------------------------------------------------------------
// Dictionary Metadata & Mappings for Lessons
// ---------------------------------------------------------------------------

export const LESSON_STATUS_DICTIONARY: Record<LessonStatus, DictionaryEntry> = {
  [LessonStatus.SCHEDULED]: {
    id: 1,
    code: 'SCHEDULED',
    label_it: 'Programmata',
    label_en: 'Scheduled',
    label_ru: 'Запланировано',
    description: 'Урок запланирован в календаре, ещё не проведён',
  },
  [LessonStatus.COMPLETED]: {
    id: 2,
    code: 'COMPLETED',
    label_it: 'Completata',
    label_en: 'Completed',
    label_ru: 'Проведён',
    description: 'Урок состоялся, посещаемость отмечена',
  },
  [LessonStatus.CANCELLED]: {
    id: 3,
    code: 'CANCELLED',
    label_it: 'Annullata',
    label_en: 'Cancelled',
    label_ru: 'Отменён',
    description: 'Урок отменён (праздник, болезнь, форс-мажор)',
  },
  [LessonStatus.RESCHEDULED]: {
    id: 4,
    code: 'RESCHEDULED',
    label_it: 'Riprogrammata',
    label_en: 'Rescheduled',
    label_ru: 'Перенесён',
    description: 'Урок перенесён на другую дату/время',
  },
};

export const LESSON_ATTENDANCE_DICTIONARY: Record<LessonAttendance, DictionaryEntry> = {
  [LessonAttendance.PENDING]: {
    id: 1,
    code: 'PENDING',
    label_it: 'Da registrare',
    label_en: 'Pending',
    label_ru: 'Не отмечено',
    description: 'Присутствие ещё не отмечено (по умолчанию)',
  },
  [LessonAttendance.PRESENT]: {
    id: 2,
    code: 'PRESENT',
    label_it: 'Presente',
    label_en: 'Present',
    label_ru: 'Присутствовал',
    description: 'Студент присутствовал на уроке',
  },
  [LessonAttendance.ABSENT]: {
    id: 3,
    code: 'ABSENT',
    label_it: 'Assente',
    label_en: 'Absent',
    label_ru: 'Отсутствовал',
    description: 'Студент пропустил урок без уважительной причины',
  },
  [LessonAttendance.LATE]: {
    id: 4,
    code: 'LATE',
    label_it: 'In ritardo',
    label_en: 'Late',
    label_ru: 'Опоздал',
    description: 'Студент пришёл с опозданием',
  },
  [LessonAttendance.EXCUSED]: {
    id: 5,
    code: 'EXCUSED',
    label_it: 'Giustificato',
    label_en: 'Excused',
    label_ru: 'Уважительная причина',
    description: 'Пропуск по уважительной причине (болезнь, справка)',
  },
};

export const LESSON_LOCATION_TYPE_DICTIONARY: Record<LessonLocationType, DictionaryEntry> = {
  [LessonLocationType.IN_PERSON]: {
    id: 1,
    code: 'IN_PERSON',
    label_it: 'In presenza',
    label_en: 'In person',
    label_ru: 'Очно',
    description: 'Урок проводится очно в классе школы',
  },
  [LessonLocationType.ONLINE]: {
    id: 2,
    code: 'ONLINE',
    label_it: 'Online',
    label_en: 'Online',
    label_ru: 'Онлайн',
    description: 'Урок проводится дистанционно (Google Meet и т.п.)',
  },
  [LessonLocationType.HYBRID]: {
    id: 3,
    code: 'HYBRID',
    label_it: 'Ibrido',
    label_en: 'Hybrid',
    label_ru: 'Смешанный',
    description: 'Часть студентов очно, часть подключается онлайн',
  },
};

export const LESSON_STATUS_STRING_TO_ID: Record<string, LessonStatus> = {
  scheduled:   LessonStatus.SCHEDULED,
  completed:   LessonStatus.COMPLETED,
  cancelled:   LessonStatus.CANCELLED,
  rescheduled: LessonStatus.RESCHEDULED,
};

export const LESSON_STATUS_ID_TO_STRING: Record<LessonStatus, string> = {
  [LessonStatus.SCHEDULED]:   'scheduled',
  [LessonStatus.COMPLETED]:   'completed',
  [LessonStatus.CANCELLED]:   'cancelled',
  [LessonStatus.RESCHEDULED]: 'rescheduled',
};

export const LESSON_ATTENDANCE_STRING_TO_ID: Record<string, LessonAttendance> = {
  pending: LessonAttendance.PENDING,
  present: LessonAttendance.PRESENT,
  absent:  LessonAttendance.ABSENT,
  late:    LessonAttendance.LATE,
  excused: LessonAttendance.EXCUSED,
};

export const LESSON_ATTENDANCE_ID_TO_STRING: Record<LessonAttendance, string> = {
  [LessonAttendance.PENDING]: 'pending',
  [LessonAttendance.PRESENT]: 'present',
  [LessonAttendance.ABSENT]:  'absent',
  [LessonAttendance.LATE]:    'late',
  [LessonAttendance.EXCUSED]: 'excused',
};

export const LESSON_LOCATION_TYPE_STRING_TO_ID: Record<string, LessonLocationType> = {
  in_person: LessonLocationType.IN_PERSON,
  offline:   LessonLocationType.IN_PERSON,
  online:    LessonLocationType.ONLINE,
  hybrid:    LessonLocationType.HYBRID,
};

export const LESSON_LOCATION_TYPE_ID_TO_STRING: Record<LessonLocationType, string> = {
  [LessonLocationType.IN_PERSON]: 'in_person',
  [LessonLocationType.ONLINE]:    'online',
  [LessonLocationType.HYBRID]:    'hybrid',
};

export function parseLessonStatus(val: unknown): LessonStatus {
  if (typeof val === 'number' && val in LESSON_STATUS_DICTIONARY) {
    return val as LessonStatus;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = LESSON_STATUS_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in LESSON_STATUS_DICTIONARY) {
      return num as LessonStatus;
    }
  }
  return LessonStatus.SCHEDULED;
}

export function parseLessonAttendance(val: unknown): LessonAttendance {
  if (typeof val === 'number' && val in LESSON_ATTENDANCE_DICTIONARY) {
    return val as LessonAttendance;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = LESSON_ATTENDANCE_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in LESSON_ATTENDANCE_DICTIONARY) {
      return num as LessonAttendance;
    }
  }
  return LessonAttendance.PENDING;
}

export function parseLessonLocationType(val: unknown): LessonLocationType {
  if (typeof val === 'number' && val in LESSON_LOCATION_TYPE_DICTIONARY) {
    return val as LessonLocationType;
  }
  if (typeof val === 'string') {
    const normalized = val.trim().toLowerCase();
    const mapped = LESSON_LOCATION_TYPE_STRING_TO_ID[normalized];
    if (mapped) return mapped;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num in LESSON_LOCATION_TYPE_DICTIONARY) {
      return num as LessonLocationType;
    }
  }
  return LessonLocationType.IN_PERSON;
}

export interface PaymentRecord {
  id: string;
  booking_id?: string | null;
  student_id?: string | null;
  user_id?: string | null;
  schedule_id?: string | null;
  amount: number;
  currency: PaymentCurrency | number;
  payment_method: PaymentMethod | number;
  type: PaymentType | number;
  status: PaymentRecordStatus | number;
  provider: PaymentProvider | number;
  provider_transaction_id?: string | null;
  notes?: string | null;
  created_at: string;
  paid_at?: string | null;
  updated_at?: string | null;
}

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

export interface ReservationResponse {
  success: boolean;
  bookingId?: string;
  bookingIds?: string[];
  booking?: BookingRecord;
  bookings?: BookingRecord[];
  error?: string;
  details?: Record<string, string[]>;
}

export interface CheckoutSessionResponse {
  success: boolean;
  url?: string;
  bookingId?: string;
  bookingIds?: string[];
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

/**
 * Keys for application system settings (app_settings table)
 */
export const AppSettingKey = {
  STRIPE_ENABLED: 'stripe_enabled',
  SUBSCRIPTIONS_ENABLED: 'subscriptions_enabled',
} as const;
export type AppSettingKey = (typeof AppSettingKey)[keyof typeof AppSettingKey];

export interface AppSettingRecord<T = any> {
  key: string;
  value: T;
  description?: string | null;
  updated_at?: string | null;
}

export const APP_SETTINGS_DICTIONARY: Record<string, DictionaryEntry> = {
  [AppSettingKey.STRIPE_ENABLED]: {
    id: 1,
    code: AppSettingKey.STRIPE_ENABLED,
    label_it: 'Pagamenti online Stripe',
    label_en: 'Stripe Online Payments',
    label_ru: 'Онлайн-оплата картой через Stripe',
    description: 'Включение/отключение приема онлайн-платежей через Stripe на странице чекаута',
  },
  [AppSettingKey.SUBSCRIPTIONS_ENABLED]: {
    id: 2,
    code: AppSettingKey.SUBSCRIPTIONS_ENABLED,
    label_it: 'Abbonamenti mensili',
    label_en: 'Monthly Subscriptions',
    label_ru: 'Функционал ежемесячных подписок',
    description: 'Включение/отключение функционала ежемесячных подписок и абонементов на курсы на странице чекаута',
  },
};

// ---------------------------------------------------------------------------
// Numeric Enums for Annual Memberships (€30 Association Membership)
// ---------------------------------------------------------------------------

export const MembershipStatus = {
  ACTIVE: 1,  // Active and valid membership
  PENDING: 2, // Awaiting payment or confirmation
  EXPIRED: 3, // Membership term has ended
  REVOKED: 4, // Revoked / cancelled by admin
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const MEMBERSHIP_STATUS_DICTIONARY: Record<MembershipStatus, DictionaryEntry> = {
  [MembershipStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo',
    label_en: 'Active',
    label_ru: 'Активно',
    description: 'Членство в ассоциации активно и действительно на текущий учебный год',
  },
  [MembershipStatus.PENDING]: {
    id: 2,
    code: 'PENDING',
    label_it: 'In attesa',
    label_en: 'Pending',
    label_ru: 'В ожидании',
    description: 'Членство ожидает подтверждения или фактического поступления оплаты взноса',
  },
  [MembershipStatus.EXPIRED]: {
    id: 3,
    code: 'EXPIRED',
    label_it: 'Scaduto',
    label_en: 'Expired',
    label_ru: 'Истекло',
    description: 'Срок действия членской карты истек (завершился учебный год)',
  },
  [MembershipStatus.REVOKED]: {
    id: 4,
    code: 'REVOKED',
    label_it: 'Revocato',
    label_en: 'Revoked',
    label_ru: 'Отозвано',
    description: 'Членство аннулировано или отозвано администрацией школы',
  },
};

export function parseMembershipStatus(val: any): MembershipStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as MembershipStatus;
    return MembershipStatus.ACTIVE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'active' || s === 'attivo' || s === 'valid') return MembershipStatus.ACTIVE;
  if (s === '2' || s === 'pending' || s === 'in_attesa' || s === 'in attesa') return MembershipStatus.PENDING;
  if (s === '3' || s === 'expired' || s === 'scaduto') return MembershipStatus.EXPIRED;
  if (s === '4' || s === 'revoked' || s === 'cancelled' || s === 'revocato' || s === 'annullato') return MembershipStatus.REVOKED;
  return MembershipStatus.ACTIVE;
}

// ---------------------------------------------------------------------------
// Numeric Enums for Students (Student Registry)
// ---------------------------------------------------------------------------

export const StudentStatus = {
  ACTIVE: 1,    // Active student (Attivo)
  INACTIVE: 2,  // Inactive / Awaiting payment (Inattivo / In attesa)
  PAUSED: 3,    // On hold / Academic leave (In pausa)
  GRADUATED: 4, // Graduated / Completed (Diplomato / Concluso)
  ARCHIVED: 5,  // Archived (Archiviato)
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const STUDENT_STATUS_DICTIONARY: Record<StudentStatus, DictionaryEntry> = {
  [StudentStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo',
    label_en: 'Active',
    label_ru: 'Активен',
    description: 'Студент активно проходит обучение в школе',
  },
  [StudentStatus.INACTIVE]: {
    id: 2,
    code: 'INACTIVE',
    label_it: 'Inattivo',
    label_en: 'Inactive',
    label_ru: 'Неактивен',
    description: 'Обучение не начато или приостановлено до подтверждения оплаты',
  },
  [StudentStatus.PAUSED]: {
    id: 3,
    code: 'PAUSED',
    label_it: 'In pausa',
    label_en: 'Paused',
    label_ru: 'На паузе',
    description: 'Академический отпуск или временная заморозка занятий',
  },
  [StudentStatus.GRADUATED]: {
    id: 4,
    code: 'GRADUATED',
    label_it: 'Diplomato',
    label_en: 'Graduated',
    label_ru: 'Выпускник',
    description: 'Курс успешно завершен, сертификат выдан',
  },
  [StudentStatus.ARCHIVED]: {
    id: 5,
    code: 'ARCHIVED',
    label_it: 'Archiviato',
    label_en: 'Archived',
    label_ru: 'В архиве',
    description: 'Карточка студента перенесена в архив',
  },
};

export const LanguageLevel = {
  A1: 1, // A1 — Principiante (Beginner)
  A2: 2, // A2 — Elementare (Elementary)
  B1: 3, // B1 — Intermedio (Intermediate)
  B2: 4, // B2 — Intermedio Superiore (Upper Intermediate)
  C1: 5, // C1 — Avanzato (Advanced)
  C2: 6, // C2 — Padronanza (Proficiency / Mastery)
} as const;
export type LanguageLevel = (typeof LanguageLevel)[keyof typeof LanguageLevel];

export const LANGUAGE_LEVEL_DICTIONARY: Record<LanguageLevel, DictionaryEntry> = {
  [LanguageLevel.A1]: {
    id: 1,
    code: 'A1',
    label_it: 'A1 — Principiante',
    label_en: 'A1 — Beginner',
    label_ru: 'A1 — Начальный',
    description: 'CEFR A1: Базовое понимание повседневных фраз и простых выражений',
  },
  [LanguageLevel.A2]: {
    id: 2,
    code: 'A2',
    label_it: 'A2 — Elementare',
    label_en: 'A2 — Elementary',
    label_ru: 'A2 — Элементарный',
    description: 'CEFR A2: Понимание предложений по основным сферам жизни (семья, покупки, работа)',
  },
  [LanguageLevel.B1]: {
    id: 3,
    code: 'B1',
    label_it: 'B1 — Intermedio',
    label_en: 'B1 — Intermediate',
    label_ru: 'B1 — Средний',
    description: 'CEFR B1: Понимание основных положений четкой речи, способность поддержать беседу',
  },
  [LanguageLevel.B2]: {
    id: 4,
    code: 'B2',
    label_it: 'B2 — Intermedio Superiore',
    label_en: 'B2 — Upper Intermediate',
    label_ru: 'B2 — Выше среднего',
    description: 'CEFR B2: Понимание сложных текстов, беглая и спонтанная речь с носителями',
  },
  [LanguageLevel.C1]: {
    id: 5,
    code: 'C1',
    label_it: 'C1 — Avanzato',
    label_en: 'C1 — Advanced',
    label_ru: 'C1 — Продвинутый',
    description: 'CEFR C1: Свободное выражение мыслей без затруднений в подборе слов',
  },
  [LanguageLevel.C2]: {
    id: 6,
    code: 'C2',
    label_it: 'C2 — Padronanza',
    label_en: 'C2 — Proficiency',
    label_ru: 'C2 — Профессиональный',
    description: 'CEFR C2: Свободное владение языком на уровне образованного носителя',
  },
};

export function parseStudentStatus(val: any): StudentStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 5) return val as StudentStatus;
    return StudentStatus.ACTIVE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'active' || s === 'attivo') return StudentStatus.ACTIVE;
  if (s === '2' || s === 'inactive' || s === 'inattivo' || s === 'pending' || s === 'in_attesa') return StudentStatus.INACTIVE;
  if (s === '3' || s === 'paused' || s === 'in_pausa' || s === 'in pausa') return StudentStatus.PAUSED;
  if (s === '4' || s === 'graduated' || s === 'diplomato' || s === 'concluso') return StudentStatus.GRADUATED;
  if (s === '5' || s === 'archived' || s === 'archiviato') return StudentStatus.ARCHIVED;
  return StudentStatus.ACTIVE;
}

export function parseLanguageLevel(val: any): LanguageLevel {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 6) return val as LanguageLevel;
    return LanguageLevel.A1;
  }
  const s = String(val || '').toUpperCase().trim();
  if (s === '1' || s === 'A1') return LanguageLevel.A1;
  if (s === '2' || s === 'A2') return LanguageLevel.A2;
  if (s === '3' || s === 'B1') return LanguageLevel.B1;
  if (s === '4' || s === 'B2') return LanguageLevel.B2;
  if (s === '5' || s === 'C1') return LanguageLevel.C1;
  if (s === '6' || s === 'C2') return LanguageLevel.C2;
  return LanguageLevel.A1;
}

// ---------------------------------------------------------------------------
// Numeric Enums for Courses (Course Catalog & Curricula)
// ---------------------------------------------------------------------------

export const CourseStatus = {
  ACTIVE: 1,   // Active / Published (Attivo / Pubblicato)
  DRAFT: 2,    // Draft / Planned (Bozza / In programmazione)
  ARCHIVED: 3, // Archived / Concluded (Archiviato / Concluso)
} as const;
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const COURSE_STATUS_DICTIONARY: Record<CourseStatus, DictionaryEntry> = {
  [CourseStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo / Pubblicato',
    label_en: 'Active / Published',
    label_ru: 'Активен / Опубликован',
    description: 'Курс доступен для публичного просмотра, записи и онлайн-оплаты',
  },
  [CourseStatus.DRAFT]: {
    id: 2,
    code: 'DRAFT',
    label_it: 'Bozza / In programmazione',
    label_en: 'Draft / Planned',
    label_ru: 'Черновик / В планировании',
    description: 'Курс находится в разработке или планировании, скрыт из каталога',
  },
  [CourseStatus.ARCHIVED]: {
    id: 3,
    code: 'ARCHIVED',
    label_it: 'Archiviato / Concluso',
    label_en: 'Archived / Concluded',
    label_ru: 'В архиве / Завершен',
    description: 'Курс окончен, архивный или снят с проведения',
  },
};

export const CourseScheduleType = {
  FIXED: 1,    // Fixed schedule with set days and times (Fisso)
  FLEXIBLE: 2, // Flexible schedule / To be agreed (Flessibile / Da concordare)
} as const;
export type CourseScheduleType = (typeof CourseScheduleType)[keyof typeof CourseScheduleType];

export const COURSE_SCHEDULE_TYPE_DICTIONARY: Record<CourseScheduleType, DictionaryEntry> = {
  [CourseScheduleType.FIXED]: {
    id: 1,
    code: 'FIXED',
    label_it: 'Orario Fisso',
    label_en: 'Fixed Schedule',
    label_ru: 'Фиксированное расписание',
    description: 'Фиксированные дни недели и время занятий (например, Пн/Ср 18:00)',
  },
  [CourseScheduleType.FLEXIBLE]: {
    id: 2,
    code: 'FLEXIBLE',
    label_it: 'Flessibile (Da concordare)',
    label_en: 'Flexible (To be agreed)',
    label_ru: 'Гибкий график (По согласованию)',
    description: 'Индивидуальный график, время уроков согласуется со студентом',
  },
};

export const CourseFormat = {
  GROUP: 1,         // Group lessons (Di Gruppo)
  INDIVIDUAL: 2,    // Individual / private lessons (Individuale / Privato)
  ONLINE: 3,        // Online course
  CERTIFICATION: 4, // Certification / Exam prep (Certificazione)
} as const;
export type CourseFormat = (typeof CourseFormat)[keyof typeof CourseFormat];

export const COURSE_FORMAT_DICTIONARY: Record<CourseFormat, DictionaryEntry> = {
  [CourseFormat.GROUP]: {
    id: 1,
    code: 'GROUP',
    label_it: 'Di Gruppo',
    label_en: 'Group Course',
    label_ru: 'Групповой курс',
    description: 'Занятия в мини-группах от 3 до 8 человек в аудитории',
  },
  [CourseFormat.INDIVIDUAL]: {
    id: 2,
    code: 'INDIVIDUAL',
    label_it: 'Individuale / Privato',
    label_en: 'Individual / Private',
    label_ru: 'Индивидуальный',
    description: 'Персональные уроки один на один с преподавателем',
  },
  [CourseFormat.ONLINE]: {
    id: 3,
    code: 'ONLINE',
    label_it: 'Online',
    label_en: 'Online Course',
    label_ru: 'Онлайн курс',
    description: 'Дистанционное обучение через видеосвязь (Google Meet / Zoom)',
  },
  [CourseFormat.CERTIFICATION]: {
    id: 4,
    code: 'CERTIFICATION',
    label_it: 'Certificazione / Esame',
    label_en: 'Certification / Exam',
    label_ru: 'Сертификация / Экзамен',
    description: 'Подготовка к сдаче и экзаменационная сессия (Certipass, Cambridge, CELI)',
  },
};

export const CourseTeacherRole = {
  PRIMARY: 1,    // Main / Lead Teacher (Docente Principale)
  ASSISTANT: 2,  // Co-teacher / Assistant (Docente di Supporto / Assistente)
  SUBSTITUTE: 3, // Substitute (Docente Sostituto)
} as const;
export type CourseTeacherRole = (typeof CourseTeacherRole)[keyof typeof CourseTeacherRole];

export const COURSE_TEACHER_ROLE_DICTIONARY: Record<CourseTeacherRole, DictionaryEntry> = {
  [CourseTeacherRole.PRIMARY]: {
    id: 1,
    code: 'PRIMARY',
    label_it: 'Docente Principale',
    label_en: 'Primary / Lead Teacher',
    label_ru: 'Основной преподаватель',
    description: 'Ведущий преподаватель курса',
  },
  [CourseTeacherRole.ASSISTANT]: {
    id: 2,
    code: 'ASSISTANT',
    label_it: 'Docente di Supporto',
    label_en: 'Assistant / Co-teacher',
    label_ru: 'Второй преподаватель / Ассистент',
    description: 'Второй преподаватель или ассистент курса',
  },
  [CourseTeacherRole.SUBSTITUTE]: {
    id: 3,
    code: 'SUBSTITUTE',
    label_it: 'Sostituto',
    label_en: 'Substitute Teacher',
    label_ru: 'Замещающий преподаватель',
    description: 'Преподаватель на замену',
  },
};

export function parseCourseTeacherRole(val: any): CourseTeacherRole {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 3) return val as CourseTeacherRole;
    return CourseTeacherRole.PRIMARY;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'primary' || s === 'lead' || s === 'principale' || s === 'main') return CourseTeacherRole.PRIMARY;
  if (s === '2' || s === 'assistant' || s === 'supporto' || s === 'co-teacher' || s === 'coteacher') return CourseTeacherRole.ASSISTANT;
  if (s === '3' || s === 'substitute' || s === 'sostituto' || s === 'replacement') return CourseTeacherRole.SUBSTITUTE;
  return CourseTeacherRole.PRIMARY;
}

export function parseCourseStatus(val: any): CourseStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 3) return val as CourseStatus;
    return CourseStatus.ACTIVE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'active' || s === 'attivo' || s === 'published') return CourseStatus.ACTIVE;
  if (s === '2' || s === 'draft' || s === 'bozza' || s === 'in-programmazione' || s === 'in_programmazione' || s === 'scheduled' || s === 'planned') return CourseStatus.DRAFT;
  if (s === '3' || s === 'archived' || s === 'archiviato' || s === 'concluded' || s === 'completed' || s === 'concluso') return CourseStatus.ARCHIVED;
  return CourseStatus.ACTIVE;
}

export function parseCourseScheduleType(val: any): CourseScheduleType {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 2) return val as CourseScheduleType;
    return CourseScheduleType.FIXED;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'fixed' || s === 'fisso') return CourseScheduleType.FIXED;
  if (s === '2' || s === 'flexible' || s === 'flessibile' || s === 'da concordare' || s === 'da_concordare') return CourseScheduleType.FLEXIBLE;
  return CourseScheduleType.FIXED;
}

export const CourseCategory = {
  LANGUAGES: 1,  // Corsi di Lingua (Foreign languages)
  ACADEMIC: 2,   // Recupero Scolastico (School tutoring)
  CERTIPASS: 3,  // Certificazioni EIPASS / Certipass (IT certifications)
  OTHER: 4,      // Altro / Generale (Other directions)
} as const;
export type CourseCategory = (typeof CourseCategory)[keyof typeof CourseCategory];

export const COURSE_CATEGORY_DICTIONARY: Record<CourseCategory, DictionaryEntry> = {
  [CourseCategory.LANGUAGES]: {
    id: 1,
    code: 'LANGUAGES',
    label_it: 'Corsi di Lingua',
    label_en: 'Language Courses',
    label_ru: 'Языковые курсы',
    description: 'Английский, итальянский, немецкий, французский, испанский и др.',
  },
  [CourseCategory.ACADEMIC]: {
    id: 2,
    code: 'ACADEMIC',
    label_it: 'Recupero Scolastico',
    label_en: 'School Tutoring',
    label_ru: 'Школьное репетиторство',
    description: 'Помощь по школьным предметам, подготовка к экзаменам и аттестациям',
  },
  [CourseCategory.CERTIPASS]: {
    id: 3,
    code: 'CERTIPASS',
    label_it: 'Certificazioni EIPASS',
    label_en: 'EIPASS Certifications',
    label_ru: 'IT-сертификации EIPASS',
    description: 'Международные цифровые сертификации EIPASS / Certipass для школы и конкурсов',
  },
  [CourseCategory.OTHER]: {
    id: 4,
    code: 'OTHER',
    label_it: 'Altro / Generale',
    label_en: 'Other / General',
    label_ru: 'Общие курсы / Другое',
    description: 'Специальные и дополнительные направления обучения',
  },
};

export function parseCourseCategory(val: any): CourseCategory {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as CourseCategory;
    return CourseCategory.LANGUAGES;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'languages' || s === 'language' || s === 'lingua' || s === 'lingue') return CourseCategory.LANGUAGES;
  if (s === '2' || s === 'academic' || s === 'recupero' || s === 'scuola') return CourseCategory.ACADEMIC;
  if (s === '3' || s === 'certipass' || s === 'eipass' || s === 'certificazione') return CourseCategory.CERTIPASS;
  if (s === '4' || s === 'other' || s === 'general' || s === 'generale') return CourseCategory.OTHER;
  return CourseCategory.LANGUAGES;
}

export function parseCourseFormat(val: any): CourseFormat {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as CourseFormat;
    return CourseFormat.GROUP;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'group' || s === 'gruppo' || s === 'di gruppo' || s === 'di_gruppo' || s === 'in sede') return CourseFormat.GROUP;
  if (s === '2' || s === 'individual' || s === 'individuale' || s === 'private' || s === 'privato') return CourseFormat.INDIVIDUAL;
  if (s === '3' || s === 'online') return CourseFormat.ONLINE;
  if (s === '4' || s === 'certification' || s === 'certificazione' || s === 'esame' || s === 'certipass') return CourseFormat.CERTIFICATION;
  return CourseFormat.GROUP;
}

// ---------------------------------------------------------------------------
// Weekdays Enums & Dictionaries
// ---------------------------------------------------------------------------

export const Weekday = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;
export type Weekday = (typeof Weekday)[keyof typeof Weekday];

export const WEEKDAY_DICTIONARY: Record<number, DictionaryEntry> = {
  [Weekday.SUNDAY]: { id: 0, code: 'SUN', label_it: 'Domenica', label_en: 'Sunday', label_ru: 'Воскресенье', description: 'Domenica' },
  [Weekday.MONDAY]: { id: 1, code: 'MON', label_it: 'Lunedì', label_en: 'Monday', label_ru: 'Понедельник', description: 'Lunedì' },
  [Weekday.TUESDAY]: { id: 2, code: 'TUE', label_it: 'Martedì', label_en: 'Tuesday', label_ru: 'Вторник', description: 'Martedì' },
  [Weekday.WEDNESDAY]: { id: 3, code: 'WED', label_it: 'Mercoledì', label_en: 'Wednesday', label_ru: 'Среда', description: 'Mercoledì' },
  [Weekday.THURSDAY]: { id: 4, code: 'THU', label_it: 'Giovedì', label_en: 'Thursday', label_ru: 'Четверг', description: 'Giovedì' },
  [Weekday.FRIDAY]: { id: 5, code: 'FRI', label_it: 'Venerdì', label_en: 'Friday', label_ru: 'Пятница', description: 'Venerdì' },
  [Weekday.SATURDAY]: { id: 6, code: 'SAT', label_it: 'Sabato', label_en: 'Saturday', label_ru: 'Суббота', description: 'Sabato' },
};

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

export const UserRole = {
  STUDENT: 1,
  TEACHER: 2,
  ADMIN: 3,
  PARENT: 4,
  SECRETARY: 5,
  SUPERADMIN: 6,
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLE_DICTIONARY: Record<UserRole, DictionaryEntry> = {
  [UserRole.STUDENT]: {
    id: 1,
    code: 'STUDENT',
    label_it: 'Studente',
    label_en: 'Student',
    label_ru: 'Студент',
    description: 'Ученик школы, доступ к личному кабинету и расписанию',
  },
  [UserRole.TEACHER]: {
    id: 2,
    code: 'TEACHER',
    label_it: 'Docente / Insegnante',
    label_en: 'Teacher / Instructor',
    label_ru: 'Преподаватель',
    description: 'Учитель языковой школы, доступ к журналу занятий и группам',
  },
  [UserRole.ADMIN]: {
    id: 3,
    code: 'ADMIN',
    label_it: 'Amministratore',
    label_en: 'Administrator',
    label_ru: 'Администратор',
    description: 'Полный доступ к управлению школой, CRM, кассе и студентам',
  },
  [UserRole.PARENT]: {
    id: 4,
    code: 'PARENT',
    label_it: 'Genitore / Tutore',
    label_en: 'Parent / Guardian',
    label_ru: 'Родитель / Опекун',
    description: 'Законный представитель несовершеннолетнего ученика',
  },
  [UserRole.SECRETARY]: {
    id: 5,
    code: 'SECRETARY',
    label_it: 'Segreteria',
    label_en: 'Secretary',
    label_ru: 'Секретариат',
    description: 'Сотрудник секретариата школы, управление расписанием и клиентами',
  },
  [UserRole.SUPERADMIN]: {
    id: 6,
    code: 'SUPERADMIN',
    label_it: 'Super Admin',
    label_en: 'Super Admin',
    label_ru: 'Главный администратор',
    description: 'Полный технический и финансовый доступ ко всей платформе',
  },
};

export function parseUserRole(val: any): UserRole {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 6) return val as UserRole;
    return UserRole.STUDENT;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'student' || s === 'studente' || s === 'allievo' || s === 'user') return UserRole.STUDENT;
  if (s === '2' || s === 'teacher' || s === 'docente' || s === 'insegnante') return UserRole.TEACHER;
  if (s === '3' || s === 'admin' || s === 'administrator' || s === 'amministratore') return UserRole.ADMIN;
  if (s === '4' || s === 'parent' || s === 'genitore' || s === 'tutore') return UserRole.PARENT;
  if (s === '5' || s === 'secretary' || s === 'segreteria') return UserRole.SECRETARY;
  if (s === '6' || s === 'superadmin') return UserRole.SUPERADMIN;
  return UserRole.STUDENT;
}

export const ItemType = {
  COURSE: 1,
  SINGLE_LESSON: 2,
  PACKAGE: 3,
  CERTIFICATION: 4,
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

export const NotificationType = {
  BOOKING_CONFIRMATION: 1,
  PAYMENT_RECEIPT: 2,
  PAYMENT_REMINDER: 3,
  MEMBERSHIP_CARD: 4,
  CONTACT_FORM: 5,
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

export const CourseDetailTab = {
  INFO: 1,
  INCLUDED: 2,
} as const;
export type CourseDetailTab = (typeof CourseDetailTab)[keyof typeof CourseDetailTab];

// ---------------------------------------------------------------------------
// Error Codes (System Error Enums)
// ---------------------------------------------------------------------------

export const ErrorCode = {
  // Validation (400xx / 422xx)
  VALIDATION_ERROR: 40001,
  INVALID_TAX_CODE: 42201,
  INVALID_PHONE: 42202,
  INVALID_EMAIL: 42203,
  INVALID_BIRTH_DATE: 42204,
  INVALID_SDI_OR_PEC: 42205,

  // Auth & Permissions (401xx / 403xx)
  UNAUTHORIZED: 40101,
  FORBIDDEN: 40301,
  TOKEN_EXPIRED: 40102,

  // Resource & Availability (404xx / 409xx)
  NOT_FOUND: 40401,
  COURSE_NOT_FOUND: 40402,
  STUDENT_NOT_FOUND: 40403,
  SLOT_UNAVAILABLE: 40901,
  COURSE_FULL: 40902,
  DUPLICATE_ENTRY: 40903,

  // Payment & Memberships (402xx)
  PAYMENT_REQUIRED: 40201,
  PAYMENT_FAILED: 40202,
  STRIPE_ERROR: 40203,
  FEE_NOT_PAID: 40204,

  // Server (500xx / 503xx)
  INTERNAL_SERVER_ERROR: 50001,
  SERVICE_UNAVAILABLE: 50301,
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ERROR_CODE_DICTIONARY: Record<ErrorCode, DictionaryEntry> = {
  [ErrorCode.VALIDATION_ERROR]: {
    id: 40001,
    code: 'VALIDATION_ERROR',
    label_it: 'Errore di validazione',
    label_en: 'Validation error',
    label_ru: 'Ошибка валидации полей запроса',
    description: 'Переданные в запросе данные не соответствуют схеме DTO / Zod',
  },
  [ErrorCode.INVALID_TAX_CODE]: {
    id: 42201,
    code: 'INVALID_TAX_CODE',
    label_it: 'Codice Fiscale non valido',
    label_en: 'Invalid Tax Code',
    label_ru: 'Некорректный налоговый код (Codice Fiscale)',
    description: 'Формат Codice Fiscale или Partita IVA не прошел проверку регулярного выражения',
  },
  [ErrorCode.INVALID_PHONE]: {
    id: 42202,
    code: 'INVALID_PHONE',
    label_it: 'Numero di telefono non valido',
    label_en: 'Invalid phone number',
    label_ru: 'Некорректный номер телефона',
    description: 'Номер телефона не соответствует формату E.164 или итальянскому стандарту',
  },
  [ErrorCode.INVALID_EMAIL]: {
    id: 42203,
    code: 'INVALID_EMAIL',
    label_it: 'Email non valida',
    label_en: 'Invalid email address',
    label_ru: 'Некорректный адрес электронной почты',
    description: 'Синтаксис почтового адреса не прошел валидацию',
  },
  [ErrorCode.INVALID_BIRTH_DATE]: {
    id: 42204,
    code: 'INVALID_BIRTH_DATE',
    label_it: 'Data di nascita non valida',
    label_en: 'Invalid birth date',
    label_ru: 'Некорректная дата рождения',
    description: 'Дата рождения должна быть в прошлом и не старше 100 лет',
  },
  [ErrorCode.INVALID_SDI_OR_PEC]: {
    id: 42205,
    code: 'INVALID_SDI_OR_PEC',
    label_it: 'Codice SDI o PEC mancante',
    label_en: 'Missing SDI code or PEC email',
    label_ru: 'Отсутствует код SDI или PEC для фактуры',
    description: 'Для выставления электронной фактуры юрлицу необходим 7-значный код SDI или PEC email',
  },
  [ErrorCode.UNAUTHORIZED]: {
    id: 40101,
    code: 'UNAUTHORIZED',
    label_it: 'Non autorizzato',
    label_en: 'Unauthorized',
    label_ru: 'Требуется аутентификация',
    description: 'JWT токен отсутствует или является недействительным',
  },
  [ErrorCode.FORBIDDEN]: {
    id: 40301,
    code: 'FORBIDDEN',
    label_it: 'Accesso negato',
    label_en: 'Forbidden',
    label_ru: 'Доступ запрещен',
    description: 'У пользователя недостаточно прав для выполнения операции (RBAC)',
  },
  [ErrorCode.TOKEN_EXPIRED]: {
    id: 40102,
    code: 'TOKEN_EXPIRED',
    label_it: 'Sessione scaduta',
    label_en: 'Token expired',
    label_ru: 'Срок действия сессии истек',
    description: 'Необходимо обновить токен доступа или войти повторно',
  },
  [ErrorCode.NOT_FOUND]: {
    id: 40401,
    code: 'NOT_FOUND',
    label_it: 'Risorsa non trovata',
    label_en: 'Resource not found',
    label_ru: 'Запрашиваемый ресурс не найден',
    description: 'Сущность с указанным идентификатором отсутствует в базе данных',
  },
  [ErrorCode.COURSE_NOT_FOUND]: {
    id: 40402,
    code: 'COURSE_NOT_FOUND',
    label_it: 'Corso non trovato',
    label_en: 'Course not found',
    label_ru: 'Курс не найден',
    description: 'Курс с указанным ID или slug не существует или неактивен',
  },
  [ErrorCode.STUDENT_NOT_FOUND]: {
    id: 40403,
    code: 'STUDENT_NOT_FOUND',
    label_it: 'Studente non trovato',
    label_en: 'Student not found',
    label_ru: 'Студент не найден',
    description: 'Профиль студента не найден по указанным критериям поиска',
  },
  [ErrorCode.SLOT_UNAVAILABLE]: {
    id: 40901,
    code: 'SLOT_UNAVAILABLE',
    label_it: 'Orario non disponibile',
    label_en: 'Slot unavailable',
    label_ru: 'Выбранный слот расписания недоступен',
    description: 'Преподаватель или аудитория уже заняты на выбранное время',
  },
  [ErrorCode.COURSE_FULL]: {
    id: 40902,
    code: 'COURSE_FULL',
    label_it: 'Corso al completo',
    label_en: 'Course full',
    label_ru: 'Группа курса полностью укомплектована',
    description: 'Достигнут максимальный лимит студентов в группе',
  },
  [ErrorCode.DUPLICATE_ENTRY]: {
    id: 40903,
    code: 'DUPLICATE_ENTRY',
    label_it: 'Elemento duplicato',
    label_en: 'Duplicate entry',
    label_ru: 'Дубликат записи',
    description: 'Запись с такими уникальными данными (email, tax_code) уже существует',
  },
  [ErrorCode.PAYMENT_REQUIRED]: {
    id: 40201,
    code: 'PAYMENT_REQUIRED',
    label_it: 'Pagamento richiesto',
    label_en: 'Payment required',
    label_ru: 'Требуется оплата',
    description: 'Для завершения действия требуется подтверждение финансовой транзакции',
  },
  [ErrorCode.PAYMENT_FAILED]: {
    id: 40202,
    code: 'PAYMENT_FAILED',
    label_it: 'Pagamento non riuscito',
    label_en: 'Payment failed',
    label_ru: 'Платеж отклонен',
    description: 'Транзакция была отклонена банком или платежным шлюзом',
  },
  [ErrorCode.STRIPE_ERROR]: {
    id: 40203,
    code: 'STRIPE_ERROR',
    label_it: 'Errore Stripe',
    label_en: 'Stripe gateway error',
    label_ru: 'Ошибка шлюза Stripe',
    description: 'Сбой при взаимодействии со Stripe Checkout или API подписок',
  },
  [ErrorCode.FEE_NOT_PAID]: {
    id: 40204,
    code: 'FEE_NOT_PAID',
    label_it: 'Quota associativa non saldata',
    label_en: 'Annual fee unpaid',
    label_ru: 'Ежегодный взнос €30 не оплачен',
    description: 'У студента отсутствует действующий ежегодный членский взнос на текущий учебный год',
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    id: 50001,
    code: 'INTERNAL_SERVER_ERROR',
    label_it: 'Errore interno del server',
    label_en: 'Internal server error',
    label_ru: 'Внутренняя ошибка сервера',
    description: 'Непредвиденное исключение при обработке запроса на стороне сервера',
  },
  [ErrorCode.SERVICE_UNAVAILABLE]: {
    id: 50301,
    code: 'SERVICE_UNAVAILABLE',
    label_it: 'Servizio non disponibile',
    label_en: 'Service unavailable',
    label_ru: 'Сервис временно недоступен',
    description: 'Внешний сервис (Stripe, Resend, Supabase) временно недоступен',
  },
};

// ---------------------------------------------------------------------------
// Numeric Enums — Scheduling & Discounts & Certifications & Contact
// ---------------------------------------------------------------------------

export const DayOfWeek = {
  MONDAY:    1, // Monday / Lunedì
  TUESDAY:   2, // Tuesday / Martedì
  WEDNESDAY: 3, // Wednesday / Mercoledì
  THURSDAY:  4, // Thursday / Giovedì
  FRIDAY:    5, // Friday / Venerdì
  SATURDAY:  6, // Saturday / Sabato
  SUNDAY:    7, // Sunday / Domenica
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

export const DAY_OF_WEEK_DICTIONARY: Record<DayOfWeek, DictionaryEntry> = {
  [DayOfWeek.MONDAY]: {
    id: 1,
    code: 'MONDAY',
    label_it: 'Lunedì',
    label_en: 'Monday',
    label_ru: 'Понедельник',
    description: 'Первый рабочий день недели (ISO 8601)',
  },
  [DayOfWeek.TUESDAY]: {
    id: 2,
    code: 'TUESDAY',
    label_it: 'Martedì',
    label_en: 'Tuesday',
    label_ru: 'Вторник',
    description: 'Второй день недели',
  },
  [DayOfWeek.WEDNESDAY]: {
    id: 3,
    code: 'WEDNESDAY',
    label_it: 'Mercoledì',
    label_en: 'Wednesday',
    label_ru: 'Среда',
    description: 'Третий день недели',
  },
  [DayOfWeek.THURSDAY]: {
    id: 4,
    code: 'THURSDAY',
    label_it: 'Giovedì',
    label_en: 'Thursday',
    label_ru: 'Четверг',
    description: 'Четвёртый день недели',
  },
  [DayOfWeek.FRIDAY]: {
    id: 5,
    code: 'FRIDAY',
    label_it: 'Venerdì',
    label_en: 'Friday',
    label_ru: 'Пятница',
    description: 'Пятый рабочий день недели',
  },
  [DayOfWeek.SATURDAY]: {
    id: 6,
    code: 'SATURDAY',
    label_it: 'Sabato',
    label_en: 'Saturday',
    label_ru: 'Суббота',
    description: 'Шестой день недели, обычно выходной',
  },
  [DayOfWeek.SUNDAY]: {
    id: 7,
    code: 'SUNDAY',
    label_it: 'Domenica',
    label_en: 'Sunday',
    label_ru: 'Воскресенье',
    description: 'Последний день недели, выходной',
  },
};

export const DAY_OF_WEEK_STRING_TO_ID: Record<string, DayOfWeek> = {
  monday:    DayOfWeek.MONDAY,
  lunedi:    DayOfWeek.MONDAY,
  tuesday:   DayOfWeek.TUESDAY,
  martedi:   DayOfWeek.TUESDAY,
  wednesday: DayOfWeek.WEDNESDAY,
  mercoledi: DayOfWeek.WEDNESDAY,
  thursday:  DayOfWeek.THURSDAY,
  giovedi:   DayOfWeek.THURSDAY,
  friday:    DayOfWeek.FRIDAY,
  venerdi:   DayOfWeek.FRIDAY,
  saturday:  DayOfWeek.SATURDAY,
  sabato:    DayOfWeek.SATURDAY,
  sunday:    DayOfWeek.SUNDAY,
  domenica:  DayOfWeek.SUNDAY,
};

export const DAY_OF_WEEK_ID_TO_STRING: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]:    'monday',
  [DayOfWeek.TUESDAY]:   'tuesday',
  [DayOfWeek.WEDNESDAY]: 'wednesday',
  [DayOfWeek.THURSDAY]:  'thursday',
  [DayOfWeek.FRIDAY]:    'friday',
  [DayOfWeek.SATURDAY]:  'saturday',
  [DayOfWeek.SUNDAY]:    'sunday',
};

// ---------------------------------------------------------------------------

export const DiscountType = {
  PERCENTAGE:       1, // Percentage discount off the total price
  FIXED_AMOUNT:     2, // Fixed euro amount deducted
  SIBLING_DISCOUNT: 3, // Discount for siblings enrolled simultaneously
  EARLY_BIRD:       4, // Early enrolment discount
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const DISCOUNT_TYPE_DICTIONARY: Record<DiscountType, DictionaryEntry> = {
  [DiscountType.PERCENTAGE]: {
    id: 1,
    code: 'PERCENTAGE',
    label_it: 'Sconto Percentuale',
    label_en: 'Percentage Discount',
    label_ru: 'Скидка в процентах',
    description: 'Скидка в % от итоговой стоимости курса',
  },
  [DiscountType.FIXED_AMOUNT]: {
    id: 2,
    code: 'FIXED_AMOUNT',
    label_it: 'Sconto Fisso (€)',
    label_en: 'Fixed Amount Discount',
    label_ru: 'Фиксированная скидка (€)',
    description: 'Скидка на фиксированную сумму в евро',
  },
  [DiscountType.SIBLING_DISCOUNT]: {
    id: 3,
    code: 'SIBLING_DISCOUNT',
    label_it: 'Sconto Fratelli / Sorelle',
    label_en: 'Sibling Discount',
    label_ru: 'Скидка для братьев/сестёр',
    description: 'Скидка при одновременной записи двух и более братьев/сестёр',
  },
  [DiscountType.EARLY_BIRD]: {
    id: 4,
    code: 'EARLY_BIRD',
    label_it: 'Iscrizione Anticipata',
    label_en: 'Early Bird Discount',
    label_ru: 'Ранняя запись',
    description: 'Скидка при записи до начала учебного года',
  },
};

// ---------------------------------------------------------------------------

export const ExamCertificationType = {
  CAMBRIDGE:        1, // Cambridge English (PET, FCE, CAE, CPE)
  IELTS:            2, // IELTS Academic / General Training
  TOEFL:            3, // TOEFL iBT
  CERTIPASS_EIPASS: 4, // EIPASS / Certipass IT certifications
  DELF_DALF:        5, // French DELF / DALF (Alliance Française)
  GOETHE:           6, // Goethe-Zertifikat (German)
} as const;
export type ExamCertificationType = (typeof ExamCertificationType)[keyof typeof ExamCertificationType];

export const EXAM_CERTIFICATION_TYPE_DICTIONARY: Record<ExamCertificationType, DictionaryEntry> = {
  [ExamCertificationType.CAMBRIDGE]: {
    id: 1,
    code: 'CAMBRIDGE',
    label_it: 'Cambridge English',
    label_en: 'Cambridge English',
    label_ru: 'Cambridge English (PET, FCE, CAE, CPE)',
    description: 'Международные экзамены Cambridge English — PET, FCE, CAE, CPE',
  },
  [ExamCertificationType.IELTS]: {
    id: 2,
    code: 'IELTS',
    label_it: 'IELTS',
    label_en: 'IELTS',
    label_ru: 'IELTS Academic / General Training',
    description: 'Международный экзамен для академических целей и иммиграции',
  },
  [ExamCertificationType.TOEFL]: {
    id: 3,
    code: 'TOEFL',
    label_it: 'TOEFL iBT',
    label_en: 'TOEFL iBT',
    label_ru: 'TOEFL iBT (онлайн-экзамен)',
    description: 'Тест на знание английского языка для поступления в американские университеты',
  },
  [ExamCertificationType.CERTIPASS_EIPASS]: {
    id: 4,
    code: 'CERTIPASS_EIPASS',
    label_it: 'EIPASS / Certipass',
    label_en: 'EIPASS / Certipass',
    label_ru: 'EIPASS / Certipass (IT-сертификации)',
    description: 'Европейские IT-сертификации — валидны для конкурсов государственной службы (concorsi)',
  },
  [ExamCertificationType.DELF_DALF]: {
    id: 5,
    code: 'DELF_DALF',
    label_it: 'DELF / DALF (Francese)',
    label_en: 'DELF / DALF (French)',
    label_ru: 'DELF / DALF (французский язык)',
    description: 'Дипломы французского языка DELF (A1–B2) и DALF (C1–C2)',
  },
  [ExamCertificationType.GOETHE]: {
    id: 6,
    code: 'GOETHE',
    label_it: 'Goethe-Zertifikat (Tedesco)',
    label_en: 'Goethe-Zertifikat (German)',
    label_ru: 'Goethe-Zertifikat (немецкий язык)',
    description: 'Официальный сертификат немецкого языка Института Гёте',
  },
};

// ---------------------------------------------------------------------------

export const ContactTopic = {
  GENERAL_INFO:       1, // General information about the school
  COURSE_ENROLLMENT:  2, // Enrollment in a specific course
  CORPORATE_TRAINING: 3, // Corporate / B2B language training
  CERTIFICATIONS:     4, // Info about exams and certifications
  PLACEMENT_TEST:     5, // Request a free placement test
  OTHER:              6, // Other / not categorised
} as const;
export type ContactTopic = (typeof ContactTopic)[keyof typeof ContactTopic];

export const CONTACT_TOPIC_DICTIONARY: Record<ContactTopic, DictionaryEntry> = {
  [ContactTopic.GENERAL_INFO]: {
    id: 1,
    code: 'GENERAL_INFO',
    label_it: 'Informazioni Generali',
    label_en: 'General Information',
    label_ru: 'Общая информация о школе',
    description: 'Общий запрос: контакты, адрес, цены, расписание',
  },
  [ContactTopic.COURSE_ENROLLMENT]: {
    id: 2,
    code: 'COURSE_ENROLLMENT',
    label_it: 'Iscrizione a un Corso',
    label_en: 'Course Enrollment',
    label_ru: 'Запись на курс',
    description: 'Заявка на запись в конкретный курс школы',
  },
  [ContactTopic.CORPORATE_TRAINING]: {
    id: 3,
    code: 'CORPORATE_TRAINING',
    label_it: 'Formazione Aziendale',
    label_en: 'Corporate Training',
    label_ru: 'Корпоративное обучение',
    description: 'Языковые курсы для компаний и B2B-клиентов',
  },
  [ContactTopic.CERTIFICATIONS]: {
    id: 4,
    code: 'CERTIFICATIONS',
    label_it: 'Esami e Certificazioni',
    label_en: 'Exams & Certifications',
    label_ru: 'Экзамены и сертификации',
    description: 'Информация о подготовке к Cambridge, IELTS, EIPASS и другим экзаменам',
  },
  [ContactTopic.PLACEMENT_TEST]: {
    id: 5,
    code: 'PLACEMENT_TEST',
    label_it: 'Test di Livello Gratuito',
    label_en: 'Free Placement Test',
    label_ru: 'Бесплатный тест на определение уровня',
    description: 'Запрос на прохождение бесплатного теста для определения уровня языка',
  },
  [ContactTopic.OTHER]: {
    id: 6,
    code: 'OTHER',
    label_it: 'Altro',
    label_en: 'Other',
    label_ru: 'Другое',
    description: 'Прочие вопросы, не вошедшие в другие категории',
  },
};

export const ContactMessageStatus = {
  NEW: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  ARCHIVED: 4,
} as const;
export type ContactMessageStatus = (typeof ContactMessageStatus)[keyof typeof ContactMessageStatus];

export const CONTACT_MESSAGE_STATUS_DICTIONARY: Record<ContactMessageStatus, DictionaryEntry> = {
  [ContactMessageStatus.NEW]: {
    id: 1,
    code: 'NEW',
    label_it: 'Nuovo',
    label_en: 'New',
    label_ru: 'Новая',
    description: 'Новая входящая заявка, ожидающая обработки',
  },
  [ContactMessageStatus.IN_PROGRESS]: {
    id: 2,
    code: 'IN_PROGRESS',
    label_it: 'In Corso',
    label_en: 'In Progress',
    label_ru: 'В обработке',
    description: 'Заявка взята в работу сотрудником школы',
  },
  [ContactMessageStatus.RESOLVED]: {
    id: 3,
    code: 'RESOLVED',
    label_it: 'Risolto',
    label_en: 'Resolved',
    label_ru: 'Обработана / Закрыта',
    description: 'Клиент получил ответ, консультация завершена',
  },
  [ContactMessageStatus.ARCHIVED]: {
    id: 4,
    code: 'ARCHIVED',
    label_it: 'Archiviato',
    label_en: 'Archived',
    label_ru: 'В архиве',
    description: 'Заявка отправлена в архив',
  },
};

export function parseContactMessageStatus(val: any): ContactMessageStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as ContactMessageStatus;
    return ContactMessageStatus.NEW;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'new' || s === 'nuovo') return ContactMessageStatus.NEW;
  if (s === '2' || s === 'in_progress' || s === 'in corso' || s === 'processing') return ContactMessageStatus.IN_PROGRESS;
  if (s === '3' || s === 'resolved' || s === 'risolto' || s === 'closed') return ContactMessageStatus.RESOLVED;
  if (s === '4' || s === 'archived' || s === 'archiviato') return ContactMessageStatus.ARCHIVED;
  return ContactMessageStatus.NEW;
}

export interface ContactMessageRecord {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  interest?: string | null;
  message: string;
  status: ContactMessageStatus;
  notes?: string | null;
}
