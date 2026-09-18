/**
 * ============================================================================
 * ATENA SCHOOL — COMMERCE DICTIONARY REGISTRY
 * ============================================================================
 * @module @atena/backend/features/dictionary/registries/commerce.registry
 * @description
 * Реестр метаданных для коммерческих таблиц и сущностей:
 * - bookings (Бронирования, статусы оплаты, схемы платежей)
 * - payments (Финансовые проводки, валюты, провайдеры, типы начислений)
 * - discounts (Типы скидок: процентная, фиксированная, семейная, ранняя)
 * - exam_certifications (Международные языковые и IT-экзамены)
 * ============================================================================
 */

import {
  BOOKING_PAYMENT_STATUS_DICTIONARY,
  BOOKING_STATUS_DICTIONARY,
  BOOKING_SCHEDULING_STATUS_DICTIONARY,
  PAYMENT_METHOD_DICTIONARY,
  BILLING_SCHEME_DICTIONARY,
  PAYMENT_CURRENCY_DICTIONARY,
  PAYMENT_TYPE_DICTIONARY,
  PAYMENT_RECORD_STATUS_DICTIONARY,
  PAYMENT_PROVIDER_DICTIONARY,
  DISCOUNT_TYPE_DICTIONARY,
  EXAM_CERTIFICATION_TYPE_DICTIONARY,
  BookingPaymentStatus,
  BookingStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  BillingScheme,
  PaymentCurrency,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  DiscountType,
  ExamCertificationType,
} from '@atena/api-types';
import { DictionaryTableDefinition } from './types';

// ----------------------------------------------------------------------------
// 1. Bookings Table Metadata
// ----------------------------------------------------------------------------

export function getBookingsDictionary(): DictionaryTableDefinition {
  const columns = {
    payment_status: {
      column: 'payment_status',
      dbType: 'SMALLINT / INTEGER',
      name: 'BookingPaymentStatus',
      description: 'Статус онлайн/офлайн оплаты бронирования (1=PENDING..7=CANCELLED)',
      values: BOOKING_PAYMENT_STATUS_DICTIONARY,
      codes: BookingPaymentStatus,
    },
    booking_status: {
      column: 'booking_status',
      dbType: 'SMALLINT / INTEGER',
      name: 'BookingStatus',
      description: 'Общий жизненный статус брони (1=ACTIVE, 2=COMPLETED, 3=CANCELLED)',
      values: BOOKING_STATUS_DICTIONARY,
      codes: BookingStatus,
    },
    scheduling_status: {
      column: 'scheduling_status',
      dbType: 'SMALLINT / INTEGER',
      name: 'BookingSchedulingStatus',
      description: 'Статус согласования расписания занятий (1=SCHEDULED, 2=PENDING_COORDINATION)',
      values: BOOKING_SCHEDULING_STATUS_DICTIONARY,
      codes: BookingSchedulingStatus,
    },
    payment_method: {
      column: 'payment_method',
      dbType: 'SMALLINT / INTEGER',
      name: 'PaymentMethod',
      description: 'Выбранный клиентом способ оплаты курса (1=STRIPE..4=BANK_TRANSFER)',
      values: PAYMENT_METHOD_DICTIONARY,
      codes: PaymentMethod,
    },
    billing_scheme: {
      column: 'billing_scheme',
      dbType: 'SMALLINT / INTEGER',
      name: 'BillingScheme',
      description: 'Схема оплаты курса (1=FULL, 2=INSTALLMENTS, 3=PER_LESSON, 4=SUBSCRIPTION)',
      values: BILLING_SCHEME_DICTIONARY,
      codes: BillingScheme,
    },
  };

  return {
    table: 'bookings',
    title: 'Бронирования и заявки на курсы',
    description:
      'Основная таблица заказов и бронирований. Содержит данные плательщика, студента, выбранный курс, сумму, скидки и статусы.',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 2. Payments Table Metadata
// ----------------------------------------------------------------------------

export function getPaymentsDictionary(): DictionaryTableDefinition {
  const columns = {
    currency: {
      column: 'currency',
      dbType: 'SMALLINT / INTEGER',
      name: 'PaymentCurrency',
      description: 'Валюта платежной транзакции (1=EUR, 2=USD, 3=GBP)',
      values: PAYMENT_CURRENCY_DICTIONARY,
      codes: PaymentCurrency,
    },
    payment_method: {
      column: 'payment_method',
      dbType: 'SMALLINT / INTEGER',
      name: 'PaymentMethod',
      description: 'Фактический платежный инструмент (1=STRIPE..4=BANK_TRANSFER)',
      values: PAYMENT_METHOD_DICTIONARY,
      codes: PaymentMethod,
    },
    type: {
      column: 'type',
      dbType: 'SMALLINT / INTEGER',
      name: 'PaymentType',
      description: 'Бухгалтерский тип платежа (1=COURSE_PAYMENT, 2=REGISTRATION_FEE (€30)..8=OTHER)',
      values: PAYMENT_TYPE_DICTIONARY,
      codes: PaymentType,
    },
    status: {
      column: 'status',
      dbType: 'SMALLINT / INTEGER',
      name: 'PaymentRecordStatus',
      description: 'Статус финансовой транзакции (1=PENDING, 2=SUCCEEDED..6=CANCELLED)',
      values: PAYMENT_RECORD_STATUS_DICTIONARY,
      codes: PaymentRecordStatus,
    },
    provider: {
      column: 'provider',
      dbType: 'SMALLINT / INTEGER',
      name: 'PaymentProvider',
      description: 'Платежный провайдер / шлюз (1=STRIPE, 2=MANUAL, 3=POS, 4=BANK)',
      values: PAYMENT_PROVIDER_DICTIONARY,
      codes: PaymentProvider,
    },
  };

  return {
    table: 'payments',
    title: 'Платежи и транзакции',
    description:
      'Финансовая таблица бухгалтерских записей и проводок по бронированиям и студентам. Каждый курс генерирует 2 записи: оплату курса (type=1) и членский взнос €30 (type=2).',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 3. Discounts Metadata
// ----------------------------------------------------------------------------

export function getDiscountsDictionary(): DictionaryTableDefinition {
  const columns = {
    discount_type: {
      column: 'discount_type',
      dbType: 'SMALLINT / INTEGER',
      name: 'DiscountType',
      description: 'Тип применяемой скидки к курсу (1=PERCENTAGE, 2=FIXED_AMOUNT, 3=SIBLING_DISCOUNT, 4=EARLY_BIRD)',
      values: DISCOUNT_TYPE_DICTIONARY,
      codes: DiscountType,
    },
  };

  return {
    table: 'discounts',
    title: 'Скидки и промо-акции',
    description: 'Типы скидок и специальных предложений для студентов и семей.',
    columns,
    enums: columns,
  };
}

// ----------------------------------------------------------------------------
// 4. Certifications & Exams Metadata
// ----------------------------------------------------------------------------

export function getCertificationsDictionary(): DictionaryTableDefinition {
  const columns = {
    certification_type: {
      column: 'certification_type',
      dbType: 'SMALLINT / INTEGER',
      name: 'ExamCertificationType',
      description: 'Тип официального экзамена / сертификации (1=CAMBRIDGE..6=GOETHE)',
      values: EXAM_CERTIFICATION_TYPE_DICTIONARY,
      codes: ExamCertificationType,
    },
  };

  return {
    table: 'exam_certifications',
    title: 'Экзамены и сертификации',
    description: 'Международные языковые и IT-сертификации (Cambridge, IELTS, TOEFL, Certipass EIPASS, DELF/DALF, Goethe).',
    columns,
    enums: columns,
  };
}
