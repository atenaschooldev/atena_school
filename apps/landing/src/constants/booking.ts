import {
  BookingPaymentStatus,
  BookingStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  PaymentCurrency,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  UserRole,
} from "@atena/api-types";

export enum FeeCheckStatus {
  INITIAL = 1,
  CHECKING = 2,
  PAID = 3,
  NOT_PAID = 4,
}

export enum SubmitAction {
  BOOK = 1,
  PAY = 2,
}

export const BOOKING_PAYMENT_STATUS = {
  PENDING: BookingPaymentStatus.PENDING,
  RESERVED: BookingPaymentStatus.RESERVED,
  PAID: BookingPaymentStatus.PAID,
  REFUNDED: BookingPaymentStatus.REFUNDED,
  PARTIALLY_REFUNDED: BookingPaymentStatus.PARTIALLY_REFUNDED,
  FAILED: BookingPaymentStatus.FAILED,
  CANCELLED: BookingPaymentStatus.CANCELLED,
} as const;

export const BOOKING_STATUS = {
  ACTIVE: BookingStatus.ACTIVE,
  COMPLETED: BookingStatus.COMPLETED,
  CANCELLED: BookingStatus.CANCELLED,
} as const;

export const SCHEDULING_STATUS = {
  SCHEDULED: BookingSchedulingStatus.SCHEDULED,
  PENDING_COORDINATION: BookingSchedulingStatus.PENDING_COORDINATION,
} as const;

export const PAYMENT_METHOD = {
  STRIPE: PaymentMethod.STRIPE,
  CASH: PaymentMethod.CASH,
  POS: PaymentMethod.POS,
  BANK_TRANSFER: PaymentMethod.BANK_TRANSFER,
} as const;

export const SCHEDULE_TYPE = {
  FIXED: "fixed",
  FLEXIBLE: "flexible",
} as const;

export const ACADEMIC_YEAR = {
  CURRENT: "2026/2027",
  NEXT: "2027/2028",
  EXPIRY_DATE: "2027-08-31T23:59:59.000Z",
} as const;

export const MEMBERSHIP_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_TYPE = {
  COURSE_PAYMENT: PaymentType.COURSE_PAYMENT,
  REGISTRATION_FEE: PaymentType.REGISTRATION_FEE,
  INSTALLMENT: PaymentType.INSTALLMENT,
  SINGLE_LESSON: PaymentType.SINGLE_LESSON,
  EXAM_FEE: PaymentType.EXAM_FEE,
  CERTIFICATE_FEE: PaymentType.CERTIFICATE_FEE,
  MATERIAL_TEXTBOOK: PaymentType.MATERIAL_TEXTBOOK,
  OTHER: PaymentType.OTHER,
} as const;

export const PAYMENT_RECORD_STATUS = {
  PENDING: PaymentRecordStatus.PENDING,
  SUCCEEDED: PaymentRecordStatus.SUCCEEDED,
  FAILED: PaymentRecordStatus.FAILED,
  REFUNDED: PaymentRecordStatus.REFUNDED,
  PARTIALLY_REFUNDED: PaymentRecordStatus.PARTIALLY_REFUNDED,
  CANCELLED: PaymentRecordStatus.CANCELLED,
} as const;

export const USER_ROLE = {
  STUDENT: UserRole.STUDENT,
  TEACHER: UserRole.TEACHER,
  ADMIN: UserRole.ADMIN,
  PARENT: UserRole.PARENT,
} as const;

// Aliases for clean imports
export const PAYMENT_STATUS = BOOKING_PAYMENT_STATUS;

// Numeric Enums & Mappings from @atena/api-types
export {
  BookingPaymentStatus,
  BookingStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  BillingScheme,
  PaymentCurrency,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  CourseCategory,
  UserRole,
  ItemType,
  NotificationType,
  CourseDetailTab,
  BOOKING_PAYMENT_STATUS_DICTIONARY,
  BOOKING_STATUS_DICTIONARY,
  BOOKING_SCHEDULING_STATUS_DICTIONARY,
  PAYMENT_METHOD_DICTIONARY,
  BILLING_SCHEME_DICTIONARY,
  PAYMENT_CURRENCY_DICTIONARY,
  PAYMENT_TYPE_DICTIONARY,
  PAYMENT_RECORD_STATUS_DICTIONARY,
  PAYMENT_PROVIDER_DICTIONARY,
  COURSE_CATEGORY_DICTIONARY,
  USER_ROLE_DICTIONARY,
  ITEM_TYPE_DICTIONARY,
  NOTIFICATION_TYPE_DICTIONARY,
  BOOKING_PAYMENT_STATUS_STRING_TO_ID,
  BOOKING_PAYMENT_STATUS_ID_TO_STRING,
  PAYMENT_METHOD_STRING_TO_ID,
  PAYMENT_METHOD_ID_TO_STRING,
  BOOKING_STATUS_STRING_TO_ID,
  BOOKING_STATUS_ID_TO_STRING,
  BOOKING_SCHEDULING_STATUS_STRING_TO_ID,
  BOOKING_SCHEDULING_STATUS_ID_TO_STRING,
  BILLING_SCHEME_STRING_TO_ID,
  BILLING_SCHEME_ID_TO_STRING,
  PAYMENT_CURRENCY_STRING_TO_ID,
  PAYMENT_CURRENCY_ID_TO_STRING,
  PAYMENT_TYPE_STRING_TO_ID,
  PAYMENT_TYPE_ID_TO_STRING,
  PAYMENT_RECORD_STATUS_STRING_TO_ID,
  PAYMENT_RECORD_STATUS_ID_TO_STRING,
  PAYMENT_PROVIDER_STRING_TO_ID,
  PAYMENT_PROVIDER_ID_TO_STRING,
  parseBookingPaymentStatus,
  parsePaymentMethod,
  parsePaymentCurrency,
  parsePaymentType,
  parsePaymentRecordStatus,
  parsePaymentProvider,
  parseCourseCategory,
  parseUserRole,
  parseItemType,
} from "@atena/api-types";
