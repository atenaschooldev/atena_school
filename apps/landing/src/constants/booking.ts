export const BOOKING_PAYMENT_STATUS = {
  PAID: "paid",
  RESERVED: "reserved",
  PENDING_PAYMENT: "pending_payment",
  PENDING: "pending",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const;

export const BOOKING_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  REFUNDED: "refunded",
} as const;

export const BOOKING_SCHEDULING_STATUS = {
  SCHEDULED: "scheduled",
  PENDING_COORDINATION: "pending_coordination",
  COMPLETED: "completed",
} as const;

export const BOOKING_PAYMENT_METHOD = {
  STRIPE: "stripe",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  BONIFICO: "bonifico",
  CASH: "cash",
  IN_PERSON: "in_person",
  POS: "pos",
} as const;

// Aliases for backwards compatibility
export const PAYMENT_STATUS = BOOKING_PAYMENT_STATUS;
export const SCHEDULING_STATUS = BOOKING_SCHEDULING_STATUS;
export const PAYMENT_METHOD = BOOKING_PAYMENT_METHOD;
