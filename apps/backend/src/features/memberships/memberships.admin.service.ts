import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  MembershipStatus,
  parseMembershipStatus,
  PaymentRecordStatus,
  PaymentType,
  PaymentMethod,
  PaymentCurrency,
  parsePaymentMethod,
} from '@atena/api-types';
import { getCurrentAcademicYear } from '@atena/utils';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipsRepository: MembershipsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(status?: number | string, academicYear?: string, search?: string) {
    const raw = await this.membershipsRepository.findAll({ status, academicYear, search });
    return raw.map((m: any) => {
      const studentName =
        m.student?.full_name ||
        (m.student?.first_name && m.student?.last_name ? `${m.student.first_name} ${m.student.last_name}` : null) ||
        m.student?.first_name ||
        m.booking?.studentName ||
        m.booking?.purchaserName ||
        m.email ||
        'Socio';

      const studentEmail =
        m.student?.email ||
        m.booking?.studentEmail ||
        m.booking?.purchaserEmail ||
        m.email ||
        '';

      const studentTaxCode =
        m.student?.tax_code ||
        m.booking?.studentTaxCode ||
        m.booking?.purchaserTaxCode ||
        m.taxCode ||
        '';

      return {
        ...m,
        amount: m.amount != null ? Number(m.amount.toString()) : 30,
        paymentMethod: m.paymentMethod != null ? Number(m.paymentMethod) : 1,
        payment_method: m.paymentMethod != null ? Number(m.paymentMethod) : 1,
        studentName,
        student_name: studentName,
        studentEmail,
        student_email: studentEmail,
        studentTaxCode,
        student_tax_code: studentTaxCode,
        paidAt: m.paidAt ? (m.paidAt instanceof Date ? m.paidAt.toISOString() : m.paidAt) : null,
        paid_at: m.paidAt ? (m.paidAt instanceof Date ? m.paidAt.toISOString() : m.paidAt) : null,
        expiresAt: m.expiresAt ? (m.expiresAt instanceof Date ? m.expiresAt.toISOString() : m.expiresAt) : null,
        expires_at: m.expiresAt ? (m.expiresAt instanceof Date ? m.expiresAt.toISOString() : m.expiresAt) : null,
        createdAt: m.createdAt ? (m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt) : null,
        created_at: m.createdAt ? (m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt) : null,
      };
    });
  }

  async findOne(id: string) {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) throw new NotFoundException(`Membership ${id} not found`);
    return membership;
  }

  async markAsPaid(id: string, paymentMethod?: number | string, amount?: number) {
    const existing = await this.findOne(id);
    const pMethodNum = paymentMethod != null ? (parsePaymentMethod(paymentMethod) ?? PaymentMethod.CASH) : (existing.paymentMethod || PaymentMethod.CASH);
    const finalAmount = amount != null ? Number(amount) : (existing.amount ? Number(existing.amount) : 30.0);
    const sId = existing.studentId || existing.userId;
    const sTaxCode = existing.taxCode;

    // 1. Generate sequential membership number if not present
    let membershipNumber = existing.membershipNumber;
    if (!membershipNumber) {
      const count = await this.prisma.annualMembership.count({
        where: {
          academicYear: existing.academicYear,
          membershipNumber: { not: null },
        },
      });
      const currentYear = existing.academicYear || getCurrentAcademicYear().academicYear;
      const yearPrefix = currentYear.split('/')[0] || String(new Date().getFullYear());
      membershipNumber = `ATN-${yearPrefix}-${String(count + 1).padStart(4, '0')}`;
    }

    // 2. Find or update linked payment record
    let paymentId = existing.paymentId;
    if (paymentId) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentRecordStatus.SUCCEEDED,
          paymentMethod: pMethodNum,
          paidAt: new Date(),
          amount: finalAmount,
        },
      }).catch(() => null);
    } else {
      const existingPayment = await this.prisma.payment.findFirst({
        where: {
          OR: [
            ...(sId ? [{ studentId: sId, type: PaymentType.REGISTRATION_FEE }] : []),
            { notes: { contains: `[membership_id:${id}]` } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingPayment) {
        paymentId = existingPayment.id;
        await this.prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: PaymentRecordStatus.SUCCEEDED,
            paymentMethod: pMethodNum,
            paidAt: new Date(),
            amount: finalAmount,
          },
        }).catch(() => null);
      } else {
        const createdPayment = await this.prisma.payment.create({
          data: {
            amount: finalAmount,
            currency: PaymentCurrency.EUR,
            type: PaymentType.REGISTRATION_FEE,
            status: PaymentRecordStatus.SUCCEEDED,
            paymentMethod: pMethodNum,
            studentId: sId || undefined,
            paidAt: new Date(),
            notes: `Quota associativa annuale ${existing.academicYear} [membership_id:${id}]`,
          },
        });
        paymentId = createdPayment.id;
      }
    }

    // 3. Update annual_memberships
    await this.prisma.annualMembership.update({
      where: { id },
      data: {
        status: MembershipStatus.ACTIVE,
        membershipNumber,
        paymentId,
        paymentMethod: pMethodNum,
        paidAt: new Date(),
        amount: finalAmount,
      },
    });

    // 4. Update student
    if (sId) {
      await this.prisma.$executeRawUnsafe(
        `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW(), status = 1 WHERE id = '${sId}'::uuid`
      ).catch(() => null);
    } else if (sTaxCode) {
      await this.prisma.$executeRawUnsafe(
        `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW(), status = 1 WHERE LOWER(tax_code) = LOWER('${sTaxCode}')`
      ).catch(() => null);
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, status: number | string) {
    const numStatus = typeof status === 'number' ? status : parseMembershipStatus(status);
    if (numStatus === MembershipStatus.ACTIVE) {
      return this.markAsPaid(id);
    }

    const existing = await this.findOne(id);
    const updated = await this.membershipsRepository.updateStatus(id, numStatus);

    const sId = existing.studentId || existing.userId;
    const sTaxCode = existing.taxCode;

    if (numStatus === MembershipStatus.REVOKED || numStatus === MembershipStatus.PENDING) {
      if (sId) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE students SET annual_fee_paid = false WHERE id = '${sId}'::uuid`
        ).catch(() => null);
      } else if (sTaxCode) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE students SET annual_fee_paid = false WHERE LOWER(tax_code) = LOWER('${sTaxCode}')`
        ).catch(() => null);
      }

      if (numStatus === MembershipStatus.PENDING) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE payments SET status = ${PaymentRecordStatus.PENDING} WHERE notes LIKE '%[membership_id:${id}]%'`
        ).catch(() => null);
      }
    }

    return this.findOne(id);
  }

  async toggleStatus(id: string) {
    const existing = await this.findOne(id);
    const currentStatus = Number(existing.status);
    const newStatus = currentStatus === MembershipStatus.REVOKED ? MembershipStatus.ACTIVE : MembershipStatus.REVOKED;
    return this.updateStatus(id, newStatus);
  }

  async deleteMembership(id: string) {
    const existing = await this.findOne(id);
    const sId = existing.studentId || existing.userId;
    const sTaxCode = existing.taxCode;

    // 1. Delete membership record
    await this.membershipsRepository.delete(id);

    // 2. Check if student has any other active memberships
    if (sId || sTaxCode) {
      const remainingActive = await this.prisma.annualMembership.count({
        where: {
          OR: [
            ...(sId ? [{ studentId: sId }] : []),
            ...(sTaxCode ? [{ taxCode: { equals: sTaxCode, mode: 'insensitive' as const } }] : []),
          ],
          status: MembershipStatus.ACTIVE,
        },
      });

      if (remainingActive === 0) {
        if (sId) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE students SET annual_fee_paid = false, annual_fee_paid_at = null WHERE id = '${sId}'::uuid`
          ).catch(() => null);
        } else if (sTaxCode) {
          await this.prisma.$executeRawUnsafe(
            `UPDATE students SET annual_fee_paid = false, annual_fee_paid_at = null WHERE LOWER(tax_code) = LOWER('${sTaxCode}')`
          ).catch(() => null);
        }
      }
    }

    // 3. Delete or unlink associated fee payment
    if (existing.paymentId) {
      await this.prisma.payment.delete({
        where: { id: existing.paymentId },
      }).catch(() => null);
    } else {
      await this.prisma.payment.deleteMany({
        where: {
          notes: { contains: `[membership_id:${id}]` },
        },
      }).catch(() => null);
    }

    return { success: true, id };
  }

  async getStats() {
    const all = await this.prisma.annualMembership.groupBy({
      by: ['status'],
      _count: { id: true },
    }).catch(() => [] as any[]);

    const byStatus = Object.fromEntries(all.map((r: any) => [r.status, r._count?.id || 0]));
    const total = all.reduce((s: number, r: any) => s + (r._count?.id || 0), 0);

    return {
      total,
      active: byStatus[MembershipStatus.ACTIVE] || 0,
      pending: byStatus[MembershipStatus.PENDING] || 0,
      expiredOrRevoked: (byStatus[MembershipStatus.EXPIRED] || 0) + (byStatus[MembershipStatus.REVOKED] || 0),
    };
  }
}

