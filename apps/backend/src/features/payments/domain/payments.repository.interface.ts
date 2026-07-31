export interface PaymentEntity {
  id: string;
  bookingId?: string | null;
  userId?: string | null;
  amount: number | any;
  currency: string;
  paymentMethod: string;
  type: string;
  status: string;
  provider: string;
  providerTransactionId?: string | null;
  notes?: string | null;
  createdAt: Date;
  paidAt?: Date | null;
  updatedAt?: Date | null;
}

export abstract class PaymentsRepository {
  abstract findAll(bookingId?: string): Promise<PaymentEntity[]>;
  abstract findById(id: string): Promise<PaymentEntity | null>;
  abstract create(data: {
    bookingId?: string;
    userId?: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    type?: string;
    status?: string;
    provider?: string;
    providerTransactionId?: string;
    notes?: string;
    paidAt?: Date;
  }): Promise<PaymentEntity>;
  abstract update(id: string, data: Partial<{ status: string; notes: string }>): Promise<PaymentEntity>;
  abstract delete(id: string): Promise<void>;
}
