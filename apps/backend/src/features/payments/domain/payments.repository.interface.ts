export interface PaymentEntity {
  id: string;
  bookingId?: string | null;
  studentId?: string | null;
  userId?: string | null;
  amount: number | any;
  currency: number;
  paymentMethod: number;
  type: number;
  status: number;
  provider: number;
  providerTransactionId?: string | null;
  notes?: string | null;
  createdAt: Date;
  paidAt?: Date | null;
  updatedAt?: Date | null;
}

export abstract class PaymentsRepository {
  abstract findAll(bookingId?: string, studentId?: string): Promise<PaymentEntity[]>;
  abstract findById(id: string): Promise<PaymentEntity | null>;
  abstract create(data: {
    bookingId?: string;
    studentId?: string;
    userId?: string;
    amount: number;
    currency?: number;
    paymentMethod: number;
    type?: number;
    status?: number;
    provider?: number;
    providerTransactionId?: string;
    notes?: string;
    paidAt?: Date | string;
  }): Promise<PaymentEntity>;
  abstract update(id: string, data: Partial<{ status: number; notes: string; paymentMethod: number; amount: number; type: number; studentId: string; bookingId: string; paidAt: Date | string }>): Promise<PaymentEntity>;
  abstract delete(id: string): Promise<void>;
}
