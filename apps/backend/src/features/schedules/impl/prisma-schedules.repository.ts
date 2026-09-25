import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ScheduleEntity } from '../domain/schedule.entity';
import { SchedulesRepository } from '../domain/schedules.repository.interface';
import { BookingPaymentStatus, LessonStatus, LessonLocationType, parseLessonStatus } from '@atena/api-types';

const toBigInt = (val: any): bigint | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  try {
    return BigInt(val);
  } catch {
    return undefined;
  }
};

@Injectable()
export class PrismaSchedulesRepository implements SchedulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(filters?: {
    courseId?: string;
    teacherId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ScheduleEntity[]> {
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
        ...(filters?.teacherId ? { teacherId: toBigInt(filters.teacherId) } : {}),
        ...(filters?.courseId ? { courseId: toBigInt(filters.courseId) } : {}),
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
      id: l.id.toString(),
      courseId: (l.booking?.courseId ?? l.courseId)?.toString() || '',
      teacherId: l.teacherId?.toString() || '',
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
    const bigId = toBigInt(id);
    if (bigId === undefined) return null;

    const l = await this.prisma.lesson.findUnique({
      where: { id: bigId },
      include: {
        booking: { include: { course: true } },
        teacher: true,
      },
    });

    if (l) {
      return {
        id: l.id.toString(),
        courseId: (l.booking?.courseId ?? l.courseId)?.toString() || '',
        teacherId: l.teacherId?.toString() || '',
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
    const bigCourseId = toBigInt(data.courseId);
    const bigTeacherId = toBigInt(data.teacherId);

    let booking = bigCourseId ? await this.prisma.booking.findFirst({
      where: { courseId: bigCourseId },
    }) : null;

    if (!booking) {
      booking = await this.prisma.booking.findFirst();
    }
    if (!booking) {
      booking = await this.prisma.booking.create({
        data: {
          courseId: bigCourseId || null,
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
        courseId: bigCourseId || null,
        teacherId: bigTeacherId || null,
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
      id: l.id.toString(),
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
    const bigId = toBigInt(id);
    if (bigId === undefined) throw new Error(`Invalid Lesson ID ${id}`);

    const existingLesson = await this.prisma.lesson.findUnique({ where: { id: bigId } });

    if (existingLesson) {
      const updateData: any = {};
      if (data.startDate !== undefined) updateData.startsAt = data.startDate;
      if (data.endDate !== undefined) updateData.endsAt = data.endDate;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.teacherId !== undefined) updateData.teacherId = toBigInt(data.teacherId) || null;
      if (data.lessonType !== undefined) updateData.locationType = data.lessonType === 'online' ? LessonLocationType.ONLINE : LessonLocationType.IN_PERSON;
      if (data.meetingUrl !== undefined) updateData.meetingLink = data.meetingUrl;
      if (data.room !== undefined) updateData.teacherNotes = data.room ? (data.room.startsWith('Aula') ? data.room : `Aula ${data.room}`) : null;

      const l = await this.prisma.lesson.update({
        where: { id: bigId },
        data: updateData,
        include: { booking: true, teacher: true },
      });

      return {
        id: l.id.toString(),
        courseId: (l.booking?.courseId ?? l.courseId)?.toString() || '',
        teacherId: l.teacherId?.toString() || '',
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
    if (data.teacherId !== undefined) updateData.teacherId = toBigInt(data.teacherId) || null;
    if (data.room !== undefined) updateData.teacherNotes = data.room;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.startsAt = data.startDate;
    if (data.endDate !== undefined) updateData.endsAt = data.endDate;
    if (data.lessonType !== undefined) updateData.locationType = data.lessonType === 'online' ? LessonLocationType.ONLINE : LessonLocationType.IN_PERSON;
    if (data.meetingUrl !== undefined) updateData.meetingLink = data.meetingUrl;

    const l = await this.prisma.lesson.update({
      where: { id: bigId },
      data: updateData,
      include: {
        booking: { include: { course: true } },
        teacher: true,
      },
    });

    return {
      id: l.id.toString(),
      courseId: (l.booking?.courseId ?? l.courseId)?.toString() || '',
      teacherId: l.teacherId?.toString() || '',
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
    const bigId = toBigInt(id);
    if (bigId !== undefined) {
      await this.prisma.lesson.delete({ where: { id: bigId } });
    }
  }
}
