import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ScheduleEntity } from '../domain/schedule.entity';
import { SchedulesRepository } from '../domain/schedules.repository.interface';
import { BookingPaymentStatus, LessonStatus, LessonLocationType, parseLessonStatus } from '@atena/api-types';

@Injectable()
export class PrismaSchedulesRepository implements SchedulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters?: {
    courseId?: string;
    teacherId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ScheduleEntity[]> {
    // Fetch directly from `lessons` table in PostgreSQL database
    const rawLessons = await this.prisma.lesson.findMany({
      include: {
        booking: {
          include: {
            course: true,
          },
        },
        teacher: true,
      },
      where: {
        ...(filters?.teacherId ? { teacherId: filters.teacherId } : {}),
        ...(filters?.courseId ? { booking: { courseId: filters.courseId } } : {}),
        ...(filters?.startDate || filters?.endDate
          ? {
              startsAt: {
                ...(filters.startDate ? { gte: filters.startDate } : {}),
                ...(filters.endDate ? { lte: filters.endDate } : {}),
              },
            }
          : {}),
      },
      orderBy: { startsAt: 'asc' },
    });

    return rawLessons.map((l) => ({
      id: l.id,
      courseId: l.booking?.courseId || '',
      teacherId: l.teacherId || '',
      room: l.teacherNotes || null,
      status: l.status,
      startDate: l.startsAt,
      endDate: l.endsAt,
      lessonType: l.locationType === LessonLocationType.ONLINE ? 'online' : 'offline',
      meetingUrl: l.meetingLink || null,
      courseName: l.booking?.courseName || l.booking?.course?.name || 'Corso',
      teacherName: l.teacher?.fullName || undefined,
    }));
  }

  async findOne(id: string): Promise<ScheduleEntity | null> {
    const l = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        booking: { include: { course: true } },
        teacher: true,
      },
    });

    if (l) {
      return {
        id: l.id,
        courseId: l.booking?.courseId || '',
        teacherId: l.teacherId || '',
        room: l.teacherNotes || null,
        status: l.status,
        startDate: l.startsAt,
        endDate: l.endsAt,
        lessonType: l.locationType === LessonLocationType.ONLINE ? 'online' : 'offline',
        meetingUrl: l.meetingLink || null,
        courseName: l.booking?.courseName || 'Corso',
        teacherName: l.teacher?.fullName || undefined,
      };
    }

    return null;
  }

  async create(data: {
    courseId: string;
    teacherId: string;
    room?: string | null;
    status?: number | string;
    startDate: Date;
    endDate: Date;
    lessonType?: string;
    meetingUrl?: string | null;
  }): Promise<ScheduleEntity> {
    let booking = await this.prisma.booking.findFirst({
      where: { courseId: data.courseId },
    });
    if (!booking) {
      booking = await this.prisma.booking.findFirst();
    }
    if (!booking) {
      booking = await this.prisma.booking.create({
        data: {
          courseId: data.courseId,
          courseName: 'Corso Sistema',
          purchaserName: 'Sistema Atena',
          studentName: 'Sistema Atena',
          purchaserEmail: 'admin@atenaschool.com',
          paymentStatus: BookingPaymentStatus.PAID,
        },
      });
    }

    const l = await this.prisma.lesson.create({
      data: {
        bookingId: booking.id,
        teacherId: data.teacherId || null,
        startsAt: data.startDate,
        endsAt: data.endDate,
        status: data.status !== undefined ? parseLessonStatus(data.status) : LessonStatus.SCHEDULED,
        locationType: data.lessonType === 'online' ? LessonLocationType.ONLINE : LessonLocationType.IN_PERSON,
        meetingLink: data.meetingUrl || null,
        teacherNotes: data.room ? (data.room.startsWith('Aula') ? data.room : `Aula ${data.room}`) : null,
      },
      include: {
        booking: true,
        teacher: true,
      },
    });

    return {
      id: l.id,
      courseId: data.courseId,
      teacherId: data.teacherId,
      room: data.room || null,
      status: l.status,
      startDate: l.startsAt,
      endDate: l.endsAt,
      lessonType: data.lessonType || 'offline',
      meetingUrl: data.meetingUrl || null,
      courseName: l.booking?.courseName || 'Corso',
      teacherName: l.teacher?.fullName || undefined,
    };
  }

  async createMany(data: {
    courseId: string;
    teacherId: string;
    room?: string | null;
    status?: number | string;
    startDate: Date;
    endDate: Date;
    lessonType?: string;
    meetingUrl?: string | null;
  }[]): Promise<ScheduleEntity[]> {
    return Promise.all(data.map((item) => this.create(item)));
  }

  async update(id: string, data: Partial<ScheduleEntity>): Promise<ScheduleEntity> {
    const existingLesson = await this.prisma.lesson.findUnique({ where: { id } });

    if (existingLesson) {
      const updateData: any = {};
      if (data.startDate !== undefined) updateData.startsAt = data.startDate;
      if (data.endDate !== undefined) updateData.endsAt = data.endDate;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
      if (data.lessonType !== undefined) updateData.locationType = data.lessonType === 'online' ? LessonLocationType.ONLINE : LessonLocationType.IN_PERSON;
      if (data.meetingUrl !== undefined) updateData.meetingLink = data.meetingUrl;
      if (data.room !== undefined) updateData.teacherNotes = data.room ? (data.room.startsWith('Aula') ? data.room : `Aula ${data.room}`) : null;

      const l = await this.prisma.lesson.update({
        where: { id },
        data: updateData,
        include: { booking: true, teacher: true },
      });

      return {
        id: l.id,
        courseId: l.booking?.courseId || '',
        teacherId: l.teacherId || '',
        room: l.teacherNotes || null,
        status: l.status,
        startDate: l.startsAt,
        endDate: l.endsAt,
        lessonType: l.locationType === LessonLocationType.ONLINE ? 'online' : 'offline',
        meetingUrl: l.meetingLink || null,
        courseName: l.booking?.courseName || 'Corso',
        teacherName: l.teacher?.fullName || undefined,
      };
    }

    const updateData: any = {};
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
    if (data.room !== undefined) updateData.teacherNotes = data.room;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.startsAt = data.startDate;
    if (data.endDate !== undefined) updateData.endsAt = data.endDate;
    if (data.lessonType !== undefined) updateData.locationType = data.lessonType === 'online' ? LessonLocationType.ONLINE : LessonLocationType.IN_PERSON;
    if (data.meetingUrl !== undefined) updateData.meetingLink = data.meetingUrl;

    const l = await this.prisma.lesson.update({
      where: { id },
      data: updateData,
      include: {
        booking: { include: { course: true } },
        teacher: true,
      },
    });

    return {
      id: l.id,
      courseId: l.booking?.courseId || '',
      teacherId: l.teacherId || '',
      room: l.teacherNotes || null,
      status: l.status,
      startDate: l.startsAt,
      endDate: l.endsAt,
      lessonType: l.locationType === LessonLocationType.ONLINE ? 'online' : 'offline',
      meetingUrl: l.meetingLink || null,
      courseName: l.booking?.courseName || 'Corso',
      teacherName: l.teacher?.fullName || undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({ where: { id } });
  }
}
