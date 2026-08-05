import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PaymentsRepository, PaymentEntity } from '../domain/payments.repository.interface';

@Injectable()
export class PrismaPaymentsRepository implements PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(bookingId?: string, studentId?: string): Promise<PaymentEntity[]> {
    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (studentId) where.studentId = studentId;

    return this.prisma.payment.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            full_name: true,
            email: true,
            tax_code: true,
          },
        },
        booking: {
          select: {
            id: true,
            courseName: true,
            purchaserName: true,
            purchaserEmail: true,
            purchaserTaxCode: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: true,
        booking: true,
      },
    });
  }

  async create(data: {
    bookingId?: string;
    studentId?: string;
    userId?: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
    type?: string;
    status?: string;
    provider?: string;
    providerTransactionId?: string;
    notes?: string;
    paidAt?: Date | string;
  }): Promise<PaymentEntity> {
    return this.prisma.payment.create({
      data: {
        bookingId: data.bookingId || null,
        studentId: data.studentId || null,
        userId: data.userId || null,
        amount: data.amount,
        currency: data.currency || 'EUR',
        paymentMethod: data.paymentMethod,
        type: data.type || 'payment',
        status: data.status || 'succeeded',
        provider: data.provider || 'manual',
        providerTransactionId: data.providerTransactionId || null,
        notes: data.notes || null,
        paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
      },
    });
  }

  async update(
    id: string,
    data: Partial<{
      status: string;
      notes: string;
      paymentMethod: string;
      amount: number;
      type: string;
      studentId: string;
      bookingId: string;
      paidAt: Date | string;
    }>,
  ): Promise<PaymentEntity> {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.studentId !== undefined) updateData.studentId = data.studentId || null;
    if (data.bookingId !== undefined) updateData.bookingId = data.bookingId || null;
    if (data.paidAt !== undefined) updateData.paidAt = data.paidAt ? new Date(data.paidAt) : new Date();

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }
}
