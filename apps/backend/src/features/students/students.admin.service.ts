import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface UpdateStudentDto {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  taxCode?: string;
  birthDate?: string;
  languageLevel?: string;
  annualFeePaid?: boolean;
}

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    search?: string;
    annualFeePaid?: boolean;
    languageLevel?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(filters?.page || 1));
    const limit = filters?.limit ? Math.min(100, Math.max(1, Number(filters.limit))) : undefined;
    const skip = limit ? (page - 1) * limit : undefined;
    const search = filters?.search?.trim();

    const where: any = {};
    if (filters?.annualFeePaid !== undefined) {
      where.annual_fee_paid = filters.annualFeePaid;
    }
    if (filters?.languageLevel) {
      where.language_level = filters.languageLevel;
    }
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { tax_code: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (limit) {
      const [total, items] = await Promise.all([
        this.prisma.students.count({ where }),
        this.prisma.students.findMany({
          where,
          orderBy: { registration_date: 'desc' },
          skip,
          take: limit,
        }),
      ]);
      return { items, total, page, limit };
    }

    const items = await this.prisma.students.findMany({
      where,
      orderBy: { registration_date: 'desc' },
    });
    return items;
  }

  async findOne(id: string) {
    const student = await this.prisma.students.findUnique({
      where: { id },
    });
    if (!student) throw new NotFoundException(`Student ${id} not found`);

    const bookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { studentTaxCode: student.tax_code || undefined },
          { purchaserTaxCode: student.tax_code || undefined },
        ],
      },
    }).catch(() => []);

    const memberships = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM annual_memberships WHERE student_id = '${id}'::uuid OR LOWER(tax_code) = LOWER('${student.tax_code || ''}')`
    ).catch(() => []);

    return {
      ...student,
      bookings,
      memberships,
    };
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);

    const updateData: any = {};
    if (dto.fullName !== undefined) updateData.full_name = dto.fullName;
    if (dto.firstName !== undefined) updateData.first_name = dto.firstName;
    if (dto.lastName !== undefined) updateData.last_name = dto.lastName;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.taxCode !== undefined) updateData.tax_code = dto.taxCode;
    if (dto.birthDate !== undefined) updateData.birth_date = dto.birthDate ? new Date(dto.birthDate) : null;
    if (dto.languageLevel !== undefined) updateData.language_level = dto.languageLevel;
    if (dto.annualFeePaid !== undefined) {
      updateData.annual_fee_paid = dto.annualFeePaid;
      if (dto.annualFeePaid) updateData.annual_fee_paid_at = new Date();
    }

    return this.prisma.students.update({
      where: { id },
      data: updateData,
    });
  }
}
