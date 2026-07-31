import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PaymentsRepository, PaymentEntity } from './domain/payments.repository.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(bookingId?: string): Promise<PaymentEntity[]> {
    return this.paymentsRepository.findAll(bookingId);
  }

  async findOne(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async create(dto: {
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
  }): Promise<PaymentEntity> {
    // Idempotency check: if a transaction with the same providerTransactionId & type already exists, skip duplicate creation
    if (dto.providerTransactionId && dto.bookingId) {
      const existing = await this.paymentsRepository.findAll(dto.bookingId);
      const match = existing.find(
        (p) =>
          (p.providerTransactionId === dto.providerTransactionId ||
            (p as any).provider_transaction_id === dto.providerTransactionId) &&
          p.type === (dto.type || "payment"),
      );
      if (match) {
        return match;
      }
    }

    const payment = await this.paymentsRepository.create(dto);

    if (dto.bookingId && (dto.status === 'succeeded' || !dto.status)) {
      const allBookingPayments = await this.paymentsRepository.findAll(dto.bookingId);
      const totalAmountPaid = allBookingPayments
        .filter((p) => p.status === 'succeeded')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      await this.prisma.booking.update({
        where: { id: dto.bookingId },
        data: {
          amountPaid: totalAmountPaid,
          paymentStatus: 'completed',
        },
      });
    }

    return payment;
  }

  async update(id: string, dto: Partial<{ status: string; notes: string }>): Promise<PaymentEntity> {
    await this.findOne(id);
    return this.paymentsRepository.update(id, dto);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.paymentsRepository.delete(id);
    return { success: true };
  }
}
