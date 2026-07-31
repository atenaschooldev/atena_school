import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaymentsRepository, PaymentEntity } from '../domain/payments.repository.interface';

@Injectable()
export class PrismaPaymentsRepository implements PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(bookingId?: string): Promise<PaymentEntity[]> {
    return this.prisma.payment.findMany({
      where: bookingId ? { bookingId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    return this.prisma.payment.findUnique({
      where: { id },
    });
  }

  async create(data: {
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
  }): Promise<PaymentEntity> {
    return this.prisma.payment.create({
      data: {
        bookingId: data.bookingId || null,
        userId: data.userId || null,
        amount: data.amount,
        currency: data.currency || 'EUR',
        paymentMethod: data.paymentMethod,
        type: data.type || 'payment',
        status: data.status || 'succeeded',
        provider: data.provider || 'manual',
        providerTransactionId: data.providerTransactionId || null,
        notes: data.notes || null,
        paidAt: data.paidAt || new Date(),
      },
    });
  }

  async update(id: string, data: Partial<{ status: string; notes: string }>): Promise<PaymentEntity> {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }
}
