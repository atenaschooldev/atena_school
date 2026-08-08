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

    return lessons.map((l) => {
      const record = l.attendanceRecords[0] || null;
      const b = l.booking;
      return {
        id: l.id,
        starts_at: l.startsAt,
        ends_at: l.endsAt,
        status: l.status,
        payment_status: l.paymentStatus,
        price_per_lesson: l.pricePerLesson ? Number(l.pricePerLesson) : null,
        location_type: l.locationType,
        teacher_id: l.teacherId,
        teacher_name: l.teacher?.fullName || 'Non Задан',
        booking_id: l.bookingId,
        course_name: b?.courseName || 'Индивидуальный курс',
        student_name: b?.studentName || b?.purchaserName || 'Студент',
        student_email: b?.studentEmail || b?.purchaserEmail || '',
        student_phone: b?.studentPhone || b?.purchaserPhone || '',
        purchaser_name: b?.purchaserName || '',
        billing_scheme: b?.billingScheme || 'full',
        booking_payment_status: b?.paymentStatus || 'reserved',
        attendance_record: record
          ? {
              id: record.id,
              status: record.status,
              marked_at: record.markedAt,
              marked_by: record.markedBy,
              notes: record.notes,
              payment_id: record.paymentId,
            }
          : null,
      };
    });
  }

  async markAttendance(dto: {
    lessonId: string;
    bookingId?: string;
    studentId?: string;
    status: 'present' | 'absent' | 'excused' | 'late' | string;
    notes?: string;
    markedBy?: string;
  }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { booking: true },
    });
    if (!lesson) throw new NotFoundException(`Lesson ${dto.lessonId} not found`);

    const bookingId = dto.bookingId || lesson.bookingId;
    const existingRecord = await this.prisma.attendanceRecord.findFirst({
      where: { lessonId: dto.lessonId },
    });

    let record;
    if (existingRecord) {
      record = await this.prisma.attendanceRecord.update({
        where: { id: existingRecord.id },
        data: {
          status: dto.status,
          notes: dto.notes ?? existingRecord.notes,
          markedBy: dto.markedBy || 'admin',
          markedAt: new Date(),
        },
      });
    } else {
      record = await this.prisma.attendanceRecord.create({
        data: {
          lessonId: dto.lessonId,
          bookingId: bookingId || null,
          studentId: dto.studentId || lesson.booking?.userId || null,
          status: dto.status,
          notes: dto.notes || null,
          markedBy: dto.markedBy || 'admin',
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

    // If booking is per_lesson, create pending payment notice if not already present
    if (bookingId && lesson.booking?.billingScheme === 'per_lesson' && (dto.status === 'present' || dto.status === 'late')) {
      const existingPayment = await this.prisma.payment.findFirst({
        where: { bookingId, scheduleId: dto.lessonId },
      });

      if (!existingPayment) {
        const price = Number(lesson.pricePerLesson || 0);
        const newPayment = await this.prisma.payment.create({
          data: {
            bookingId,
            scheduleId: dto.lessonId,
            amount: price,
            currency: 'EUR',
            paymentMethod: lesson.booking.paymentMethod || 'cash',
            type: 'lesson_payment',
            status: 'pending',
            provider: 'manual',
            notes: `Presenza lezione del ${new Date(lesson.startsAt).toLocaleDateString('it-IT')}`,
          },
        });

        await this.prisma.attendanceRecord.update({
          where: { id: record.id },
          data: { paymentId: newPayment.id },
        });
      }
    }

    return record;
  }

  async payLesson(dto: {
    lessonId: string;
    paymentMethod?: string;
    amount?: number;
  }) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      include: { booking: true },
    });

    if (!lesson) throw new NotFoundException(`Lesson ${dto.lessonId} not found`);
    if (!lesson.bookingId) throw new BadRequestException(`Lesson ${dto.lessonId} has no associated booking`);

    const bookingId = lesson.bookingId;
    const finalAmount = dto.amount ?? Number(lesson.pricePerLesson ?? 0);
    const method = dto.paymentMethod || lesson.booking?.paymentMethod || 'cash';

    const existingPayment = await this.prisma.payment.findFirst({
      where: { bookingId, scheduleId: dto.lessonId },
    });

    let payment;
    if (existingPayment) {
      payment = await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'succeeded',
          paymentMethod: method,
          paidAt: new Date(),
          amount: finalAmount,
        },
      });
    } else {
      payment = await this.prisma.payment.create({
        data: {
          bookingId,
          userId: lesson.booking?.userId || null,
          scheduleId: dto.lessonId,
          amount: finalAmount,
          currency: 'EUR',
          paymentMethod: method,
          type: 'lesson_payment',
          status: 'succeeded',
          provider: 'manual',
          paidAt: new Date(),
        },
      });
    }

    await this.prisma.lesson.update({
      where: { id: dto.lessonId },
      data: { paymentStatus: 'paid' },
    });

    const record = await this.prisma.attendanceRecord.findFirst({
      where: { lessonId: dto.lessonId },
    });

    if (record) {
      await this.prisma.attendanceRecord.update({
        where: { id: record.id },
        data: { paymentId: payment.id },
      });
    }

    // Recalculate Booking total amount paid and payment status
    const allPayments = await this.prisma.payment.findMany({
      where: { bookingId, status: 'succeeded' },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const allLessons = await this.prisma.lesson.findMany({ where: { bookingId } });
    const paidLessons = allLessons.filter((l) => l.paymentStatus === 'paid');

    let newStatus = lesson.booking?.paymentStatus || 'partially_paid';
    if (paidLessons.length === allLessons.length && allLessons.length > 0) {
      newStatus = 'paid';
    } else if (paidLessons.length > 0) {
      newStatus = 'partially_paid';
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        amountPaid: totalPaid,
        paymentStatus: newStatus,
      },
    });

    return {
      success: true,
      lesson_id: dto.lessonId,
      payment_id: payment.id,
      amount: finalAmount,
      booking_payment_status: newStatus,
    };
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

