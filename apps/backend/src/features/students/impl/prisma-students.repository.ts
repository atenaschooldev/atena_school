import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StudentEntity } from '../domain/student.entity';
import { StudentsRepository } from '../domain/students.repository.interface';

@Injectable()
export class PrismaStudentsRepository implements StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<StudentEntity[]> {
    const list = await this.prisma.student.findMany({
      include: {
        user: true,
      },
    });

    return list.map((s) => ({
      studentId: s.studentId,
      languageLevel: s.languageLevel,
      status: s.status,
      registrationDate: s.registrationDate,
      contractId: s.contractId,
      email: s.user.email,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
    }));
  }

  async findOne(id: string): Promise<StudentEntity | null> {
    const s = await this.prisma.student.findUnique({
      where: { studentId: id },
      include: {
        user: true,
      },
    });
    if (!s) return null;

    return {
      studentId: s.studentId,
      languageLevel: s.languageLevel,
      status: s.status,
      registrationDate: s.registrationDate,
      contractId: s.contractId,
      email: s.user.email,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
    };
  }

  async create(data: {
    studentId: string;
    languageLevel?: string;
    status?: string;
    registrationDate?: Date;
    contractId?: string;
  }): Promise<StudentEntity> {
    const s = await this.prisma.student.create({
      data: {
        studentId: data.studentId,
        languageLevel: data.languageLevel || 'A1',
        status: data.status || 'active',
        registrationDate: data.registrationDate || new Date(),
        contractId: data.contractId || null,
      },
      include: {
        user: true,
      },
    });

    return {
      studentId: s.studentId,
      languageLevel: s.languageLevel,
      status: s.status,
      registrationDate: s.registrationDate,
      contractId: s.contractId,
      email: s.user.email,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
    };
  }

  async update(id: string, data: Partial<StudentEntity>): Promise<StudentEntity> {
    const updateData: any = {};
    if (data.languageLevel !== undefined) updateData.languageLevel = data.languageLevel;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.contractId !== undefined) updateData.contractId = data.contractId;

    const s = await this.prisma.student.update({
      where: { studentId: id },
      data: updateData,
      include: {
        user: true,
      },
    });

    return {
      studentId: s.studentId,
      languageLevel: s.languageLevel,
      status: s.status,
      registrationDate: s.registrationDate,
      contractId: s.contractId,
      email: s.user.email,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
    };
  }

  async delete(id: string): Promise<void> {
    // Каскадно удаляем пользователя (это также удалит профиль студента через onDelete: Cascade)
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
