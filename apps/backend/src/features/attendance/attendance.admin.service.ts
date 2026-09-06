import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

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

    const lessons = await this.prisma.lesson.findMany({
      where: {
        startsAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(courseId ? { booking: { courseId } } : {}),
      },
      include: {
        booking: true,
        teacher: true,
        attendanceRecords: true,
      },
      orderBy: { startsAt: 'asc' },
    });

    const lessonItems = lessons.map((l) => {
      const record = l.attendanceRecords[0] || null;
      const b = l.booking;
      const billingScheme = b?.billingScheme || 'full';
      const bookingPaymentStatus = b?.paymentStatus || 'reserved';
      const lessonPaymentStatus = l.paymentStatus || 'pending';

      // Business rule: show quick payment dialog when student attended but hasn't paid
      const requiresPaymentOnAttendance = bookingPaymentStatus !== 'completed' && bookingPaymentStatus !== 'paid';

      return {
        id: l.id,
        starts_at: l.startsAt,
        ends_at: l.endsAt,
        status: l.status,
        payment_status: bookingPaymentStatus,
        location_type: l.locationType,
        teacher_id: l.teacherId,
        teacher_name: l.teacher?.fullName || 'Docente',
        booking_id: l.bookingId,
        course_name: b?.courseName || 'Lezione individuale',
        student_name: b?.studentName || b?.purchaserName || 'Studente',
        student_email: b?.studentEmail || b?.purchaserEmail || '',
        student_phone: b?.studentPhone || b?.purchaserPhone || '',
        purchaser_name: b?.purchaserName || '',
        purchaser_email: b?.purchaserEmail || '',
        payment_method: b?.paymentMethod || null,
        amount_paid: b?.amountPaid ? Number(b.amountPaid) : 0,
        billing_scheme: billingScheme,
        booking_payment_status: bookingPaymentStatus,
        requires_payment_on_attendance: requiresPaymentOnAttendance,
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
    const present = lessonItems.filter(
      (l) => l.attendance_record?.status === 'present' || l.attendance_record?.status === 'late',
    ).length;
    const absent = lessonItems.filter((l) => l.attendance_record?.status === 'absent').length;
    const pending = lessonItems.filter((l) => !l.attendance_record).length;
    const pendingPayment = lessonItems.filter(
      (l) =>
        (l.attendance_record?.status === 'present' || l.attendance_record?.status === 'late') &&
        l.requires_payment_on_attendance,
    ).length;

    return {
      lessons: lessonItems,
      stats: { total, present, absent, pending, pendingPayment },
    };
  }

  async markAttendance(dto: {
    lessonId: string;
    bookingId?: string;
    studentId?: string;
    status: string;
    notes?: string;
    markedBy?: string;
  }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { booking: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson ${dto.lessonId} not found`);
    }

    const bookingId = dto.bookingId || lesson.bookingId;
    const studentId = dto.studentId || (lesson.booking as any)?.student_id || (lesson.booking as any)?.studentId;

    // Create or update attendance record
    const existing = await this.prisma.attendanceRecord.findFirst({
      where: { lessonId: dto.lessonId },
    });

    let record;
    if (existing) {
      record = await this.prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: {
          status: dto.status,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          markedBy: dto.markedBy || 'admin',
          markedAt: new Date(),
        },
      });
    } else {
      record = await this.prisma.attendanceRecord.create({
        data: {
          lessonId: dto.lessonId,
          bookingId: bookingId || null,
          studentId: studentId || null,
          status: dto.status,
          notes: dto.notes,
          markedBy: dto.markedBy || 'admin',
          markedAt: new Date(),
        },
      });
    }

    // Update Lesson status and attendance
    const isCompleted = dto.status === 'present' || dto.status === 'late' || dto.status === 'absent';
    await this.prisma.lesson.update({
      where: { id: dto.lessonId },
      data: {
        attendance: dto.status,
        status: isCompleted ? 'completed' : lesson.status,
      },
    });

    return record;
  }

  async getBookingStats(bookingId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { bookingId },
    });

    const total = records.length;
    const presentCount = records.filter((r) => r.status === 'present' || r.status === 'late').length;
    const absentCount = records.filter((r) => r.status === 'absent').length;
    const excusedCount = records.filter((r) => r.status === 'excused').length;
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
    pricePerLesson?: number;
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
        status: 'completed',
        attendance: dto.status,
        pricePerLesson: dto.pricePerLesson ?? 25,
        paymentStatus: 'pending',
      },
    });

    const record = await this.markAttendance({
      lessonId: lesson.id,
      bookingId: dto.bookingId,
      status: dto.status,
      notes: dto.notes,
      markedBy: 'admin_manual',
    });

    return { lesson, record };
  }

  async deleteAttendance(lessonId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { lessonId },
    });
    if (records.length > 0) {
      await this.prisma.attendanceRecord.deleteMany({
        where: { lessonId },
      });
    }

    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        attendance: 'pending',
        status: 'scheduled',
      },
    });

    return { success: true };
  }
}

