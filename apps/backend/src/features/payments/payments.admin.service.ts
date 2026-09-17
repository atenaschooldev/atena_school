import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PaymentsRepository, PaymentEntity } from './domain/payments.repository.interface';
import {
  BookingPaymentStatus,
  PaymentCurrency,
  PaymentMethod,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  parsePaymentType,
  parsePaymentMethod,
  parsePaymentRecordStatus,
  MembershipStatus,
} from '@atena/api-types';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    bookingId?: string,
    studentId?: string,
    filters?: { status?: string | number; type?: string | number; method?: string | number; search?: string },
  ): Promise<any[]> {
    let rawPayments = await this.paymentsRepository.findAll(bookingId, studentId);

    if (filters?.status !== undefined && filters.status !== 'all') {
      const parsedStatus = parsePaymentRecordStatus(filters.status);
      if (parsedStatus !== null) {
        rawPayments = rawPayments.filter((p) => p.status === parsedStatus);
      }
    }
    if (filters?.type !== undefined && filters.type !== 'all') {
      const parsedType = parsePaymentType(filters.type);
      if (parsedType !== null) {
        rawPayments = rawPayments.filter((p) => p.type === parsedType);
      }
    }
    if (filters?.method !== undefined && filters.method !== 'all') {
      const parsedMethod = parsePaymentMethod(filters.method);
      if (parsedMethod !== null) {
        rawPayments = rawPayments.filter((p) => p.paymentMethod === parsedMethod);
      }
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

        if (!mId && (!p.bookingId || p.type === PaymentType.REGISTRATION_FEE)) {
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

    const succeeded = allPayments.filter((p) => p.status === PaymentRecordStatus.SUCCEEDED);

    const todayPayments = succeeded.filter((p) => {
      const pDate = p.paidAt ? new Date(p.paidAt) : new Date(p.createdAt);
      return pDate >= startOfToday;
    });

    const todayCash = todayPayments
      .filter((p) => p.paymentMethod === PaymentMethod.CASH)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayPos = todayPayments
      .filter((p) => p.paymentMethod === PaymentMethod.POS)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayTransfer = todayPayments
      .filter((p) => p.paymentMethod === PaymentMethod.BANK_TRANSFER)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayStripe = todayPayments
      .filter((p) => p.paymentMethod === PaymentMethod.STRIPE)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const todayTotal = todayCash + todayPos + todayTransfer + todayStripe;

    const byType: Record<string, number> = {
      course_payment: 0,
      payment: 0,
      registration_fee: 0,
      installment: 0,
      single_lesson: 0,
      exam_fee: 0,
      certificate_fee: 0,
      textbook_material: 0,
      other: 0,
    };

    succeeded.forEach((p) => {
      if (p.type === PaymentType.COURSE_PAYMENT) {
        byType.course_payment += Number(p.amount || 0);
        byType.payment += Number(p.amount || 0);
      } else if (p.type === PaymentType.REGISTRATION_FEE) {
        byType.registration_fee += Number(p.amount || 0);
      } else if (p.type === PaymentType.INSTALLMENT) {
        byType.installment += Number(p.amount || 0);
      } else if (p.type === PaymentType.SINGLE_LESSON) {
        byType.single_lesson += Number(p.amount || 0);
      } else if (p.type === PaymentType.EXAM_FEE) {
        byType.exam_fee += Number(p.amount || 0);
      } else if (p.type === PaymentType.CERTIFICATE_FEE) {
        byType.certificate_fee += Number(p.amount || 0);
      } else if (p.type === PaymentType.MATERIAL_TEXTBOOK) {
        byType.textbook_material += Number(p.amount || 0);
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
    currency?: number;
    paymentMethod: number;
    type?: number;
    status?: number;
    provider?: number;
    providerTransactionId?: string;
    notes?: string;
    paidAt?: Date | string;
  }): Promise<PaymentEntity> {
    const paymentStatus = dto.status !== undefined ? Number(dto.status) : PaymentRecordStatus.SUCCEEDED;
    const paymentType = dto.type !== undefined ? Number(dto.type) : PaymentType.COURSE_PAYMENT;
    const paymentMethod = Number(dto.paymentMethod);
    const paymentProvider = dto.provider !== undefined ? Number(dto.provider) : PaymentProvider.MANUAL;
    const paymentCurrency = dto.currency !== undefined ? Number(dto.currency) : PaymentCurrency.EUR;

    // Idempotency check
    if (dto.providerTransactionId && dto.bookingId) {
      const existing = await this.paymentsRepository.findAll(dto.bookingId);
      const match = existing.find(
        (p) =>
          (p.providerTransactionId === dto.providerTransactionId ||
            (p as any).provider_transaction_id === dto.providerTransactionId) &&
          p.type === paymentType,
      );
      if (match) {
        return match;
      }
    }

    const payment = await this.paymentsRepository.create({
      ...dto,
      currency: paymentCurrency,
      paymentMethod,
      type: paymentType,
      status: paymentStatus,
      provider: paymentProvider,
    });

    if (dto.bookingId && paymentStatus === PaymentRecordStatus.SUCCEEDED) {
      const allBookingPayments = await this.paymentsRepository.findAll(dto.bookingId);
      const totalAmountPaid = allBookingPayments
        .filter((p) => p.status === PaymentRecordStatus.SUCCEEDED)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      await this.prisma.booking.update({
        where: { id: dto.bookingId },
        data: {
          amountPaid: totalAmountPaid,
          paymentStatus: BookingPaymentStatus.PAID,
        },
      });
    }

    return payment;
  }

  async update(
    id: string,
    dto: Partial<{
      status: number;
      notes: string;
      paymentMethod: number;
      amount: number;
      type: number;
      studentId: string;
      bookingId: string;
      paidAt: Date | string;
    }>,
  ): Promise<PaymentEntity> {
    const existing = await this.findOne(id);
    const updated = await this.paymentsRepository.update(id, dto);

    const targetBookingId = dto.bookingId || existing.bookingId;
    const isPaymentSucceeded = updated.status === PaymentRecordStatus.SUCCEEDED;
    const isRegistrationFee =
      updated.type === PaymentType.REGISTRATION_FEE ||
      Number(updated.amount) === 30 ||
      (existing.notes || '').toLowerCase().includes('iscrizione');

    if (targetBookingId) {
      const allPayments = await this.paymentsRepository.findAll(targetBookingId);
      const totalPaid = allPayments
        .filter((p) => p.status === PaymentRecordStatus.SUCCEEDED)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const booking = await this.prisma.booking.findUnique({ where: { id: targetBookingId } });
      if (booking) {
        const rawAmount = Number(booking.amountPaid || 0);
        const regFee = Number(booking.registrationFee || 30);
        const totalTarget = rawAmount > 0 ? rawAmount : regFee;

        let newPaymentStatus: number = BookingPaymentStatus.RESERVED;
        if (totalPaid >= totalTarget && totalTarget > 0) {
          newPaymentStatus = BookingPaymentStatus.PAID;
        } else if (totalPaid > 0) {
          newPaymentStatus = BookingPaymentStatus.PARTIALLY_REFUNDED;
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
      let sId = dto.studentId || existing.studentId || null;

      if (!sId && targetBookingId) {
        const b = await this.prisma.booking.findUnique({ where: { id: targetBookingId } });
        if (b?.student_id) {
          sId = b.student_id;
        } else if (b?.studentTaxCode || b?.studentEmail) {
          const found = await this.prisma.students.findFirst({
            where: {
              OR: [
                b.studentTaxCode ? { tax_code: { equals: b.studentTaxCode, mode: 'insensitive' } } : {},
                b.studentEmail ? { email: { equals: b.studentEmail, mode: 'insensitive' } } : {},
              ],
            },
          });
          if (found) sId = found.id;
        }
      }

      if (isPaymentSucceeded) {
        if (sId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW() WHERE id = '${sId}'::uuid`
          ).catch(() => null);
        }

        if (memId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE annual_memberships SET status = ${MembershipStatus.ACTIVE}, paid_at = NOW() WHERE id = '${memId}'::uuid`
          ).catch(() => null);
        } else if (targetBookingId) {
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO annual_memberships (id, tax_code, email, phone, academic_year, status, student_id, booking_id, paid_at, expires_at)
            VALUES (gen_random_uuid(), NULL, NULL, NULL, '2026/2027', ${MembershipStatus.ACTIVE}, ${sId ? `'${sId}'::uuid` : 'NULL'}, '${targetBookingId}'::uuid, NOW(), '2027-08-31 23:59:59+00'::timestamptz)
            ON CONFLICT (booking_id) DO UPDATE SET status = ${MembershipStatus.ACTIVE}, paid_at = NOW();
          `).catch(() => null);
        } else if (sId) {
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO annual_memberships (id, tax_code, email, phone, academic_year, status, student_id, booking_id, paid_at, expires_at)
            VALUES (gen_random_uuid(), NULL, NULL, NULL, '2026/2027', ${MembershipStatus.ACTIVE}, '${sId}'::uuid, NULL, NOW(), '2027-08-31 23:59:59+00'::timestamptz);
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
            `UPDATE annual_memberships SET status = ${MembershipStatus.PENDING} WHERE id = '${memId}'::uuid`
          ).catch(() => null);
        } else if (targetBookingId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE annual_memberships SET status = ${MembershipStatus.PENDING} WHERE booking_id = '${targetBookingId}'::uuid`
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
          .filter((p) => p.status === PaymentRecordStatus.SUCCEEDED)
          .reduce((sum, p) => sum + Number(p.amount), 0);

        const booking = await this.prisma.booking.findUnique({ where: { id: existing.bookingId } });
        if (booking) {
          const targetAmount = Number(booking.amountPaid || 0);
          let newStatus: number = BookingPaymentStatus.RESERVED;
          if (totalPaid >= targetAmount && targetAmount > 0) {
            newStatus = BookingPaymentStatus.PAID;
          } else if (totalPaid > 0) {
            newStatus = BookingPaymentStatus.PARTIALLY_REFUNDED;
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
    paymentMethod: number | string;
    items: Array<{ type: number | string; amount: number; description?: string }>;
    notes?: string;
  }) {
    const createdPayments = [];
    const pMethod = parsePaymentMethod(dto.paymentMethod) ?? PaymentMethod.CASH;

    for (const item of (dto.items || [])) {
      const itemType = parsePaymentType(item.type) ?? PaymentType.COURSE_PAYMENT;
      const payment = await this.create({
        bookingId: dto.bookingId,
        studentId: dto.studentId,
        amount: Number(item.amount),
        paymentMethod: pMethod,
        type: itemType,
        status: PaymentRecordStatus.SUCCEEDED,
        provider: PaymentProvider.POS_TERMINAL,
        notes: dto.notes || item.description,
      });
      createdPayments.push(payment);

      if ((itemType === PaymentType.REGISTRATION_FEE || Number(item.amount) === 30) && (dto.purchaserTaxCode || dto.purchaserEmail || dto.studentId || dto.bookingId)) {
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        try {
          if (dto.bookingId) {
            await this.prisma.$executeRawUnsafe(
              `INSERT INTO annual_memberships (id, booking_id, student_id, email, tax_code, status, academic_year, paid_at, expires_at)
               VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, ${MembershipStatus.ACTIVE}, '2026/2027', NOW(), $5::timestamptz)
               ON CONFLICT (booking_id) DO UPDATE SET status = ${MembershipStatus.ACTIVE}, paid_at = NOW()`,
              dto.bookingId,
              dto.studentId || null,
              dto.purchaserEmail || null,
              dto.purchaserTaxCode || null,
              expiresAt.toISOString(),
            ).catch((e) => console.error("Error inserting annual_membership with bookingId:", e));
          } else {
            await this.prisma.$executeRawUnsafe(
              `INSERT INTO annual_memberships (id, booking_id, student_id, email, tax_code, status, academic_year, paid_at, expires_at)
               VALUES (gen_random_uuid(), NULL, $1::uuid, $2, $3, ${MembershipStatus.ACTIVE}, '2026/2027', NOW(), $4::timestamptz)`,
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
