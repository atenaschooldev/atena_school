import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BookingPaymentStatus, LessonAttendance, LessonStatus, parseLessonAttendance } from '@atena/api-types';

function toBigInt(val: any): bigint | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  try {
    return BigInt(val);
  } catch {
    return undefined;
  }
}

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDailyAttendance(dateStr?: string, courseId?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bigCourseId = toBigInt(courseId);

    const lessons = await this.prisma.lesson.findMany({
      where: {
        startsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(bigCourseId
          ? {
              OR: [
                { courseId: bigCourseId },
                { booking: { courseId: bigCourseId } },
                { group: { courseId: bigCourseId } },
              ],
            }
          : {}),
      },
      include: {
        booking: true,
        teacher: true,
        group: {
          include: {
            course: true,
            members: {
              include: {
                student: true,
                booking: true,
              },
            },
          },
        },
        attendanceRecords: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    const lessonItems = lessons.map((l) => {
      const isGroup = !!l.groupId;
      const b = l.booking;
      const grp = l.group;

      const record = l.attendanceRecords[0] || null;
      const bookingPaymentStatus = b?.paymentStatus ?? BookingPaymentStatus.PAID;

      // Business rule: show quick payment dialog when student attended but hasn't paid (for individual)
      const requiresPaymentOnAttendance = !isGroup && bookingPaymentStatus !== BookingPaymentStatus.PAID;

      // Build group members attendance list if group lesson
      const groupMembersList = isGroup && grp?.members
        ? grp.members.map((m) => {
            const studentRecord = l.attendanceRecords.find((ar) => ar.studentId === m.studentId) || null;
            const studentPaymentStatus = m.booking?.paymentStatus ?? BookingPaymentStatus.PAID;
            return {
              student_id: m.studentId,
              student_name: m.student?.full_name || `${m.student?.first_name || ''} ${m.student?.last_name || ''}`.trim() || 'Studente',
              student_email: m.student?.email || '',
              student_phone: m.student?.phone || '',
              booking_id: m.bookingId,
              payment_status: studentPaymentStatus,
              attendance_status: studentRecord ? studentRecord.status : LessonAttendance.PENDING,
              attendance_record_id: studentRecord?.id || null,
              notes: studentRecord?.notes || null,
            };
          })
        : [];

      const courseName = grp?.course?.name || grp?.name || b?.courseName || 'Lezione';
      const studentDisplayName = isGroup
        ? `${grp?.name || 'Gruppo'} (${groupMembersList.length} studenti)`
        : (b?.studentName || b?.purchaserName || 'Studente');

      return {
        id: l.id ? l.id.toString() : '',
        starts_at: l.startsAt,
        ends_at: l.endsAt,
        status: l.status,
        payment_status: bookingPaymentStatus,
        location_type: l.locationType,
        teacher_id: l.teacherId ? l.teacherId.toString() : null,
        teacher_name: l.teacher?.fullName || 'Docente',
        booking_id: l.bookingId,
        group_id: l.groupId ? l.groupId.toString() : null,
        group_name: grp?.name || null,
        is_group: isGroup,
        course_name: courseName,
        student_name: studentDisplayName,
        student_email: b?.studentEmail || b?.purchaserEmail || '',
        student_phone: b?.studentPhone || b?.purchaserPhone || '',
        purchaser_name: b?.purchaserName || '',
        purchaser_email: b?.purchaserEmail || '',
        payment_method: b?.paymentMethod || null,
        amount_paid: b?.amountPaid ? Number(b.amountPaid) : 0,
        billing_scheme: b?.billingScheme || 'full',
        booking_payment_status: bookingPaymentStatus,
        requires_payment_on_attendance: requiresPaymentOnAttendance,
        group_members: groupMembersList,
        attendance_record: record
          ? {
              id: record.id,
              status: record.status,
              marked_at: record.markedAt,
              marked_by: record.markedBy,
              notes: record.notes,
            }
          : null,
      };
    });

    const total = lessonItems.length;
    const present = lessonItems.filter((l) => {
      const s = l.attendance_record ? parseLessonAttendance(l.attendance_record.status) : LessonAttendance.PENDING;
      return s === LessonAttendance.PRESENT || s === LessonAttendance.LATE;
    }).length;
    const absent = lessonItems.filter((l) => {
      const s = l.attendance_record ? parseLessonAttendance(l.attendance_record.status) : LessonAttendance.PENDING;
      return s === LessonAttendance.ABSENT;
    }).length;
    const pending = lessonItems.filter((l) => {
      const s = l.attendance_record ? parseLessonAttendance(l.attendance_record.status) : LessonAttendance.PENDING;
      return s === LessonAttendance.PENDING;
    }).length;
    const pendingPayment = lessonItems.filter((l) => {
      const s = l.attendance_record ? parseLessonAttendance(l.attendance_record.status) : LessonAttendance.PENDING;
      return (s === LessonAttendance.PRESENT || s === LessonAttendance.LATE) && l.requires_payment_on_attendance;
    }).length;

    return {
      lessons: lessonItems,
      stats: { total, present, absent, pending, pendingPayment },
    };
  }

  async markAttendance(dto: {
    lessonId: string;
    bookingId?: string;
    studentId?: string;
    status: number | string;
    notes?: string;
    markedBy?: string;
  }) {
    const bigLessonId = toBigInt(dto.lessonId);
    if (bigLessonId === undefined) throw new NotFoundException(`Invalid Lesson ID ${dto.lessonId}`);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: bigLessonId },
      include: { booking: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson ${dto.lessonId} not found`);
    }

    const bookingId = dto.bookingId || lesson.bookingId;
    const studentId = dto.studentId || lesson.studentId || (lesson.booking as any)?.student_id || (lesson.booking as any)?.studentId;
    const numericStatus = parseLessonAttendance(dto.status);

    // Create or update attendance record
    const existing = await this.prisma.attendanceRecord.findFirst({
      where: {
        lessonId: bigLessonId,
        ...(studentId ? { studentId } : {}),
      },
    });

    let record;
    if (existing) {
      record = await this.prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: {
          status: numericStatus,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          markedBy: dto.markedBy || 'admin',
          markedAt: new Date(),
        },
      });
    } else {
      record = await this.prisma.attendanceRecord.create({
        data: {
          lessonId: bigLessonId,
          bookingId: bookingId || null,
          studentId: studentId || null,
          status: numericStatus,
          notes: dto.notes,
          markedBy: dto.markedBy || 'admin',
          markedAt: new Date(),
        },
      });
    }

    // Update Lesson status and attendance
    const isCompleted =
      numericStatus === LessonAttendance.PRESENT ||
      numericStatus === LessonAttendance.LATE ||
      numericStatus === LessonAttendance.ABSENT;
    await this.prisma.lesson.update({
      where: { id: bigLessonId },
      data: {
        attendance: numericStatus,
        status: isCompleted ? LessonStatus.COMPLETED : lesson.status,
      },
    });

    return record;
  }

  async getBookingStats(bookingId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { bookingId },
    });

    const total = records.length;
    const presentCount = records.filter((r) => {
      const s = parseLessonAttendance(r.status);
      return s === LessonAttendance.PRESENT || s === LessonAttendance.LATE;
    }).length;
    const absentCount = records.filter((r) => parseLessonAttendance(r.status) === LessonAttendance.ABSENT).length;
    const excusedCount = records.filter((r) => parseLessonAttendance(r.status) === LessonAttendance.EXCUSED).length;
    const rate = total > 0 ? Number(((presentCount / total) * 100).toFixed(1)) : 0;

    return {
      total_records: total,
      present_count: presentCount,
      absent_count: absentCount,
      excused_count: excusedCount,
      attendance_rate: rate, // e.g. 85.5%
      eligible_for_certificate: rate >= 80,
    };
  }

  async getActiveBookings() {
    const bookings = await this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return bookings.map((b) => ({
      id: b.id,
      student_name: b.studentName || b.purchaserName || 'Студент',
      purchaser_name: b.purchaserName || '',
      course_name: b.courseName,
      billing_scheme: b.billingScheme,
      payment_status: b.paymentStatus,
    }));
  }

  async createManualLessonRecord(dto: {
    bookingId: string;
    startsAt: string;
    status: string;
    notes?: string;
  }) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${dto.bookingId} not found`);

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // 1 hour default

    const lesson = await this.prisma.lesson.create({
      data: {
        bookingId: dto.bookingId,
        startsAt,
        endsAt,
        status: LessonStatus.COMPLETED,
        attendance: parseLessonAttendance(dto.status),
      },
    });

    const record = await this.markAttendance({
      lessonId: lesson.id.toString(),
      bookingId: dto.bookingId,
      status: dto.status,
      notes: dto.notes,
      markedBy: 'admin_manual',
    });

    return { lesson, record };
  }

  async deleteAttendance(lessonId: string) {
    const bigLessonId = toBigInt(lessonId);
    if (bigLessonId !== undefined) {
      await this.prisma.attendanceRecord.deleteMany({
        where: { lessonId: bigLessonId },
      });

      await this.prisma.lesson.update({
        where: { id: bigLessonId },
        data: {
          attendance: LessonAttendance.PENDING,
          status: LessonStatus.SCHEDULED,
        },
      });
    }

    return { success: true };
  }
}

