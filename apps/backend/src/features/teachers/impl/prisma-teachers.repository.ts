import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TeacherEntity } from '../domain/teacher.entity';
import { TeachersRepository } from '../domain/teachers.repository.interface';

@Injectable()
export class PrismaTeachersRepository implements TeachersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<TeacherEntity[]> {
    const list = await this.prisma.teacher.findMany({
      include: {
        user: true,
      },
    });

    return list.map((t) => ({
      teacherId: t.teacherId,
      subject: t.subject,
      experience: t.experience,
      status: t.status,
      hireDate: t.hireDate,
      email: t.user.email,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
    }));
  }

  async findOne(id: string): Promise<TeacherEntity | null> {
    const t = await this.prisma.teacher.findUnique({
      where: { teacherId: id },
      include: {
        user: true,
      },
    });
    if (!t) return null;

    return {
      teacherId: t.teacherId,
      subject: t.subject,
      experience: t.experience,
      status: t.status,
      hireDate: t.hireDate,
      email: t.user.email,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
    };
  }

  async create(data: {
    teacherId: string;
    subject?: string;
    experience?: string;
    status?: string;
    hireDate?: Date;
  }): Promise<TeacherEntity> {
    const t = await this.prisma.teacher.create({
      data: {
        teacherId: data.teacherId,
        subject: data.subject || null,
        experience: data.experience || null,
        status: data.status || 'active',
        hireDate: data.hireDate || new Date(),
      },
      include: {
        user: true,
      },
    });

    return {
      teacherId: t.teacherId,
      subject: t.subject,
      experience: t.experience,
      status: t.status,
      hireDate: t.hireDate,
      email: t.user.email,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
    };
  }

  async update(id: string, data: Partial<TeacherEntity>): Promise<TeacherEntity> {
    const updateData: any = {};
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.experience !== undefined) updateData.experience = data.experience;
    if (data.status !== undefined) updateData.status = data.status;

    const t = await this.prisma.teacher.update({
      where: { teacherId: id },
      data: updateData,
      include: {
        user: true,
      },
    });

    return {
      teacherId: t.teacherId,
      subject: t.subject,
      experience: t.experience,
      status: t.status,
      hireDate: t.hireDate,
      email: t.user.email,
      firstName: t.user.firstName,
      lastName: t.user.lastName,
    };
  }

  async delete(id: string): Promise<void> {
    // Мягкое удаление пользователя
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
