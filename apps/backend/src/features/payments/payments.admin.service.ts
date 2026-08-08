import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PaymentsRepository, PaymentEntity } from './domain/payments.repository.interface';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    bookingId?: string,
    studentId?: string,
    filters?: { status?: string; type?: string; method?: string; search?: string },
  ): Promise<any[]> {
    let rawPayments = await this.paymentsRepository.findAll(bookingId, studentId);

    if (filters?.status && filters.status !== 'all') {
      const st = filters.status.toLowerCase().trim();
      rawPayments = rawPayments.filter((p) => (p.status || '').toLowerCase() === st);
    }
    if (filters?.type && filters.type !== 'all') {
      const tp = filters.type.toLowerCase().trim();
      rawPayments = rawPayments.filter((p) => (p.type || '').toLowerCase() === tp);
    }
    if (filters?.method && filters.method !== 'all') {
      const m = filters.method.toLowerCase().trim();
      rawPayments = rawPayments.filter((p) => (p.paymentMethod || '').toLowerCase() === m);
    }

    try {
      const memberships = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT id, booking_id, student_id, email, tax_code FROM annual_memberships`
      ).catch(() => []);

      const memList: any[] = Array.isArray(memberships) ? memberships : [];

      let mapped = rawPayments.map((p) => {
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

        const purchaserName =
          (p as any).booking?.purchaserName ||
          (p as any).student?.full_name ||
          ((p as any).student?.first_name && (p as any).student?.last_name ? `${(p as any).student.first_name} ${(p as any).student.last_name}` : null) ||
          (p as any).student?.first_name ||
          'Cliente';

        const purchaserEmail =
          (p as any).booking?.purchaserEmail ||
          (p as any).student?.email ||
          '';

        return {
          ...p,
          purchaserName,
          purchaser_name: purchaserName,
          purchaserEmail,
          purchaser_email: purchaserEmail,
          membershipId: mId,
          membership_id: mId,
        };
      });

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        mapped = mapped.filter((p: any) => {
          const matchName = (p.purchaser_name || p.student_name || '').toLowerCase().includes(q);
          const matchEmail = (p.purchaser_email || p.student_email || '').toLowerCase().includes(q);
          const matchNotes = (p.notes || '').toLowerCase().includes(q);
          return matchName || matchEmail || matchNotes;
        });
      }

      return mapped;
    } catch {
      return rawPayments;
    }
  }

  async getSummary(): Promise<any> {
    const allPayments = await this.paymentsRepository.findAll();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const succeeded = allPayments.filter((p) => (p.status || '').toLowerCase() === 'succeeded');

    const todayPayments = succeeded.filter((p) => {
      const pDate = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt);
      return pDate >= startOfToday;
    });

    const todayCash = todayPayments
      .filter((p) => (p.paymentMethod || '').toLowerCase() === 'cash' || (p.paymentMethod || '').toLowerCase() === 'contanti')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayPos = todayPayments
      .filter((p) => (p.paymentMethod || '').toLowerCase() === 'pos' || (p.paymentMethod || '').toLowerCase() === 'card')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayTransfer = todayPayments
      .filter((p) => (p.paymentMethod || '').toLowerCase() === 'transfer' || (p.paymentMethod || '').toLowerCase() === 'bonifico')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayStripe = todayPayments
      .filter((p) => (p.paymentMethod || '').toLowerCase() === 'stripe')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayTotal = todayCash + todayPos + todayTransfer + todayStripe;

    const byType: Record<string, number> = {
      course_payment: 0,
      payment: 0,
      registration_fee: 0,
      exam_fee: 0,
      certificate_fee: 0,
      textbook_material: 0,
      single_lesson: 0,
      other: 0,
    };

    succeeded.forEach((p) => {
      const t = p.type || 'payment';
      if (byType[t] !== undefined) {
        byType[t] += Number(p.amount || 0);
      } else {
        byType.other += Number(p.amount || 0);
      }
    });

    const totalAmount = succeeded.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      todayTotal,
      todayCash,
      todayPos,
      todayTransfer,
      todayStripe,
      totalAmount,
      totalCount: succeeded.length,
      byType,
    };
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
    // Idempotency check
    if (dto.providerTransactionId && dto.bookingId) {
      const existing = await this.paymentsRepository.findAll(dto.bookingId);
      const match = existing.find(
        (p) =>
          (p.providerTransactionId === dto.providerTransactionId ||
            (p as any).provider_transaction_id === dto.providerTransactionId) &&
          p.type === (dto.type || 'payment'),
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

  async update(
    id: string,
    dto: Partial<{
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
    const existing = await this.findOne(id);
    const updated = await this.paymentsRepository.update(id, dto);

    const targetBookingId = dto.bookingId || existing.bookingId;
    const st = (updated.status || '').toLowerCase().trim();
    const isPaymentSucceeded = st === 'succeeded' || st === 'paid' || st === 'completed';
    const isRegistrationFee = (dto.type || existing.type) === 'registration_fee' || Number(dto.amount || existing.amount) === 30 || (existing.notes || '').toLowerCase().includes('iscrizione');

    if (targetBookingId) {
      const allPayments = await this.paymentsRepository.findAll(targetBookingId);
      const totalPaid = allPayments
        .filter((p) => {
          const s = (p.status || '').toLowerCase().trim();
          return s === 'succeeded' || s === 'paid' || s === 'completed';
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const booking = await this.prisma.booking.findUnique({ where: { id: targetBookingId } });
      if (booking) {
        const rawAmount = Number(booking.amountPaid || 0);
        const regFee = Number(booking.registrationFee || 30);
        const totalTarget = rawAmount > 0 ? rawAmount : regFee;

        let newPaymentStatus = 'reserved';
        if (totalPaid >= totalTarget && totalTarget > 0) {
          newPaymentStatus = 'paid';
        } else if (totalPaid > 0) {
          newPaymentStatus = 'partially_paid';
        }

        await this.prisma.booking.update({
          where: { id: targetBookingId },
          data: {
            amountPaid: totalPaid,
            paymentStatus: newPaymentStatus,
          },
        }).catch(() => null);
      }
    }

    if (isRegistrationFee) {
      const noteMatch = (dto.notes || existing.notes || '').match(/\[membership_id:(.+?)\]/);
      const memId = noteMatch ? noteMatch[1] : null;
      const sId = dto.studentId || existing.studentId || null;

      if (isPaymentSucceeded) {
        if (sId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW() WHERE id = '${sId}'::uuid`
          ).catch(() => null);
        }

        if (memId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE annual_memberships SET status = 'active', paid_at = NOW() WHERE id = '${memId}'::uuid`
          ).catch(() => null);
        } else if (targetBookingId) {
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO annual_memberships (id, tax_code, email, phone, academic_year, status, student_id, booking_id, paid_at, expires_at)
            VALUES (gen_random_uuid(), NULL, NULL, NULL, '2026/2027', 'active', ${sId ? `'${sId}'::uuid` : 'NULL'}, '${targetBookingId}'::uuid, NOW(), '2027-08-31 23:59:59+00'::timestamptz)
            ON CONFLICT (booking_id) DO UPDATE SET status = 'active', paid_at = NOW();
          `).catch(() => null);
        } else if (sId) {
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO annual_memberships (id, tax_code, email, phone, academic_year, status, student_id, booking_id, paid_at, expires_at)
            VALUES (gen_random_uuid(), NULL, NULL, NULL, '2026/2027', 'active', '${sId}'::uuid, NULL, NOW(), '2027-08-31 23:59:59+00'::timestamptz);
          `).catch(() => null);
        }
      } else {
        if (sId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE students SET annual_fee_paid = false WHERE id = '${sId}'::uuid`
          ).catch(() => null);
        }

        if (memId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE annual_memberships SET status = 'pending' WHERE id = '${memId}'::uuid`
          ).catch(() => null);
        } else if (targetBookingId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE annual_memberships SET status = 'pending' WHERE booking_id = '${targetBookingId}'::uuid`
          ).catch(() => null);
        }
      }
    }

    return updated;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const existing = await this.findOne(id);
    await this.paymentsRepository.delete(id);

    if (existing.bookingId) {
      try {
        const allPayments = await this.paymentsRepository.findAll(existing.bookingId);
        const totalPaid = allPayments
          .filter((p) => {
            const s = (p.status || '').toLowerCase().trim();
            return s === 'succeeded' || s === 'paid' || s === 'completed';
          })
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const booking = await this.prisma.booking.findUnique({ where: { id: existing.bookingId } });
        if (booking) {
          const targetAmount = Number(booking.amountPaid || 0);
          let newStatus = 'reserved';
          if (totalPaid >= targetAmount && targetAmount > 0) {
            newStatus = 'paid';
          } else if (totalPaid > 0) {
            newStatus = 'partially_paid';
          }

          await this.prisma.booking.update({
            where: { id: existing.bookingId },
            data: {
              amountPaid: totalPaid,
              paymentStatus: newStatus,
            },
          }).catch(() => null);
        }
      } catch (err) {
        console.warn('Recalculate booking payment error on payment delete:', err);
      }
    }

    return { success: true };
  }

  async posCheckout(dto: {
    bookingId?: string;
    studentId?: string;
    purchaserName?: string;
    purchaserEmail?: string;
    purchaserTaxCode?: string;
    paymentMethod: string;
    items: Array<{ type: string; amount: number; description?: string }>;
    notes?: string;
  }) {
    const createdPayments = [];

    for (const item of (dto.items || [])) {
      const payment = await this.create({
        bookingId: dto.bookingId,
        studentId: dto.studentId,
        amount: Number(item.amount),
        paymentMethod: dto.paymentMethod,
        type: item.type,
        status: 'succeeded',
        provider: 'manual_pos',
        notes: dto.notes || item.description,
      });
      createdPayments.push(payment);

      if ((item.type === 'registration_fee' || Number(item.amount) === 30) && (dto.purchaserTaxCode || dto.purchaserEmail || dto.studentId || dto.bookingId)) {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        try {
          if (dto.bookingId) {
            await this.prisma.$executeRawUnsafe(
              `INSERT INTO annual_memberships (id, booking_id, student_id, email, tax_code, status, academic_year, paid_at, expires_at)
               VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, 'active', '2026/2027', NOW(), $5::timestamptz)
               ON CONFLICT (booking_id) DO UPDATE SET status = 'active', paid_at = NOW()`,
              dto.bookingId,
              dto.studentId || null,
              dto.purchaserEmail || null,
              dto.purchaserTaxCode || null,
              expiresAt.toISOString(),
            ).catch((e) => console.error("Error inserting annual_membership with bookingId:", e));
          } else {
            await this.prisma.$executeRawUnsafe(
              `INSERT INTO annual_memberships (id, booking_id, student_id, email, tax_code, status, academic_year, paid_at, expires_at)
               VALUES (gen_random_uuid(), NULL, $1::uuid, $2, $3, 'active', '2026/2027', NOW(), $4::timestamptz)`,
              dto.studentId || null,
              dto.purchaserEmail || null,
              dto.purchaserTaxCode || null,
              expiresAt.toISOString(),
            ).catch((e) => console.error("Error inserting annual_membership standalone:", e));
          }
        } catch (err) {
          console.error("Error in membership insertion logic:", err);
        }
      }
    }

    return { success: true, count: createdPayments.length, payments: createdPayments };
  }
}
