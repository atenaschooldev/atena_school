import { PaymentEntity } from './payment.entity';

export abstract class PaymentsRepository {
  abstract findMany(): Promise<PaymentEntity[]>;
  abstract findOne(id: string): Promise<PaymentEntity | null>;
  abstract create(data: {
    paymentNumber: string;
    studentId: string;
    price: number;
    paymentType: string;
    status?: string;
    paymentDate?: Date;
  }): Promise<PaymentEntity>;
  abstract update(id: string, data: Partial<PaymentEntity>): Promise<PaymentEntity>;
  abstract delete(id: string): Promise<void>;
}
