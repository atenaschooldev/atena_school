import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { MembershipsRepository, MembershipEntity } from '../domain/memberships.repository.interface';
import { parseMembershipStatus } from '@atena/api-types';

@Injectable()
export class PrismaMembershipsRepository extends MembershipsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(filters?: { status?: number | string; academicYear?: string; search?: string }): Promise<MembershipEntity[]> {
    const where: Record<string, unknown> = {};
    if (filters?.status !== undefined && filters.status !== 'all' && filters.status !== '') {
      where.status = typeof filters.status === 'number' ? filters.status : parseMembershipStatus(filters.status);
    }
    if (filters?.academicYear && filters.academicYear !== 'all') where.academicYear = filters.academicYear;

    if (filters?.search) {
      const search = filters.search.trim();
      (where as any).OR = [
        { taxCode: { contains: search, mode: 'insensitive' } },
        { student: { is: { full_name: { contains: search, mode: 'insensitive' } } } },
        { student: { is: { email: { contains: search, mode: 'insensitive' } } } },
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
      },
    });
  }

  async findById(id: string): Promise<MembershipEntity | null> {
    return this.prisma.annualMembership.findUnique({
      where: { id },
      include: {
        student: true,
      },
    });
  }

  async updateStatus(id: string, status: number | string): Promise<MembershipEntity> {
    const numericStatus = typeof status === 'number' ? status : parseMembershipStatus(status);
    return this.prisma.annualMembership.update({
      where: { id },
      data: { status: numericStatus },
    });
  }

  async delete(id: string): Promise<MembershipEntity> {
    return this.prisma.annualMembership.delete({
      where: { id },
    });
  }
}

