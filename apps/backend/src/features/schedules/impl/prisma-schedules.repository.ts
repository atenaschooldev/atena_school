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
      orderBy: { startsAt: 'asc' },
    });

    const lessonEntities: ScheduleEntity[] = rawLessons.map((l) => ({
      id: l.id,
      courseId: l.booking?.courseId || 'd5e6f7a8-b9c0-1234-def0-567890123456',
      teacherId: l.teacherId || '',
      room: l.teacherNotes || (l.locationType === 'in_person' || l.locationType === 'offline' ? 'Aula 1' : null),
      status: l.status || 'scheduled',
      startDate: l.startsAt,
      endDate: l.endsAt,
      lessonType: l.locationType === 'online' ? 'online' : 'offline',
      meetingUrl: l.meetingLink || (l.locationType === 'online' ? 'https://meet.google.com/eipass-coding-live' : null),
      courseName: l.booking?.courseName || l.booking?.course?.name || 'EIPASS Coding',
      teacherName: l.teacher?.fullName || undefined,
    }));

    // Also fetch from `schedules` table to combine if any exist
    const rawSchedules = await this.prisma.schedule.findMany({
      include: { course: true },
      orderBy: { startDate: 'asc' },
    });

    const teacherIds = rawSchedules.map((s) => s.teacherId).filter(Boolean);
    const teachersList = teacherIds.length
      ? await this.prisma.teacher.findMany({ where: { teacherId: { in: teacherIds } } })
      : [];
    const teacherMap = new Map(teachersList.map((t) => [t.teacherId, t.fullName]));

    const scheduleEntities: ScheduleEntity[] = rawSchedules.map((s) => ({
      id: s.id,
      courseId: s.courseId,
      teacherId: s.teacherId,
      room: s.room,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      lessonType: s.lessonType,
      meetingUrl: s.meetingUrl,
      courseName: s.course?.name || 'Corso',
      teacherName: teacherMap.get(s.teacherId) || undefined,
    }));

    return [...lessonEntities, ...scheduleEntities];
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
        lessonType: l.locationType === 'online' ? 'online' : 'offline',
        meetingUrl: l.meetingLink || null,
        courseName: l.booking?.courseName || 'Corso',
        teacherName: l.teacher?.fullName || undefined,
      };
    }

    const s = await this.prisma.schedule.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!s) return null;
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
      courseName: s.course?.name || 'Corso',
      teacherName: undefined,
    };
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
          purchaserEmail: 'admin@atenaschool.it',
          paymentStatus: 'succeeded',
        },
      });
    }

    const l = await this.prisma.lesson.create({
      data: {
        bookingId: booking.id,
        teacherId: data.teacherId || null,
        startsAt: data.startDate,
        endsAt: data.endDate,
        status: data.status || 'scheduled',
        locationType: data.lessonType === 'online' ? 'online' : 'in_person',
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
    status?: string;
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
      if (data.lessonType !== undefined) updateData.locationType = data.lessonType === 'online' ? 'online' : 'in_person';
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
        lessonType: l.locationType === 'online' ? 'online' : 'offline',
        meetingUrl: l.meetingLink || null,
        courseName: l.booking?.courseName || 'Corso',
        teacherName: l.teacher?.fullName || undefined,
      };
    }

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
      courseName: s.course?.name || 'Corso',
      teacherName: undefined,
    };
  }

  async delete(id: string): Promise<void> {
    const existingLesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (existingLesson) {
      await this.prisma.lesson.delete({ where: { id } });
    } else {
      await this.prisma.schedule.delete({ where: { id } });
    }
  }
}
