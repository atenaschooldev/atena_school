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
  lesson_duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  teacher_id?: string;
  teacher_name?: string;
  teachers?: {
    full_name: string;
  };
}

// ---------------------------------------------------------------------------
// Numeric Enums for Bookings (Single Source of Truth)
// ---------------------------------------------------------------------------

export const BookingPaymentStatus = {
  PENDING: 1,            // Ожидает онлайн-оплаты (Stripe checkout)
  RESERVED: 2,           // Забронировано с оплатой на месте (в секретариате)
  PAID: 3,               // Оплачено
  REFUNDED: 4,           // Полный возврат средств
  PARTIALLY_REFUNDED: 5, // Частичный возврат
  FAILED: 6,             // Ошибка оплаты
  CANCELLED: 7,          // Отменено до оплаты
} as const;
export type BookingPaymentStatus = (typeof BookingPaymentStatus)[keyof typeof BookingPaymentStatus];

export const BookingStatus = {
  ACTIVE: 1,    // Действующее активное бронирование (обучение идёт)
  COMPLETED: 2, // Курс успешно пройден
  CANCELLED: 3, // Бронь аннулирована
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const BookingSchedulingStatus = {
  SCHEDULED: 1,            // Уроки расписаны в календаре
  PENDING_COORDINATION: 2, // Ожидает согласования времени (гибкий график)
} as const;
export type BookingSchedulingStatus = (typeof BookingSchedulingStatus)[keyof typeof BookingSchedulingStatus];

export const PaymentMethod = {
  STRIPE: 1,        // Онлайн через Stripe
  CASH: 2,          // Наличные в кассе (Contanti)
  POS: 3,           // Банковской картой в терминале школы (POS)
  BANK_TRANSFER: 4, // Банковский перевод (Bonifico)
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const BillingScheme = {
  FULL: 1,         // Полная оплата за курс
  INSTALLMENTS: 2, // Оплата частями / взносы
  PER_LESSON: 3,   // Поурочная оплата
} as const;
export type BillingScheme = (typeof BillingScheme)[keyof typeof BillingScheme];

export const PaymentCurrency = {
  EUR: 1, // Euro (€)
  USD: 2, // US Dollar ($)
  GBP: 3, // British Pound (£)
} as const;
export type PaymentCurrency = (typeof PaymentCurrency)[keyof typeof PaymentCurrency];

export const PaymentType = {
  COURSE_PAYMENT: 1,    // Оплата курса / Pagamento Corso
  REGISTRATION_FEE: 2,  // Ежегодный регистрационный взнос €30 / Quota Iscrizione
  INSTALLMENT: 3,       // Платёж по рассрочке / Rata Corso
  SINGLE_LESSON: 4,     // Разовый урок / Lezione Singola
  EXAM_FEE: 5,          // Взнос за экзамен Cambridge/CELI / Quota Esame
  CERTIFICATE_FEE: 6,   // Выдача сертификата / Rilascio Certificato
  MATERIAL_TEXTBOOK: 7, // Учебные материалы и книги / Libro o Materiale Didattico
  OTHER: 8,             // Прочее / Altro
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export const PaymentRecordStatus = {
  PENDING: 1,            // В обработке / In attesa
  SUCCEEDED: 2,          // Успешно проведён / Completato
  FAILED: 3,             // Ошибка оплаты / Fallito
  REFUNDED: 4,           // Полный возврат / Rimborsato
  PARTIALLY_REFUNDED: 5, // Частичный возврат / Parzialmente rimborsato
  CANCELLED: 6,          // Отменён / Annullato
} as const;
export type PaymentRecordStatus = (typeof PaymentRecordStatus)[keyof typeof PaymentRecordStatus];

export const PaymentProvider = {
  STRIPE: 1,       // Шлюз Stripe
  MANUAL: 2,       // Ручная касса школы / Manual Reception
  POS_TERMINAL: 3, // Физический банковский POS-терминал
  BANK: 4,         // Прямой банковский перевод по реквизитам
} as const;
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];

// ---------------------------------------------------------------------------
// Numeric Enums for Lessons (Single Source of Truth)
// ---------------------------------------------------------------------------

export const LessonStatus = {
  SCHEDULED:   1, // Запланирован / Programmata
  COMPLETED:   2, // Проведён / Completata
  CANCELLED:   3, // Отменён / Annullata
  RESCHEDULED: 4, // Перенесён / Riprogrammata
} as const;
export type LessonStatus = (typeof LessonStatus)[keyof typeof LessonStatus];

export const LessonAttendance = {
  PENDING: 1, // Ещё не отмечено / Da registrare
  PRESENT: 2, // Присутствовал / Presente
  ABSENT:  3, // Отсутствовал / Assente
  LATE:    4, // Опоздал / In ritardo
  EXCUSED: 5, // Уважительная причина / Giustificato
} as const;
export type LessonAttendance = (typeof LessonAttendance)[keyof typeof LessonAttendance];

export const LessonLocationType = {
  IN_PERSON: 1, // Очно / In presenza
  ONLINE:    2, // Онлайн / Online
  HYBRID:    3, // Смешанный / Ibrido
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
};

export const BILLING_SCHEME_ID_TO_STRING: Record<BillingScheme, string> = {
  [BillingScheme.FULL]: 'full',
  [BillingScheme.INSTALLMENTS]: 'installments',
  [BillingScheme.PER_LESSON]: 'per_lesson',
};

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
  schedule_days?: number[];
  start_time?: string;
  end_time?: string;
  schedule_type?: string;
  status: string;
  booking_status?: BookingStatus | number;
  scheduling_status?: BookingSchedulingStatus | number;
  payment_status: BookingPaymentStatus | number;
  payment_method: PaymentMethod | number;
  billing_scheme?: BillingScheme | number;
  amount_paid: number;
  registration_fee: number;
  course_price?: number;
  item_price?: number;
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
  annualFeePaid: boolean;
  academicYear: string;
  requiresFee: boolean;
  membership?: any;
}

export interface ReservationResponse {
  success: boolean;
  bookingId: string;
  booking: BookingRecord;
}

export interface CheckoutSessionResponse {
  success: boolean;
  url: string;
  bookingId: string;
}

export interface SiteContentResponse {
  success: boolean;
  hero?: any;
  about?: any;
  testimonials?: any[];
  contact?: any;
}

/**
 * Ключи системных настроек приложения (app_settings)
 */
export const AppSettingKey = {
  STRIPE_ENABLED: 'stripe_enabled',
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
};

// ---------------------------------------------------------------------------
// Numeric Enums for Annual Memberships (€30 Association Membership)
// ---------------------------------------------------------------------------

export const MembershipStatus = {
  ACTIVE: 1,  // Действующее активное членство
  PENDING: 2, // Ожидает оплаты / подтверждения
  EXPIRED: 3, // Срок действия членства истек
  REVOKED: 4, // Отозвано / аннулировано
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
  ACTIVE: 1,    // Активный студент (Attivo)
  INACTIVE: 2,  // Неактивен / В ожидании (Inattivo / In attesa)
  PAUSED: 3,    // Приостановлено / Академический отпуск (In pausa)
  GRADUATED: 4, // Завершил обучение / Выпускник (Diplomato / Concluso)
  ARCHIVED: 5,  // В архиве (Archiviato)
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
  ACTIVE: 1,   // Активен / Опубликован (Attivo / Pubblicato)
  DRAFT: 2,    // Черновик / Планируется (Bozza / In programmazione)
  ARCHIVED: 3, // В архиве / Завершен (Archiviato / Concluso)
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
  FIXED: 1,    // Фиксированное расписание по дням и часам (Fisso)
  FLEXIBLE: 2, // Гибкий график / По согласованию (Flessibile / Da concordare)
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
  GROUP: 1,         // Групповые занятия (Di Gruppo)
  INDIVIDUAL: 2,    // Индивидуальные занятия (Individuale / Privato)
  ONLINE: 3,        // Онлайн курс (Online)
  CERTIFICATION: 4, // Сертификация / Экзамен (Certificazione)
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




