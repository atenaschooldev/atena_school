import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { MembershipsRepository, MembershipEntity } from '../domain/memberships.repository.interface';

@Injectable()
export class PrismaMembershipsRepository extends MembershipsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(filters?: { status?: string; academicYear?: string; search?: string }): Promise<MembershipEntity[]> {
    const where: Record<string, unknown> = {};
    if (filters?.status && filters.status !== 'all') where.status = filters.status;
    if (filters?.academicYear && filters.academicYear !== 'all') where.academicYear = filters.academicYear;

    if (filters?.search) {
      const search = filters.search.trim();
      (where as any).OR = [
        { taxCode: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.annualMembership.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
            first_name: true,
            last_name: true,
            email: true,
            tax_code: true,
          },
        },
        booking: {
          select: {
            id: true,
            studentName: true,
            purchaserName: true,
            studentEmail: true,
            purchaserEmail: true,
            studentTaxCode: true,
            purchaserTaxCode: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<MembershipEntity | null> {
    return this.prisma.annualMembership.findUnique({
      where: { id },
      include: {
        student: true,
        booking: true,
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<MembershipEntity> {
    return this.prisma.annualMembership.update({
      where: { id },
      data: { status },
    });
  }
}
