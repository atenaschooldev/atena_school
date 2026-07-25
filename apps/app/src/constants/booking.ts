export const BOOKING_PAYMENT_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  RESERVED: "reserved",
  PAID: "paid",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
  DISPUTED: "disputed",
  FAILED: "failed",
} as const;

export const BOOKING_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const SCHEDULING_STATUS = {
  SCHEDULED: "scheduled",
  PENDING_COORDINATION: "pending_coordination",
} as const;

export const PAYMENT_METHOD = {
  STRIPE: "stripe",
  CASH: "cash",
  POS: "pos",
  BANK_TRANSFER: "bank_transfer",
} as const;

export const SCHEDULE_TYPE = {
  FIXED: "fixed",
  FLEXIBLE: "flexible",
} as const;

export const ACADEMIC_YEAR = {
  CURRENT: "2026/2027",
  NEXT: "2027/2028",
} as const;

export const MEMBERSHIP_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_TYPE = {
  PAYMENT: "payment",
  REGISTRATION_FEE: "registration_fee",
  INSTALLMENT: "installment",
  REFUND: "refund",
  ADJUSTMENT: "adjustment",
} as const;

export const USER_ROLE = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
  PARENT: "parent",
} as const;

// Aliases for clean imports
export const PAYMENT_STATUS = BOOKING_PAYMENT_STATUS;
