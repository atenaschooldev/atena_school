import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ScheduleEntity } from '../domain/schedule.entity';
import { SchedulesRepository } from '../domain/schedules.repository.interface';

@Injectable()
export class PrismaSchedulesRepository implements SchedulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters?: {
    courseId?: string;
    teacherId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ScheduleEntity[]> {
    const where: any = {};
    if (filters?.courseId) where.courseId = filters.courseId;
    if (filters?.teacherId) where.teacherId = filters.teacherId;
    if (filters?.startDate || filters?.endDate) {
      where.startDate = {};
      if (filters.startDate) where.startDate.gte = filters.startDate;
      if (filters.endDate) where.startDate.lte = filters.endDate;
    }

    const list = await this.prisma.schedule.findMany({
      where,
      include: { course: true },
      orderBy: { startDate: 'asc' },
    });

    return list.map((s) => this.mapToEntity(s));
  }

  async findOne(id: string): Promise<ScheduleEntity | null> {
    const s = await this.prisma.schedule.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!s) return null;
    return this.mapToEntity(s);
  }

  async create(data: {
    courseId: string;
    teacherId: string;
    room?: string | null;
    status?: string;
    startDate: Date;
    endDate: Date;
    lessonType?: string;
    meetingUrl?: string | null;
  }): Promise<ScheduleEntity> {
    const s = await this.prisma.schedule.create({
      data: {
        courseId: data.courseId,
        teacherId: data.teacherId,
        room: data.room || null,
        status: data.status || 'scheduled',
        startDate: data.startDate,
        endDate: data.endDate,
        lessonType: data.lessonType || 'offline',
        meetingUrl: data.meetingUrl || null,
      },
      include: { course: true },
    });
    return this.mapToEntity(s);
  }

  async createMany(data: {
    courseId: string;
    teacherId: string;
    room?: string | null;
    status?: string;
    startDate: Date;
    endDate: Date;
    lessonType?: string;
    meetingUrl?: string | null;
  }[]): Promise<ScheduleEntity[]> {
    const created = await Promise.all(
      data.map((item) =>
        this.prisma.schedule.create({
          data: {
            courseId: item.courseId,
            teacherId: item.teacherId,
            room: item.room || null,
            status: item.status || 'scheduled',
            startDate: item.startDate,
            endDate: item.endDate,
            lessonType: item.lessonType || 'offline',
            meetingUrl: item.meetingUrl || null,
          },
          include: { course: true },
        }),
      ),
    );
    return created.map((s) => this.mapToEntity(s));
  }

  async update(id: string, data: Partial<ScheduleEntity>): Promise<ScheduleEntity> {
    const updateData: any = {};
    if (data.courseId !== undefined) updateData.courseId = data.courseId;
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
    if (data.room !== undefined) updateData.room = data.room;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.lessonType !== undefined) updateData.lessonType = data.lessonType;
    if (data.meetingUrl !== undefined) updateData.meetingUrl = data.meetingUrl;

    const s = await this.prisma.schedule.update({
      where: { id },
      data: updateData,
      include: { course: true },
    });
    return this.mapToEntity(s);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.schedule.delete({ where: { id } });
  }

  private mapToEntity(s: any): ScheduleEntity {
    return {
      id: s.id,
      courseId: s.courseId,
      teacherId: s.teacherId,
      room: s.room,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      lessonType: s.lessonType,
      meetingUrl: s.meetingUrl,
      courseName: s.course?.name || 'Unknown Course',
      teacherName: s.teacherName || null,
    };
  }
}
