import {
  PaymentCurrency,
  PaymentMethod,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
} from '@atena/api-types';

export interface Payment {
  id: string;
  bookingId?: string | null;
  booking_id?: string | null;
  studentId?: string | null;
  student_id?: string | null;
  userId?: string | null;
  user_id?: string | null;
  scheduleId?: string | null;
  schedule_id?: string | null;
  amount: number | string;
  currency: PaymentCurrency | number;
  paymentMethod?: PaymentMethod | number;
  payment_method?: PaymentMethod | number;
  type: PaymentType | number;
  status: PaymentRecordStatus | number;
  provider: PaymentProvider | number;
  providerTransactionId?: string | null;
  provider_transaction_id?: string | null;
  notes?: string | null;
  createdAt?: string;
  created_at?: string;
  paidAt?: string | null;
  paid_at?: string | null;
  student?: {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    tax_code?: string;
  } | null;
  booking?: {
    id: string;
    courseName?: string;
    purchaserName?: string;
    purchaserEmail?: string;
    purchaserTaxCode?: string;
  } | null;
  purchaser_name?: string;
  purchaserName?: string;
  purchaser_email?: string;
  purchaserEmail?: string;
  student_name?: string;
  student_email?: string;
  description?: string;
}

export interface CreatePaymentFormValues {
  bookingId?: string;
  studentId?: string;
  amount: number;
  paymentMethod: PaymentMethod | number;
  type?: PaymentType | number;
  status?: PaymentRecordStatus | number;
  currency?: PaymentCurrency | number;
  notes?: string;
  paidAt?: string;
}

export interface PaymentsSummary {
  todayTotal: number;
  todayCash: number;
  todayPos: number;
  todayTransfer: number;
  todayStripe: number;
  totalAmount: number;
  totalCount: number;
  totalRevenue?: number;
  cashRevenue?: number;
  posRevenue?: number;
  stripeRevenue?: number;
  pendingAmount?: number;
  byType: Record<string, number>;
}
