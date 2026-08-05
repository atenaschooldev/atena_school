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
  currency: string;
  paymentMethod?: string;
  payment_method?: string;
  type: 'course_payment' | 'payment' | 'registration_fee' | 'exam_fee' | 'certificate_fee' | 'textbook_material' | 'single_lesson' | 'other' | string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | string;
  provider: 'stripe' | 'manual' | string;
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
}

export interface CreatePaymentFormValues {
  bookingId?: string;
  studentId?: string;
  amount: number;
  paymentMethod: string;
  type?: string;
  status?: string;
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
  byType: Record<string, number>;
}
