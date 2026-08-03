import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PaymentsRepository, PaymentEntity } from './domain/payments.repository.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(bookingId?: string): Promise<any[]> {
    const rawPayments = await this.paymentsRepository.findAll(bookingId);

    try {
      const memberships = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, booking_id, student_id, email, tax_code FROM annual_memberships`
      ).catch(() => []);

      const memList: any[] = Array.isArray(memberships) ? memberships : [];

      return rawPayments.map((p) => {
        let mId: string | null = null;

        const noteMatch = p.notes?.match(/\[membership_id:(.+?)\]/);
        if (noteMatch) {
          mId = noteMatch[1];
        }

        if (!mId && p.bookingId) {
          const match = memList.find((m) => m.booking_id === p.bookingId);
          if (match) mId = match.id;
        }

        if (!mId && (!p.bookingId || p.type === 'registration_fee')) {
          const standalone = memList.find((m) => !m.booking_id);
          if (standalone) mId = standalone.id;
        }

        return {
          ...p,
          membershipId: mId,
          membership_id: mId,
        };
      });
    } catch {
      return rawPayments;
    }
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

  async update(id: string, dto: Partial<{ status: string; notes: string; paymentMethod: string }>): Promise<PaymentEntity> {
    const existing = await this.findOne(id);
    const updated = await this.paymentsRepository.update(id, dto);

    // If status is updated to succeeded, sync booking and memberships
    if (dto.status === 'succeeded' && existing.bookingId) {
      // 1. Recalculate amount paid for booking
      const allPayments = await this.paymentsRepository.findAll(existing.bookingId);
      const totalPaid = allPayments
        .filter((p) => p.status === 'succeeded')
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const booking = await this.prisma.booking.findUnique({ where: { id: existing.bookingId } });
      if (booking) {
        const rawAmount = Number(booking.amountPaid || 0);
        const regFee = Number(booking.registrationFee || 30);
        const totalTarget = rawAmount > 0 ? rawAmount : regFee;

        let newPaymentStatus = 'reserved';
        if (totalPaid >= totalTarget && totalTarget > 0) {
          newPaymentStatus = 'completed';
        } else if (totalPaid > 0) {
          newPaymentStatus = 'partially_paid';
        }

        await this.prisma.booking.update({
          where: { id: existing.bookingId },
          data: {
            amountPaid: totalPaid,
            paymentStatus: newPaymentStatus,
          },
        });

        await this.prisma.$executeRawUnsafe(
          `UPDATE bookings SET amount_paid = ${totalPaid}, payment_status = '${newPaymentStatus}' WHERE id = '${existing.bookingId}'::uuid`
        ).catch(() => null);

        // 2. If this payment was registration_fee, activate annual_memberships
        if (existing.type === 'registration_fee' || Number(existing.amount) === 30) {
          const sId = booking.userId || null;
          const sTaxCode = booking.studentTaxCode || booking.purchaserTaxCode || null;
          const sEmail = booking.studentEmail || booking.purchaserEmail || null;
          const sPhone = booking.studentPhone || booking.purchaserPhone || null;

          if (sId) {
            await this.prisma.$executeRawUnsafe(
              `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW() WHERE id = '${sId}'::uuid`
            ).catch(() => null);
          }

          await this.prisma.$executeRawUnsafe(`
            INSERT INTO annual_memberships (id, tax_code, email, phone, academic_year, status, student_id, booking_id, paid_at, expires_at)
            VALUES (gen_random_uuid(), ${sTaxCode ? `'${sTaxCode}'` : 'NULL'}, ${sEmail ? `'${sEmail}'` : 'NULL'}, ${sPhone ? `'${sPhone}'` : 'NULL'}, '2026/2027', 'active', ${sId ? `'${sId}'::uuid` : 'NULL'}, '${existing.bookingId}'::uuid, NOW(), '2027-08-31 23:59:59+00'::timestamptz)
            ON CONFLICT (booking_id) DO UPDATE SET status = 'active', paid_at = NOW();
          `).catch(() => null);
        }
      }
    }

    return updated;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    await this.findOne(id);
    await this.paymentsRepository.delete(id);
    return { success: true };
  }
}
