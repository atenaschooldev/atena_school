/**
 * ============================================================================
 * ATENA SCHOOL — COMMERCE / DISCOUNTS & CERTIFICATIONS DOMAIN
 * ============================================================================
 * @module @atena/api-types/commerce/discounts
 * @description
 * Типы скидок, промо-акций и официальных экзаменов/сертификаций:
 * - DiscountType: 1=PERCENTAGE, 2=FIXED_AMOUNT, 3=SIBLING_DISCOUNT, 4=EARLY_BIRD
 * - ExamCertificationType: 1=CAMBRIDGE, 2=IELTS, 3=TOEFL, 4=CERTIPASS_EIPASS, 5=DELF_DALF, 6=GOETHE
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. Discount Types
// ----------------------------------------------------------------------------

export const DiscountType = {
  PERCENTAGE:       1, // Percentage discount / Sconto Percentuale / В процентах
  FIXED_AMOUNT:     2, // Fixed amount / Sconto Fisso (€) / Фиксированная
  SIBLING_DISCOUNT: 3, // Sibling discount / Sconto Fratelli / Братья и сёстры
  EARLY_BIRD:       4, // Early bird / Iscrizione Anticipata / Ранняя запись
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

export interface PromoCode {
  id: string;
  code: string;
  description?: string | null;
  discount_type: DiscountType;
  discount_value: number;
  waive_registration_fee: boolean;
  max_uses?: number | null;
  used_count: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
}

export interface ValidatePromoCodeResponse {
  valid: boolean;
  promo?: {
    id: string;
    code: string;
    description?: string | null;
    discountType: DiscountType;
    discountValue: number;
    waiveRegistrationFee: boolean;
    discountAmount: number;
  };
  error?: string;
}

// ----------------------------------------------------------------------------
// 2. Exam and Official Certification Types
// ----------------------------------------------------------------------------

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
