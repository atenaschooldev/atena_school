import { DictionaryEntry } from '../common/dictionary.types';

export const PaymentMethod = {
  STRIPE: 1,        // Online via Stripe
  CASH: 2,          // Cash at the reception (Contanti)
  POS: 3,           // Bank card at school POS terminal
  BANK_TRANSFER: 4, // Bank transfer (Bonifico)
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

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
