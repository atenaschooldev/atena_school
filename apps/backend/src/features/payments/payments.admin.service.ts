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
import { getCurrentAcademicYear } from '@atena/utils';

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
        `SELECT id, student_id, tax_code FROM annual_memberships`
      ).catch(() => []);

      const memList: any[] = Array.isArray(memberships) ? memberships : [];

      let mapped = rawPayments.map((p) => {
        let mId: string | null = null;

        const noteMatch = p.notes?.match(/\[membership_id:(.+?)\]/);
        if (noteMatch) {
          mId = noteMatch[1];
        }

        if (!mId && p.studentId) {
          const match = memList.find((m) => m.student_id === p.studentId);
          if (match) mId = match.id;
        }

        if (!mId && (!p.bookingId || p.type === PaymentType.REGISTRATION_FEE)) {
          const standalone = memList.find((m) => !m.booking_id);
          if (standalone) mId = standalone.id;
        }

        const pBooking = (p as any).booking;
        const pStudent = (p as any).student;

        const purchaserName =
          pBooking?.purchaserName ||
          pStudent?.full_name ||
          (pStudent?.first_name && pStudent?.last_name ? `${pStudent.first_name} ${pStudent.last_name}` : null) ||
          pStudent?.first_name ||
          'Cliente';

        const purchaserEmail =
          pBooking?.purchaserEmail ||
          pStudent?.email ||
          '';

        const studentName =
          pBooking?.studentName ||
          pStudent?.full_name ||
          (pStudent?.first_name && pStudent?.last_name ? `${pStudent.first_name} ${pStudent.last_name}` : null) ||
          pStudent?.first_name ||
          null;

        const studentEmail =
          pBooking?.studentEmail ||
          pStudent?.email ||
          null;

        return {
          ...p,
          purchaserName,
          purchaser_name: purchaserName,
          purchaserEmail,
          purchaser_email: purchaserEmail,
          studentName,
          student_name: studentName,
          studentEmail,
          student_email: studentEmail,
          membershipId: mId,
          membership_id: mId,
          createdAt: p.createdAt ? (p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt) : null,
          created_at: p.createdAt ? (p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt) : null,
          paidAt: p.paidAt ? (p.paidAt instanceof Date ? p.paidAt.toISOString() : p.paidAt) : null,
          paid_at: p.paidAt ? (p.paidAt instanceof Date ? p.paidAt.toISOString() : p.paidAt) : null,
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

      let b: any = null;
      if (targetBookingId) {
        b = await this.prisma.booking.findUnique({ where: { id: targetBookingId } });
      }

      if (!sId && b) {
        if (b.student_id) {
          sId = b.student_id;
        } else if (b.studentTaxCode || b.studentEmail) {
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

      let studentTaxCode = b?.studentTaxCode || b?.purchaserTaxCode || null;
      if (!studentTaxCode && sId) {
        const sRecord = await this.prisma.students.findUnique({ where: { id: sId } });
        if (sRecord?.tax_code) studentTaxCode = sRecord.tax_code;
      }

      if (isPaymentSucceeded) {
        if (sId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW() WHERE id = '${sId}'::uuid`
          ).catch(() => null);
        }

        if (memId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE annual_memberships SET status = ${MembershipStatus.ACTIVE}, paid_at = NOW(), payment_id = '${id}'::uuid WHERE id = '${memId}'::uuid`
          ).catch(() => null);
        } else if (studentTaxCode) {
          const { academicYear, expiresAt } = getCurrentAcademicYear();
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO annual_memberships (id, tax_code, academic_year, status, student_id, payment_id, paid_at, expires_at)
            VALUES (gen_random_uuid(), '${studentTaxCode}', '${academicYear}', ${MembershipStatus.ACTIVE}, ${sId ? `'${sId}'::uuid` : 'NULL'}, '${id}'::uuid, NOW(), '${expiresAt}'::timestamptz)
            ON CONFLICT (tax_code, academic_year) DO UPDATE SET status = ${MembershipStatus.ACTIVE}, paid_at = NOW(), payment_id = EXCLUDED.payment_id, student_id = COALESCE(EXCLUDED.student_id, annual_memberships.student_id);
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
        } else if (studentTaxCode) {
          const { academicYear } = getCurrentAcademicYear();
          await this.prisma.$executeRawUnsafe(
            `UPDATE annual_memberships SET status = ${MembershipStatus.PENDING} WHERE LOWER(tax_code) = LOWER('${studentTaxCode}') AND academic_year = '${academicYear}'`
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

      if ((itemType === PaymentType.REGISTRATION_FEE || Number(item.amount) === 30) && (dto.purchaserTaxCode || dto.studentId)) {
        const { academicYear, expiresAt } = getCurrentAcademicYear();

        try {
          const taxCode = dto.purchaserTaxCode || (dto.studentId ? (await this.prisma.students.findUnique({ where: { id: dto.studentId } }))?.tax_code : null);
          if (taxCode) {
            await this.prisma.$executeRawUnsafe(
              `INSERT INTO annual_memberships (id, tax_code, student_id, user_id, status, academic_year, paid_at, expires_at)
               VALUES (gen_random_uuid(), $1, $2::uuid, $3::uuid, ${MembershipStatus.ACTIVE}, '${academicYear}', NOW(), $4::timestamptz)
               ON CONFLICT (tax_code, academic_year) DO UPDATE SET status = ${MembershipStatus.ACTIVE}, paid_at = NOW(), student_id = COALESCE(EXCLUDED.student_id, annual_memberships.student_id)`,
              taxCode,
              dto.studentId || null,
              payment.userId || null,
              expiresAt,
            ).catch((e) => console.error("Error inserting annual_membership:", e));
          }
        } catch (err) {
          console.error("Error in membership insertion logic:", err);
        }
      }
    }

    return { success: true, count: createdPayments.length, payments: createdPayments };
  }
}
