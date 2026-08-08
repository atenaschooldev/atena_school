import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipsRepository: MembershipsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(status?: string, academicYear?: string, search?: string) {
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

  async updateStatus(id: string, status: string) {
    const existing = await this.findOne(id);
    const updated = await this.membershipsRepository.updateStatus(id, status);

    const sId = existing.studentId || existing.userId;
    const sTaxCode = existing.taxCode;

    if (status === 'active') {
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
        `UPDATE payments SET status = 'succeeded', paid_at = NOW() WHERE notes LIKE '%[membership_id:${id}]%'`
      ).catch(() => null);
    } else if (status === 'revoked' || status === 'pending') {
      if (sId) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE students SET annual_fee_paid = false WHERE id = '${sId}'::uuid`
        ).catch(() => null);
      } else if (sTaxCode) {
        await this.prisma.$executeRawUnsafe(
          `UPDATE students SET annual_fee_paid = false WHERE LOWER(tax_code) = LOWER('${sTaxCode}')`
        ).catch(() => null);
      }

      if (status === 'pending') {
        await this.prisma.$executeRawUnsafe(
          `UPDATE payments SET status = 'pending' WHERE notes LIKE '%[membership_id:${id}]%'`
        ).catch(() => null);
      }
    }

    return updated;
  }

  async toggleStatus(id: string) {
    const existing = await this.findOne(id);
    const currentStatus = (existing.status || 'active').toLowerCase();
    const newStatus = currentStatus === 'revoked' ? 'active' : 'revoked';
    return this.updateStatus(id, newStatus);
  }

  async getStats() {
    const all = await this.prisma.$queryRawUnsafe<{ status: string; count: string }[]>(
      `SELECT LOWER(status) as status, COUNT(*) as count FROM annual_memberships GROUP BY LOWER(status)`
    ).catch(() => [] as { status: string; count: string }[]);

    const byStatus = Object.fromEntries(all.map((r) => [r.status, Number(r.count)]));
    const total = all.reduce((s, r) => s + Number(r.count), 0);

    return {
      total,
      active: byStatus['active'] || 0,
      pending: byStatus['pending'] || 0,
      expiredOrRevoked: (byStatus['expired'] || 0) + (byStatus['revoked'] || 0),
    };
  }
}
