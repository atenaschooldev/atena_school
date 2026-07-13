import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AttendanceEntity } from '../domain/attendance.entity';
import { AttendanceRepository } from '../domain/attendance.repository.interface';

@Injectable()
export class PrismaAttendanceRepository implements AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBySchedule(scheduleId: string): Promise<AttendanceEntity[]> {
    const list = await this.prisma.attendance.findMany({
      where: { scheduleId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        teacher: {
          include: {
            user: true,
          },
        },
      },
    });

    return list.map((a) => this.mapToEntity(a));
  }

  async saveMany(
    scheduleId: string,
    records: {
      studentId: string;
      status: string;
      note?: string | null;
      date?: Date;
    }[],
    teacherId: string,
  ): Promise<AttendanceEntity[]> {
    return this.prisma.$transaction(async (tx) => {
      const studentIds = records.map((r) => r.studentId);

      // Удаляем старые записи по этой паре scheduleId + studentId
      await tx.attendance.deleteMany({
        where: {
          scheduleId,
          studentId: { in: studentIds },
        },
      });

      const created = [];
      for (const record of records) {
        const item = await tx.attendance.create({
          data: {
            scheduleId,
            studentId: record.studentId,
            teacherId,
            status: record.status,
            note: record.note || null,
            date: record.date || new Date(),
          },
          include: {
            student: {
              include: {
                user: true,
              },
            },
            teacher: {
              include: {
                user: true,
              },
            },
          },
        });
        created.push(item);
      }

      return created.map((a) => this.mapToEntity(a));
    });
  }

  private mapToEntity(a: any): AttendanceEntity {
    let studentName = 'Unknown Student';
    if (a.student && a.student.user) {
      studentName = `${a.student.user.firstName} ${a.student.user.lastName}`;
    }

    let teacherName = 'Unknown Teacher';
    if (a.teacher && a.teacher.user) {
      teacherName = `${a.teacher.user.firstName} ${a.teacher.user.lastName}`;
    }

    return {
      id: a.id,
      studentId: a.studentId,
      teacherId: a.teacherId,
      scheduleId: a.scheduleId,
      status: a.status,
      note: a.note,
      date: a.date,
      studentName,
      teacherName,
    };
  }
}
