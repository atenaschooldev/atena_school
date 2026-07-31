export interface Payment {
  id: string;
  bookingId?: string | null;
  booking_id?: string | null;
  userId?: string | null;
  user_id?: string | null;
  amount: number | string;
  currency: string;
  paymentMethod?: string;
  payment_method?: string;
  type: 'payment' | 'registration_fee' | string;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded' | string;
  provider: 'stripe' | 'manual' | string;
  providerTransactionId?: string | null;
  provider_transaction_id?: string | null;
  notes?: string | null;
  createdAt?: string;
  created_at?: string;
  paidAt?: string | null;
  paid_at?: string | null;
}

export interface CreatePaymentFormValues {
  bookingId?: string;
  amount: number;
  paymentMethod: string;
  type?: string;
  notes?: string;
}
