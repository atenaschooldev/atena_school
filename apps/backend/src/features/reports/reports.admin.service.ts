import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import {
  BookingPaymentStatus,
  PaymentMethod,
  PaymentRecordStatus,
  PaymentType,
  PAYMENT_METHOD_ID_TO_STRING,
  LessonAttendance,
  parseLessonAttendance,
} from '@atena/api-types';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueReport(startDateStr?: string, endDateStr?: string) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentRecordStatus.SUCCEEDED,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const coursePaymentsRevenue = payments
      .filter((p) => p.type !== PaymentType.REGISTRATION_FEE && Number(p.amount) !== 30)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const membershipFeesRevenue = payments
      .filter((p) => p.type === PaymentType.REGISTRATION_FEE || Number(p.amount) === 30)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const byMethod: Record<string, number> = {};
    payments.forEach((p) => {
      const method = (PAYMENT_METHOD_ID_TO_STRING as Record<number, string>)[p.paymentMethod] || String(p.paymentMethod);
      byMethod[method] = (byMethod[method] || 0) + Number(p.amount);
    });

    // Generate monthly timeline for charts
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    const monthlyTrend = months.map((mName, idx) => {
      const monthNum = idx + 1;
      const monthPayments = payments.filter((p) => {
        const d = new Date(p.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() + 1 === monthNum;
      });
      const sales = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      return {
        month: mName,
        monthIndex: idx,
        sales,
        count: monthPayments.length,
      };
    });

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalRevenue,
        coursePaymentsRevenue,
        membershipFeesRevenue,
        transactionCount: payments.length,
      },
      byMethod,
      monthlyTrend,
      recentTransactions: payments.slice(0, 20),
    };
  }

  async getDebtorsReport() {
    const now = new Date();

    const bookings = await this.prisma.booking.findMany({
      where: {
        paymentStatus: {
          in: [BookingPaymentStatus.PENDING, BookingPaymentStatus.RESERVED, BookingPaymentStatus.PARTIALLY_REFUNDED],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const debtors = bookings.map((b) => {
      const amountPaid = Number(b.amountPaid || 0);
      const regFee = Number(b.registrationFee || 30);
      const estimatedTotal = regFee + 100; // estimated target
      const outstandingAmount = Math.max(0, estimatedTotal - amountPaid);

      return {
        bookingId: b.id,
        purchaserName: b.purchaserName,
        purchaserEmail: b.purchaserEmail,
        purchaserPhone: b.purchaserPhone,
        purchaserTaxCode: b.purchaserTaxCode,
        studentName: b.studentName,
        studentTaxCode: b.studentTaxCode,
        courseName: b.courseName,
        paymentStatus: b.paymentStatus,
        amountPaid,
        registrationFee: regFee,
        outstandingEstimate: outstandingAmount,
        startDate: b.startDate,
        createdAt: b.createdAt,
      };
    });

    const totalOutstanding = debtors.reduce((sum, d) => sum + d.outstandingEstimate, 0);

    return {
      count: debtors.length,
      totalOutstandingEstimate: totalOutstanding,
      debtors,
    };
  }

  async getAttendanceSummary(startDateStr?: string, endDateStr?: string) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    const lessons = await this.prisma.lesson.findMany({
      where: {
        startsAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        attendanceRecords: true,
        teacher: true,
      },
    });

    let totalLessons = lessons.length;
    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;
    let lateCount = 0;

    lessons.forEach((l) => {
      const rec = l.attendanceRecords[0];
      if (rec) {
        const s = parseLessonAttendance(rec.status);
        if (s === LessonAttendance.PRESENT) presentCount++;
        else if (s === LessonAttendance.ABSENT) absentCount++;
        else if (s === LessonAttendance.EXCUSED) excusedCount++;
        else if (s === LessonAttendance.LATE) lateCount++;
      }
    });

    const attendanceRate = totalLessons > 0 ? Math.round(((presentCount + lateCount) / totalLessons) * 100) : 0;

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalLessons,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        attendanceRatePercentage: attendanceRate,
      },
    };
  }
}
