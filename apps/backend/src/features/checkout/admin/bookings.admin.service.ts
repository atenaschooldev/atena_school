import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CheckoutService } from '../public/checkout.public.service';
import { CheckoutCoreService } from '../checkout-core.service';
import { calculateLessonDates } from '@atena/utils';

@Injectable()
export class BookingsAdminService {
  private readonly logger = new Logger(BookingsAdminService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private checkoutService: CheckoutService,
    private checkoutCore: CheckoutCoreService,
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

  private mapBookingToResponse(b: any, payments?: any[]) {
    if (!b) return null;
    const base = {
      id: b.id,
      user_id: b.userId ?? null,
      course_id: b.courseId ?? null,
      course_name: b.courseName,
      purchaser_name: b.purchaserName,
      purchaser_email: b.purchaserEmail,
      purchaser_phone: b.purchaserPhone ?? null,
      purchaser_tax_code: b.purchaserTaxCode ?? null,
      student_name: b.studentName,
      student_email: b.studentEmail ?? null,
      student_phone: b.studentPhone ?? null,
      student_tax_code: b.studentTaxCode ?? null,
      student_birth_date: b.studentBirthDate ? (b.studentBirthDate instanceof Date ? b.studentBirthDate.toISOString().split('T')[0] : b.studentBirthDate) : null,
      amount_paid: Number(b.amountPaid || 0),
      registration_fee: Number(b.registrationFee || 0),
      payment_status: b.paymentStatus,
      payment_method: b.paymentMethod,
      scheduling_status: b.schedulingStatus,
      schedule_days: b.scheduleDays || [],
      start_time: b.startTime ?? null,
      end_time: b.endTime ?? null,
      start_date: b.startDate ? (b.startDate instanceof Date ? b.startDate.toISOString() : b.startDate) : null,
      sdi_code: b.sdiCode ?? null,
      pec_email: b.pecEmail ?? null,
      notes: b.notes ?? null,
      billing_scheme: b.billingScheme || 'full',
      total_lessons_count: b.totalLessonsCount ?? null,
      subscription_starts_at: b.subscriptionStartsAt ? (b.subscriptionStartsAt instanceof Date ? b.subscriptionStartsAt.toISOString() : b.subscriptionStartsAt) : null,
      subscription_ends_at: b.subscriptionEndsAt ? (b.subscriptionEndsAt instanceof Date ? b.subscriptionEndsAt.toISOString() : b.subscriptionEndsAt) : null,
      created_at: b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt) : new Date().toISOString(),
    };
    if (payments !== undefined) {
      (base as any).financial_summary = this.computeFinancialSummary(b, payments);
    }
    return base;
  }

  private computeFinancialSummary(b: any, payments: any[]) {
    const paidSum = payments
      .filter((p) => (p.status || '').toLowerCase() === 'succeeded')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const rawAmount = Number(b.amountPaid || 0);
    const regFee = Number(b.registrationFee || 30);
    const totalTarget = rawAmount > 0 ? rawAmount : regFee;
    const remaining = Math.max(0, totalTarget - paidSum);

    const registrationFeePaid = payments.some(
      (p) =>
        (p.type === 'registration_fee' || Number(p.amount) === 30) &&
        (p.status || '').toLowerCase() === 'succeeded',
    ) || Number(b.registrationFee) > 0;

    return {
      paid_sum: Number(paidSum.toFixed(2)),
      total_target: Number(totalTarget.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      registration_fee_paid: registrationFeePaid,
    };
  }

  async getStats() {
    const [totalCount, paidCount, reservedCount, leadsCount] = await Promise.all([
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: { paymentStatus: { in: ['completed', 'paid', 'succeeded'] } },
      }),
      this.prisma.booking.count({ where: { paymentStatus: 'reserved' } }),
      this.prisma.booking.count({ where: { schedulingStatus: 'pending_coordination' } }),
    ]);
    return { totalCount, paidCount, reservedCount, leadsCount };
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    const payments = await this.prisma.payment.findMany({
      where: { bookingId: id },
      orderBy: { createdAt: 'desc' },
    });

    return this.mapBookingToResponse(booking, payments);
  }

  async listAllBookings(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = params?.limit ? Math.min(100, Math.max(1, Number(params.limit))) : undefined;
    const skip = limit ? (page - 1) * limit : undefined;
    const search = params?.search ? params.search.trim() : undefined;
    const status = params?.status ? params.status.trim() : undefined;

    const where: any = {};
    if (status) {
      where.paymentStatus = status;
    }
    if (search) {
      where.OR = [
        { purchaserName: { contains: search, mode: 'insensitive' } },
        { purchaserEmail: { contains: search, mode: 'insensitive' } },
        { studentName: { contains: search, mode: 'insensitive' } },
        { courseName: { contains: search, mode: 'insensitive' } },
        { purchaserTaxCode: { contains: search, mode: 'insensitive' } },
        { studentTaxCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (limit) {
      const [total, bookings] = await Promise.all([
        this.prisma.booking.count({ where }),
        this.prisma.booking.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      return {
        items: bookings.map((b) => this.mapBookingToResponse(b)),
        total,
        page,
        limit,
      };
    }

    const bookings = await this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return bookings.map((b) => this.mapBookingToResponse(b));
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

    let finalRegFee = dto.registrationFee;
    if (finalRegFee === undefined) {
      const emailToCheck = isForChild ? (dto.studentEmail || dto.purchaserEmail) : dto.purchaserEmail;
      const taxCodeToCheck = isForChild ? (dto.studentTaxCode || dto.purchaserTaxCode) : dto.purchaserTaxCode;
      const feeStatus = await this.checkoutService.checkFeeStatus({ email: emailToCheck, taxCode: taxCodeToCheck });
      finalRegFee = feeStatus.annualFeePaid ? 0 : 30;
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
      includeRegistrationFee: finalRegFee > 0,
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

    // Synchronize payments and annual_memberships table when status becomes paid/succeeded
    if (normalizedStatus === 'paid' || normalizedStatus === 'completed' || normalizedStatus === 'succeeded') {
      try {
        await this.prisma.payment.updateMany({
          where: { bookingId: id },
          data: { status: 'succeeded', paidAt: new Date() },
        });

        // Activate or create membership in annual_memberships table
        const { data: existingMem } = await this.supabaseAdmin
          .from('annual_memberships')
          .select('id')
          .eq('booking_id', id)
          .maybeSingle();

        const sTaxCode = updatedBooking.studentTaxCode || updatedBooking.purchaserTaxCode || null;
        const sEmail = updatedBooking.studentEmail || updatedBooking.purchaserEmail || null;
        const sPhone = updatedBooking.studentPhone || updatedBooking.purchaserPhone || null;

        if (existingMem?.id) {
          await this.supabaseAdmin
            .from('annual_memberships')
            .update({
              status: 'active',
              tax_code: sTaxCode,
              email: sEmail,
              phone: sPhone,
              student_id: (updatedBooking as any).student_id || null,
              user_id: updatedBooking.userId || null,
              paid_at: new Date().toISOString(),
            })
            .eq('id', existingMem.id);
        } else {
          await this.supabaseAdmin
            .from('annual_memberships')
            .insert({
              booking_id: id,
              student_id: (updatedBooking as any).student_id || null,
              user_id: updatedBooking.userId || null,
              tax_code: sTaxCode,
              email: sEmail,
              phone: sPhone,
              academic_year: '2026/2027',
              status: 'active',
              paid_at: new Date().toISOString(),
              expires_at: '2027-08-31T23:59:59.000Z',
            });
        }

        // Update student annual_fee_paid status
        if (sTaxCode || sEmail) {
          let sQuery = this.supabaseAdmin
            .from('students')
            .update({
              annual_fee_paid: true,
              annual_fee_paid_at: new Date().toISOString(),
            });
          if (sTaxCode) {
            sQuery = sQuery.ilike('tax_code', sTaxCode);
          } else if (sEmail) {
            sQuery = sQuery.ilike('email', sEmail);
          }
          await sQuery;
        }
      } catch (syncErr) {
        this.logger.warn('Sync membership & payments error on booking status update:', syncErr);
      }
    }

    return this.mapBookingToResponse(updatedBooking);
  }

  async createAdminMembershipFee(dto: {
    studentId?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    taxCode?: string;
    birthDate?: string;
    paymentMethod?: string;
    status?: string;
  }) {
    let studentId = dto.studentId;
    const sEmail = (dto.email || '').trim() || null;
    const sTaxCode = (dto.taxCode || '').trim() || null;
    const pMethod = dto.paymentMethod || 'cash';
    const sName = (dto.fullName || 'Studente').trim();
    const isPaid = (dto.status || '').toLowerCase() === 'succeeded' || (dto.status || '').toLowerCase() === 'active' || (dto.status || '').toLowerCase() === 'paid';

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
            annual_fee_paid: isPaid,
            annual_fee_paid_at: isPaid ? new Date().toISOString() : null,
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
        status: isPaid ? 'active' : 'pending',
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
          studentId: studentId || null,
          amount: 30.0,
          paymentMethod: pMethod,
          type: 'registration_fee',
          status: isPaid ? 'succeeded' : 'pending',
          provider: 'manual',
          notes: `Quota d'iscrizione annuale A.A. 2026/2027 (${sName}) [membership_id:${membership.id}]`,
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
      // 1. Search in students table
      const { data: student } = await this.supabaseAdmin
        .from('students')
        .select('*')
        .or(`email.ilike.${q},tax_code.ilike.${q},phone.ilike.${q},full_name.ilike.%${q}%`)
        .limit(1)
        .maybeSingle();

      if (student) {
        const birthDateStr = student.birth_date
          ? (student.birth_date instanceof Date
              ? student.birth_date.toISOString().split('T')[0]
              : String(student.birth_date).split('T')[0])
          : '';
        return {
          found: true,
          purchaserName: student.full_name || '',
          purchaserEmail: student.email || '',
          purchaserPhone: student.phone || '',
          purchaserTaxCode: student.tax_code || '',
          studentName: student.full_name || '',
          studentEmail: student.email || '',
          studentPhone: student.phone || '',
          studentTaxCode: student.tax_code || '',
          studentBirthDate: birthDateStr,
        };
      }

      // 2. Search in annual_memberships table
      const { data: membership } = await this.supabaseAdmin
        .from('annual_memberships')
        .select('*')
        .or(`email.ilike.${q},tax_code.ilike.${q},phone.ilike.${q}`)
        .limit(1)
        .maybeSingle();

      if (membership) {
        return {
          found: true,
          purchaserEmail: membership.email || '',
          purchaserPhone: membership.phone || '',
          purchaserTaxCode: membership.tax_code || '',
          studentEmail: membership.email || '',
          studentPhone: membership.phone || '',
          studentTaxCode: membership.tax_code || '',
        };
      }

      // 3. Search in bookings table (purchaser AND student fields)
      const booking = await this.prisma.booking.findFirst({
        where: {
          OR: [
            { purchaserEmail: { contains: q, mode: 'insensitive' } },
            { purchaserTaxCode: { contains: q, mode: 'insensitive' } },
            { purchaserPhone: { contains: q, mode: 'insensitive' } },
            { purchaserName: { contains: q, mode: 'insensitive' } },
            { studentEmail: { contains: q, mode: 'insensitive' } },
            { studentTaxCode: { contains: q, mode: 'insensitive' } },
            { studentPhone: { contains: q, mode: 'insensitive' } },
            { studentName: { contains: q, mode: 'insensitive' } },
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
          studentBirthDate: booking.studentBirthDate ? booking.studentBirthDate.toISOString().split('T')[0] : '',
          isForChild: !!(booking.studentName && booking.studentName !== booking.purchaserName),
        };
      }

      return { found: false };
    } catch (err) {
      this.logger.error('Client lookup error:', err);
      return { found: false };
    }
  }

  async listClients() {
    try {
      const clientMap = new Map<string, any>();

      const makeKey = (taxCode?: string, email?: string, name?: string) => {
        if (taxCode && taxCode.trim()) return taxCode.trim().toLowerCase();
        if (email && email.trim()) return email.trim().toLowerCase();
        if (name && name.trim()) return name.trim().toLowerCase();
        return null;
      };

      // 1. From students table
      const { data: students } = await this.supabaseAdmin
        .from('students')
        .select('*')
        .order('full_name', { ascending: true });

      if (students && Array.isArray(students)) {
        for (const st of students) {
          const key = makeKey(st.tax_code, st.email, st.full_name);
          if (!key) continue;

          const birthDateStr = st.birth_date
            ? (st.birth_date instanceof Date ? st.birth_date.toISOString().split('T')[0] : String(st.birth_date).split('T')[0])
            : '';

          clientMap.set(key, {
            id: st.id,
            name: st.full_name || 'Cliente',
            taxCode: st.tax_code || '',
            email: st.email || '',
            phone: st.phone || '',
            birthDate: birthDateStr,
            purchaserName: st.full_name || '',
            purchaserEmail: st.email || '',
            purchaserPhone: st.phone || '',
            purchaserTaxCode: st.tax_code || '',
            studentName: st.full_name || '',
            studentEmail: st.email || '',
            studentPhone: st.phone || '',
            studentTaxCode: st.tax_code || '',
            studentBirthDate: birthDateStr,
            isForChild: false,
          });
        }
      }

      // 2. From bookings table
      const bookings = await this.prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 300,
      });

      for (const b of bookings) {
        const pName = (b.purchaserName || '').trim();
        const sName = (b.studentName || '').trim();
        const isChild = Boolean(sName && pName && sName.toLowerCase() !== pName.toLowerCase());

        const pKey = makeKey(b.purchaserTaxCode || undefined, b.purchaserEmail || undefined, b.purchaserName || undefined);
        const sKey = makeKey(b.studentTaxCode || undefined, b.studentEmail || undefined, b.studentName || undefined);

        if (isChild) {
          const existingStudent = sKey ? clientMap.get(sKey) : null;
          const mergedRecord = {
            id: b.id,
            name: `${sName} (Genitore: ${pName})`,
            taxCode: b.studentTaxCode || b.purchaserTaxCode || existingStudent?.taxCode || '',
            email: b.purchaserEmail || b.studentEmail || existingStudent?.email || '',
            phone: b.purchaserPhone || b.studentPhone || existingStudent?.phone || '',
            purchaserName: pName,
            purchaserEmail: b.purchaserEmail || '',
            purchaserPhone: b.purchaserPhone || '',
            purchaserTaxCode: b.purchaserTaxCode || '',
            studentName: sName,
            studentEmail: b.studentEmail || b.purchaserEmail || '',
            studentPhone: b.studentPhone || b.purchaserPhone || '',
            studentTaxCode: b.studentTaxCode || '',
            studentBirthDate: b.studentBirthDate
              ? b.studentBirthDate.toISOString().split('T')[0]
              : existingStudent?.birthDate || '',
            isForChild: true,
          };

          if (sKey) clientMap.set(sKey, mergedRecord);
          if (pKey && pKey !== sKey) clientMap.set(pKey, mergedRecord);
        } else if (pKey && !clientMap.has(pKey)) {
          clientMap.set(pKey, {
            id: b.id,
            name: pName || 'Cliente',
            taxCode: b.purchaserTaxCode || '',
            email: b.purchaserEmail || '',
            phone: b.purchaserPhone || '',
            purchaserName: pName,
            purchaserEmail: b.purchaserEmail || '',
            purchaserPhone: b.purchaserPhone || '',
            purchaserTaxCode: b.purchaserTaxCode || '',
            studentName: pName,
            studentEmail: b.purchaserEmail || '',
            studentPhone: b.purchaserPhone || '',
            studentTaxCode: b.purchaserTaxCode || '',
            isForChild: false,
          });
        }
      }

      const uniqueRecords = Array.from(new Set(clientMap.values()));

      return uniqueRecords.map((c) => {
        const taxPart = c.taxCode ? ` — ${c.taxCode}` : '';
        const emailPart = c.email ? ` (${c.email})` : '';
        return {
          ...c,
          label: `${c.name}${taxPart}${emailPart}`,
        };
      });
    } catch (err) {
      this.logger.error('List clients error:', err);
      return [];
    }
  }
}
