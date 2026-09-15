import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';
import { MembershipStatus, parseMembershipStatus, PaymentRecordStatus } from '@atena/api-types';

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
        studentName,
        student_name: studentName,
        studentEmail,
        student_email: studentEmail,
        studentTaxCode,
        student_tax_code: studentTaxCode,
      };
    });
  }

  async findOne(id: string) {
    const membership = await this.membershipsRepository.findById(id);
    if (!membership) throw new NotFoundException(`Membership ${id} not found`);
    return membership;
  }

  async updateStatus(id: string, status: number | string) {
    const numStatus = typeof status === 'number' ? status : parseMembershipStatus(status);
    const existing = await this.findOne(id);
    const updated = await this.membershipsRepository.updateStatus(id, numStatus);

    const sId = existing.studentId || existing.userId;
    const sTaxCode = existing.taxCode;

    if (numStatus === MembershipStatus.ACTIVE) {
      if (sId) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW() WHERE id = '${sId}'::uuid`
        ).catch(() => null);
      } else if (sTaxCode) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE students SET annual_fee_paid = true, annual_fee_paid_at = NOW() WHERE LOWER(tax_code) = LOWER('${sTaxCode}')`
        ).catch(() => null);
      }

      await this.prisma.$executeRawUnsafe(
        `UPDATE payments SET status = ${PaymentRecordStatus.SUCCEEDED}, paid_at = NOW() WHERE notes LIKE '%[membership_id:${id}]%'`
      ).catch(() => null);
    } else if (numStatus === MembershipStatus.REVOKED || numStatus === MembershipStatus.PENDING) {
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

    return updated;
  }

  async toggleStatus(id: string) {
    const existing = await this.findOne(id);
    const currentStatus = Number(existing.status);
    const newStatus = currentStatus === MembershipStatus.REVOKED ? MembershipStatus.ACTIVE : MembershipStatus.REVOKED;
    return this.updateStatus(id, newStatus);
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

