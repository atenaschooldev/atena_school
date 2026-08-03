import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CheckoutService } from './checkout.service';
import { calculateLessonDates } from '../../shared/utils/bookingScheduler';

@Injectable()
export class BookingsAdminService {
  private readonly logger = new Logger(BookingsAdminService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private checkoutService: CheckoutService,
  ) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const serviceKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  async listAllBookings() {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdminBooking(dto: {
    courseId?: string;
    courseName?: string;
    purchaserName: string;
    purchaserEmail: string;
    purchaserPhone?: string;
    purchaserTaxCode?: string;
    isForChild?: boolean;
    studentName?: string;
    studentEmail?: string;
    studentPhone?: string;
    studentTaxCode?: string;
    studentBirthDate?: string;
    amountPaid?: number;
    registrationFee?: number;
    billingScheme?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    sdiCode?: string;
    pecEmail?: string;
    notes?: string;
    startDate?: string;
  }) {
    let resolvedCourseId = dto.courseId;
    if (!resolvedCourseId) {
      const foundCourse = await this.prisma.course.findFirst({
        where: dto.courseName ? { name: { contains: dto.courseName, mode: 'insensitive' } } : undefined,
      });
      if (foundCourse) {
        resolvedCourseId = foundCourse.id;
      } else {
        const fallbackCourse = await this.prisma.course.findFirst();
        if (fallbackCourse) {
          resolvedCourseId = fallbackCourse.id;
        }
      }
    }

    if (!resolvedCourseId) {
      throw new BadRequestException('No course selected');
    }

    const pParts = (dto.purchaserName || '').trim().split(' ');
    const pFirstName = pParts[0] || 'Genitore';
    const pLastName = pParts.slice(1).join(' ') || 'Acquirente';

    const isForChild = Boolean(dto.isForChild);
    let sFirstName = pFirstName;
    let sLastName = pLastName;
    if (isForChild) {
      const sParts = (dto.studentName || '').trim().split(' ');
      sFirstName = sParts[0] || pFirstName;
      sLastName = sParts.slice(1).join(' ') || pLastName;
    }

    const normalizedStatus = dto.paymentStatus === 'completed' ? 'paid' : (dto.paymentStatus || 'reserved');

    const reservation = await this.checkoutService.createReservation({
      itemId: resolvedCourseId,
      itemType: 'course',
      date: dto.startDate,
      time: undefined,
      firstName: pFirstName,
      lastName: pLastName,
      email: dto.purchaserEmail,
      phone: dto.purchaserPhone || '',
      isForChild,
      purchaserTaxCode: dto.purchaserTaxCode || '',
      studentFirstName: sFirstName,
      studentLastName: sLastName,
      studentEmail: dto.studentEmail || '',
      studentPhone: dto.studentPhone || '',
      studentTaxCode: dto.studentTaxCode || '',
      studentBirthDate: dto.studentBirthDate || undefined,
      needsCompanyInvoice: !!(dto.sdiCode || dto.pecEmail),
      sdiCode: dto.sdiCode || undefined,
      pecEmail: dto.pecEmail || undefined,
      includeRegistrationFee: (dto.registrationFee ?? 30) > 0,
      notes: dto.notes || '',
      paymentStatus: normalizedStatus,
      paymentMethod: dto.paymentMethod,
    });

    const billingScheme = dto.billingScheme || 'full';
    const bookingId = reservation.booking?.id;

    if (bookingId) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          billingScheme,
          paymentStatus: normalizedStatus,
        },
      });

      if (billingScheme === 'per_lesson') {
        try {
          const course = await this.prisma.course.findUnique({ where: { id: resolvedCourseId } });
          const courseTotalLessons = (course as any)?.totalLessons || (course as any)?.total_lessons || 10;
          const coursePrice = Number((course as any)?.price || dto.amountPaid || 0);
          const pricePerLesson = courseTotalLessons > 0 ? Number((coursePrice / courseTotalLessons).toFixed(2)) : 0;

          const startDate = dto.startDate || new Date().toISOString();
          const lessonDates = calculateLessonDates(
            startDate,
            '',
            '',
            (course as any)?.scheduleDays || (course as any)?.schedule_days || null,
            (course as any)?.durationMinutes || (course as any)?.lesson_duration_minutes || 60,
            (course as any)?.startTime || (course as any)?.start_time || '10:00',
            (course as any)?.endTime || (course as any)?.end_time || null,
            null,
          );

          const lessonsToCreate =
            lessonDates.length > 0
              ? lessonDates.map((ld) => ({
                  bookingId,
                  startsAt: new Date(ld.startsAt),
                  endsAt: new Date(ld.endsAt),
                  status: 'scheduled',
                  paymentStatus: 'pending',
                  pricePerLesson,
                }))
              : Array.from({ length: courseTotalLessons }, (_, i) => ({
                  bookingId,
                  startsAt: new Date(new Date(startDate).getTime() + i * 7 * 24 * 60 * 60 * 1000),
                  endsAt: new Date(new Date(startDate).getTime() + i * 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
                  status: 'scheduled',
                  paymentStatus: 'pending',
                  pricePerLesson,
                }));

          await this.prisma.lesson.createMany({ data: lessonsToCreate });
          this.logger.log(`Created ${lessonsToCreate.length} lessons for per_lesson booking ${bookingId}`);
        } catch (err) {
          this.logger.warn('Failed to auto-create lessons for per_lesson booking:', err);
        }
      }
    }

    return reservation.booking;
  }

  async getBookingLessons(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const lessons = await this.prisma.lesson.findMany({
      where: { bookingId },
      orderBy: { startsAt: 'asc' },
    });

    const totalAmount = Number(booking.amountPaid || 0);
    const totalLessons = booking.totalLessonsCount || lessons.length || 1;
    const pricePerLesson = totalLessons > 0 ? Number((totalAmount / totalLessons).toFixed(2)) : 0;

    return lessons.map((l) => ({
      id: l.id,
      booking_id: l.bookingId,
      starts_at: l.startsAt,
      ends_at: l.endsAt,
      status: l.status,
      payment_status: l.paymentStatus,
      price_per_lesson: Number(l.pricePerLesson ?? pricePerLesson),
      attendance: l.attendance,
      teacher_notes: l.teacherNotes,
      location_type: (l as any).locationType,
    }));
  }

  async completeLesson(bookingId: string, lessonId: string, paymentMethod?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson || lesson.bookingId !== bookingId) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const totalAmount = Number(booking.amountPaid || 0);
    const totalLessons = booking.totalLessonsCount || 1;
    const pricePerLesson = Number(lesson.pricePerLesson ?? (totalAmount / totalLessons).toFixed(2));

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'completed',
        paymentStatus: 'pending',
        pricePerLesson,
      },
    });

    if (booking.billingScheme === 'per_lesson' && pricePerLesson > 0) {
      await this.prisma.payment.create({
        data: {
          bookingId,
          userId: booking.userId ?? null,
          scheduleId: lessonId,
          amount: pricePerLesson,
          currency: 'EUR',
          paymentMethod: paymentMethod || 'cash',
          type: 'lesson_payment',
          status: 'pending',
          provider: 'manual',
          notes: `Lezione del ${updated.startsAt.toLocaleDateString('it-IT')}`,
        },
      });

      if (booking.paymentStatus === 'reserved') {
        await this.prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'partially_paid' },
        });
      }
    }

    return { success: true, lesson_id: lessonId, price_per_lesson: pricePerLesson };
  }

  async payLesson(bookingId: string, lessonId: string, paymentMethod?: string, amount?: number) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson || lesson.bookingId !== bookingId) throw new NotFoundException(`Lesson ${lessonId} not found`);

    const finalAmount = amount ?? Number(lesson.pricePerLesson ?? 0);

    if (amount !== undefined && amount !== Number(lesson.pricePerLesson)) {
      await this.prisma.lesson.update({
        where: { id: lessonId },
        data: { pricePerLesson: finalAmount },
      });
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: { bookingId, scheduleId: lessonId, status: 'pending' },
    });

    if (existingPayment) {
      await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'succeeded',
          paymentMethod: paymentMethod || 'cash',
          paidAt: new Date(),
          amount: finalAmount,
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          bookingId,
          userId: booking.userId ?? null,
          scheduleId: lessonId,
          amount: finalAmount,
          currency: 'EUR',
          paymentMethod: paymentMethod || 'cash',
          type: 'lesson_payment',
          status: 'succeeded',
          provider: 'manual',
          paidAt: new Date(),
        },
      });
    }

    await this.prisma.lesson.update({
      where: { id: lessonId },
      data: { paymentStatus: 'paid' },
    });

    const allLessons = await this.prisma.lesson.findMany({ where: { bookingId } });
    const completedLessons = allLessons.filter((l) => l.status === 'completed');
    const paidLessons = allLessons.filter((l) => l.paymentStatus === 'paid');

    let newStatus = booking.paymentStatus;
    if (paidLessons.length === completedLessons.length && completedLessons.length === allLessons.length) {
      newStatus = 'paid';
    } else if (paidLessons.length > 0) {
      newStatus = 'partially_paid';
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentStatus: newStatus },
    });

    return { success: true, lesson_id: lessonId, amount: finalAmount, new_booking_status: newStatus };
  }

  async updateBookingPaymentStatus(id: string, dto: { payment_status?: string; scheduling_status?: string }) {
    return this.updateBooking(id, dto);
  }

  async updateBooking(
    id: string,
    dto: {
      purchaser_name?: string;
      purchaser_email?: string;
      purchaser_phone?: string;
      purchaser_tax_code?: string;
      student_name?: string;
      student_email?: string;
      student_phone?: string;
      student_tax_code?: string;
      student_birth_date?: string;
      payment_status?: string;
      payment_method?: string;
      scheduling_status?: string;
      notes?: string;
    },
  ) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Booking ${id} not found`);

    const normalizedStatus = dto.payment_status === 'completed' ? 'paid' : dto.payment_status;

    const updateData: Record<string, any> = {};
    if (dto.purchaser_name !== undefined) updateData.purchaserName = dto.purchaser_name;
    if (dto.purchaser_email !== undefined) updateData.purchaserEmail = dto.purchaser_email;
    if (dto.purchaser_phone !== undefined) updateData.purchaserPhone = dto.purchaser_phone;
    if (dto.purchaser_tax_code !== undefined) updateData.purchaserTaxCode = dto.purchaser_tax_code;
    if (dto.student_name !== undefined) updateData.studentName = dto.student_name;
    if (dto.student_email !== undefined) updateData.studentEmail = dto.student_email;
    if (dto.student_phone !== undefined) updateData.studentPhone = dto.student_phone;
    if (dto.student_tax_code !== undefined) updateData.studentTaxCode = dto.student_tax_code;
    if (dto.student_birth_date !== undefined) updateData.studentBirthDate = dto.student_birth_date ? new Date(dto.student_birth_date) : null;
    if (normalizedStatus !== undefined) updateData.paymentStatus = normalizedStatus;
    if (dto.payment_method !== undefined) updateData.paymentMethod = dto.payment_method;
    if (dto.scheduling_status !== undefined) updateData.schedulingStatus = dto.scheduling_status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
    });

    const isNowPaid = updatedBooking.paymentStatus === 'paid';
    try {
      const updatePayload: Record<string, any> = {};
      if (isNowPaid) {
        updatePayload.status = 'succeeded';
        updatePayload.paidAt = new Date();
      }
      if (updatedBooking.paymentMethod) {
        updatePayload.paymentMethod = updatedBooking.paymentMethod;
      }

      if (Object.keys(updatePayload).length > 0) {
        await this.prisma.payment.updateMany({
          where: {
            bookingId: id,
            ...(isNowPaid ? { status: { in: ['pending', 'reserved'] } } : {}),
          },
          data: updatePayload,
        });
      }
    } catch (pErr) {
      this.logger.warn('Sync payments error on booking update:', pErr);
    }

    return updatedBooking;
  }

  async createAdminMembershipFee(dto: {
    studentId?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    taxCode?: string;
    birthDate?: string;
    paymentMethod?: string;
  }) {
    let studentId = dto.studentId;
    const sEmail = (dto.email || '').trim() || null;
    const sTaxCode = (dto.taxCode || '').trim() || null;
    const pMethod = dto.paymentMethod || 'cash';
    const sName = (dto.fullName || 'Studente').trim();

    if (!studentId && (sEmail || sTaxCode)) {
      let existingStudent: { id: string } | null = null;
      if (sTaxCode) {
        const { data } = await this.supabaseAdmin
          .from('students')
          .select('id')
          .ilike('tax_code', sTaxCode)
          .maybeSingle();
        if (data?.id) existingStudent = data;
      }
      if (!existingStudent && sEmail) {
        const { data } = await this.supabaseAdmin
          .from('students')
          .select('id')
          .ilike('email', sEmail)
          .maybeSingle();
        if (data?.id) existingStudent = data;
      }

      if (existingStudent?.id) {
        studentId = existingStudent.id;
      } else {
        const sNameParts = sName.split(' ');
        const { data: newStudent, error: sErr } = await this.supabaseAdmin
          .from('students')
          .insert({
            full_name: sName,
            first_name: sNameParts[0] || 'Studente',
            last_name: sNameParts.slice(1).join(' ') || '',
            email: sEmail,
            phone: dto.phone || null,
            tax_code: sTaxCode,
            birth_date: dto.birthDate || null,
            language_level: 'A1',
            registration_date: new Date().toISOString().split('T')[0],
            status: 'active',
            annual_fee_paid: true,
            annual_fee_paid_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (sErr) throw new BadRequestException(sErr.message);
        if (newStudent?.id) studentId = newStudent.id;
      }
    }

    const { data: membership, error: mErr } = await this.supabaseAdmin
      .from('annual_memberships')
      .insert({
        student_id: studentId || null,
        tax_code: sTaxCode,
        email: sEmail,
        phone: dto.phone || null,
        academic_year: '2026/2027',
        status: 'active',
        paid_at: new Date().toISOString(),
        expires_at: '2027-08-31T23:59:59.000Z',
      })
      .select('*')
      .single();

    if (mErr) throw new BadRequestException(mErr.message);

    try {
      await this.prisma.payment.create({
        data: {
          bookingId: null,
          amount: 30.0,
          paymentMethod: pMethod,
          type: 'registration_fee',
          status: 'succeeded',
          provider: 'manual',
          notes: `Quota d'iscrizione annuale A.A. 2026/2027 (Iscrizione Sede) [membership_id:${membership.id}]`,
        },
      });
    } catch (payErr) {
      this.logger.warn('Standalone membership payment error:', payErr);
    }

    return { success: true, membership };
  }

  async deleteBooking(id: string) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Booking ${id} not found`);

    await this.prisma.lesson.deleteMany({ where: { bookingId: id } });
    await this.prisma.payment.deleteMany({ where: { bookingId: id } });
    await this.prisma.booking.delete({ where: { id } });

    await this.supabaseAdmin.from('annual_memberships').delete().eq('booking_id', id);

    return { success: true };
  }

  async lookupClient(query: string) {
    if (!query || !query.trim()) return { found: false };

    const q = query.trim();
    try {
      const { data: student } = await this.supabaseAdmin
        .from('students')
        .select('*')
        .or(`email.ilike.${q},tax_code.ilike.${q},phone.ilike.${q},full_name.ilike.%${q}%`)
        .limit(1)
        .maybeSingle();

      if (student) {
        return {
          found: true,
          purchaserName: student.full_name || '',
          purchaserEmail: student.email || '',
          purchaserPhone: student.phone || '',
          purchaserTaxCode: student.tax_code || '',
        };
      }

      const booking = await this.prisma.booking.findFirst({
        where: {
          OR: [
            { purchaserEmail: { contains: q, mode: 'insensitive' } },
            { purchaserTaxCode: { contains: q, mode: 'insensitive' } },
            { purchaserPhone: { contains: q, mode: 'insensitive' } },
            { purchaserName: { contains: q, mode: 'insensitive' } },
          ],
        },
      });

      if (booking) {
        return {
          found: true,
          purchaserName: booking.purchaserName || '',
          purchaserEmail: booking.purchaserEmail || '',
          purchaserPhone: booking.purchaserPhone || '',
          purchaserTaxCode: booking.purchaserTaxCode || '',
          studentName: booking.studentName || '',
          studentTaxCode: booking.studentTaxCode || '',
          studentPhone: booking.studentPhone || '',
          studentEmail: booking.studentEmail || '',
          studentBirthDate: booking.studentBirthDate ? booking.studentBirthDate.toISOString() : '',
          isForChild: !!(booking.studentName && booking.studentName !== booking.purchaserName),
        };
      }

      return { found: false };
    } catch (err) {
      this.logger.error('Client lookup error:', err);
      return { found: false };
    }
  }
}
