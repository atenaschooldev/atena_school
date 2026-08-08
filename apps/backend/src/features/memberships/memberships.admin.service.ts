import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipsRepository } from './domain/memberships.repository.interface';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly membershipsRepository: MembershipsRepository,
    private readonly prisma: PrismaService,
  ) {}

  findAll(status?: string, academicYear?: string, search?: string) {
    return this.membershipsRepository.findAll({ status, academicYear, search });
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
}
