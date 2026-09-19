import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { calculateLessonDates } from '@atena/utils';
import { GroupStatus, GroupMemberStatus, LessonStatus, LessonLocationType } from '@atena/api-types';
import { CreateGroupDto, UpdateGroupDto, AddGroupMemberDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async listGroups(params?: {
    courseId?: string;
    teacherId?: string;
    status?: number;
    search?: string;
  }) {
    const where: any = {};
    if (params?.courseId) where.courseId = params.courseId;
    if (params?.teacherId) where.teacherId = params.teacherId;
    if (params?.status) where.status = params.status;
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { course: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const groups = await this.prisma.group.findMany({
      where,
      include: {
        course: { select: { id: true, name: true, category: true, billingType: true } },
        teacher: { select: { teacherId: true, fullName: true, photoUrl: true } },
        members: {
          include: {
            student: {
              select: { id: true, first_name: true, last_name: true, full_name: true, email: true, phone: true, tax_code: true },
            },
          },
        },
        lessons: {
          select: { id: true, startsAt: true, endsAt: true, status: true },
          orderBy: { startsAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return groups.map((g) => this.mapGroupResponse(g));
  }

  async getGroup(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        course: true,
        teacher: true,
        members: {
          include: {
            student: true,
            booking: true,
          },
          orderBy: { joinedAt: 'asc' },
        },
        lessons: {
          include: {
            attendanceRecords: {
              include: { student: true },
            },
          },
          orderBy: { startsAt: 'asc' },
        },
      },
    });

    if (!group) throw new NotFoundException(`Group with ID ${id} not found`);
    return this.mapGroupResponse(group);
  }

  async createGroup(dto: CreateGroupDto) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException(`Course with ID ${dto.courseId} not found`);

    if (dto.teacherId) {
      const teacher = await this.prisma.teacher.findUnique({ where: { teacherId: dto.teacherId } });
      if (!teacher) throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
    }

    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        courseId: dto.courseId,
        teacherId: dto.teacherId || null,
        room: dto.room || null,
        maxStudents: dto.maxStudents || 8,
        status: dto.status || GroupStatus.RECRUITING,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        scheduleDays: dto.scheduleDays || [],
        startTime: dto.startTime,
        endTime: dto.endTime || null,
        notes: dto.notes || null,
      },
    });

    // Auto-generate initial lessons if requested and startDate is provided
    if (dto.generateLessons !== false && dto.startDate && dto.scheduleDays?.length > 0) {
      await this.generateLessonsForGroup(group.id, {
        startDate: dto.startDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        scheduleDays: dto.scheduleDays,
        courseCategory: course.category,
        totalLessons: course.totalLessons || 8,
        lessonDuration: course.lessonDurationMinutes || 60,
      });
    }

    return this.getGroup(group.id);
  }

  async updateGroup(id: string, dto: UpdateGroupDto) {
    const existing = await this.prisma.group.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Group with ID ${id} not found`);

    const updated = await this.prisma.group.update({
      where: { id },
      data: {
        name: dto.name !== undefined ? dto.name : existing.name,
        courseId: dto.courseId !== undefined ? dto.courseId : existing.courseId,
        teacherId: dto.teacherId !== undefined ? dto.teacherId : existing.teacherId,
        room: dto.room !== undefined ? dto.room : existing.room,
        maxStudents: dto.maxStudents !== undefined ? dto.maxStudents : existing.maxStudents,
        status: dto.status !== undefined ? dto.status : existing.status,
        startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : existing.startDate,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : existing.endDate,
        scheduleDays: dto.scheduleDays !== undefined ? dto.scheduleDays : existing.scheduleDays,
        startTime: dto.startTime !== undefined ? dto.startTime : existing.startTime,
        endTime: dto.endTime !== undefined ? dto.endTime : existing.endTime,
        notes: dto.notes !== undefined ? dto.notes : existing.notes,
      },
    });

    return this.getGroup(updated.id);
  }

  async deleteGroup(id: string) {
    const existing = await this.prisma.group.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Group with ID ${id} not found`);

    await this.prisma.group.delete({ where: { id } });
    return { success: true, id };
  }

  async addMember(groupId: string, dto: AddGroupMemberDto) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true, lessons: true },
    });
    if (!group) throw new NotFoundException(`Group with ID ${groupId} not found`);

    if (group.members.length >= group.maxStudents) {
      throw new BadRequestException(`Group is full (${group.members.length}/${group.maxStudents})`);
    }

    const student = await this.prisma.students.findUnique({ where: { id: dto.studentId } });
    if (!student) throw new NotFoundException(`Student with ID ${dto.studentId} not found`);

    const existingMember = await this.prisma.groupMember.findUnique({
      where: {
        groupId_studentId: {
          groupId,
          studentId: dto.studentId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException(`Student is already enrolled in this group`);
    }

    const member = await this.prisma.groupMember.create({
      data: {
        groupId,
        studentId: dto.studentId,
        bookingId: dto.bookingId || null,
        status: dto.status || GroupMemberStatus.ACTIVE,
      },
    });

    // Link booking to group if bookingId was provided
    if (dto.bookingId) {
      await this.prisma.booking.update({
        where: { id: dto.bookingId },
        data: { groupId },
      });
    }

    // Auto-create attendance records for all upcoming lessons of this group
    for (const lesson of group.lessons) {
      await this.prisma.attendanceRecord.upsert({
        where: {
          lessonId_studentId: {
            lessonId: lesson.id,
            studentId: dto.studentId,
          },
        },
        update: {},
        create: {
          lessonId: lesson.id,
          studentId: dto.studentId,
          bookingId: dto.bookingId || null,
          status: 1, // PENDING
        },
      });
    }

    return member;
  }

  async removeMember(groupId: string, studentId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: {
        groupId_studentId: {
          groupId,
          studentId,
        },
      },
    });

    if (!member) throw new NotFoundException(`Member not found in group`);

    if (member.bookingId) {
      await this.prisma.booking.update({
        where: { id: member.bookingId },
        data: { groupId: null },
      });
    }

    await this.prisma.groupMember.delete({
      where: { id: member.id },
    });

    return { success: true, groupId, studentId };
  }

  private async generateLessonsForGroup(
    groupId: string,
    params: {
      startDate: string;
      startTime: string;
      endTime?: string | null;
      scheduleDays: number[];
      courseCategory?: any;
      totalLessons: number;
      lessonDuration: number;
    },
  ) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return;

    const dates = calculateLessonDates(
      params.startDate,
      params.startTime,
      params.courseCategory,
      params.scheduleDays,
      params.lessonDuration,
      params.startTime,
      params.endTime || null,
      1, // FIXED schedule
      params.totalLessons,
    );

    for (const d of dates) {
      await this.prisma.lesson.create({
        data: {
          groupId,
          courseId: group.courseId,
          teacherId: group.teacherId || null,
          startsAt: new Date(d.startsAt),
          endsAt: new Date(d.endsAt),
          status: LessonStatus.SCHEDULED,
          locationType: LessonLocationType.IN_PERSON,
        },
      });
    }
  }

  private mapGroupResponse(g: any) {
    return {
      id: g.id,
      createdAt: g.createdAt instanceof Date ? g.createdAt.toISOString() : g.createdAt,
      updatedAt: g.updatedAt instanceof Date ? g.updatedAt.toISOString() : g.updatedAt,
      name: g.name,
      courseId: g.courseId,
      courseName: g.course?.name || null,
      course: g.course,
      teacherId: g.teacherId,
      teacherName: g.teacher?.fullName || null,
      teacher: g.teacher,
      room: g.room,
      maxStudents: g.maxStudents,
      currentEnrolledCount: g.members?.length || 0,
      status: g.status,
      startDate: g.startDate instanceof Date ? g.startDate.toISOString() : g.startDate,
      endDate: g.endDate instanceof Date ? g.endDate.toISOString() : g.endDate,
      scheduleDays: g.scheduleDays || [],
      startTime: g.startTime,
      endTime: g.endTime,
      notes: g.notes,
      members: g.members?.map((m: any) => ({
        id: m.id,
        groupId: m.groupId,
        studentId: m.studentId,
        bookingId: m.bookingId,
        joinedAt: m.joinedAt instanceof Date ? m.joinedAt.toISOString() : m.joinedAt,
        status: m.status,
        student: m.student
          ? {
              id: m.student.id,
              fullName: m.student.full_name || `${m.student.first_name || ''} ${m.student.last_name || ''}`.trim(),
              email: m.student.email,
              phone: m.student.phone,
              taxCode: m.student.tax_code,
            }
          : null,
      })) || [],
      lessons: g.lessons?.map((l: any) => ({
        id: l.id,
        startsAt: l.startsAt instanceof Date ? l.startsAt.toISOString() : l.startsAt,
        endsAt: l.endsAt instanceof Date ? l.endsAt.toISOString() : l.endsAt,
        status: l.status,
        attendanceRecords: l.attendanceRecords,
      })) || [],
      totalLessonsCount: g.lessons?.length || 0,
    };
  }
}
