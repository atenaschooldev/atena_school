import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CheckoutService } from '../public/checkout.public.service';
import { CheckoutCoreService } from '../checkout-core.service';
import { calculateLessonDates, getCurrentAcademicYear } from '@atena/utils';
import { generateNextMembershipNumber } from '@atena/core';
import {
  BookingPaymentStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  BillingScheme,
  PaymentCurrency,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  LessonStatus,
  parsePaymentMethod,
  BOOKING_PAYMENT_STATUS_ID_TO_STRING,
  BOOKING_SCHEDULING_STATUS_ID_TO_STRING,
  PAYMENT_METHOD_ID_TO_STRING,
  BOOKING_PAYMENT_STATUS_STRING_TO_ID,
  PAYMENT_METHOD_STRING_TO_ID,
  BOOKING_SCHEDULING_STATUS_STRING_TO_ID,
  BILLING_SCHEME_STRING_TO_ID,
  MembershipStatus,
  StudentStatus,
  LanguageLevel,
  ACADEMIC_YEAR,
} from '@atena/api-types';

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
      payment_status_id: b.paymentStatus,
      payment_method: b.paymentMethod,
      payment_method_id: b.paymentMethod,
      scheduling_status: b.schedulingStatus,
      scheduling_status_id: b.schedulingStatus,
      booking_status: b.booking_status,
      billing_scheme: b.billingScheme,
      schedule_days: b.scheduleDays || [],
      start_time: b.startTime ?? null,
      end_time: b.endTime ?? null,
      start_date: b.startDate ? (b.startDate instanceof Date ? b.startDate.toISOString() : b.startDate) : null,
      sdi_code: b.sdiCode ?? null,
      pec_email: b.pecEmail ?? null,
      notes: b.notes ?? null,
      total_lessons_count: b.totalLessonsCount ?? null,
      subscription_starts_at: b.subscriptionStartsAt ? (b.subscriptionStartsAt instanceof Date ? b.subscriptionStartsAt.toISOString() : b.subscriptionStartsAt) : null,
      subscription_ends_at: b.subscriptionEndsAt ? (b.subscriptionEndsAt instanceof Date ? b.subscriptionEndsAt.toISOString() : b.subscriptionEndsAt) : null,
      group_id: b.groupId ?? b.group_id ?? null,
      group: b.group
        ? {
            id: b.group.id,
            name: b.group.name,
            room: b.group.room ?? null,
            schedule_days: b.group.scheduleDays ?? [],
            start_time: b.group.startTime ?? null,
            end_time: b.group.endTime ?? null,
          }
        : null,
      created_at: b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt) : new Date().toISOString(),
    };
    if (payments !== undefined) {
      (base as any).financial_summary = this.computeFinancialSummary(b, payments);
    }
    return base;
  }

  private computeFinancialSummary(b: any, payments: any[]) {
    const paidSum = payments
      .filter((p) => p.status === PaymentRecordStatus.SUCCEEDED || (p.status || '').toString().toLowerCase() === 'succeeded')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const rawAmount = Number(b.amountPaid || 0);
    const regFee = Number(b.registrationFee || 30);
    const totalTarget = rawAmount > 0 ? rawAmount : regFee;
    const remaining = Math.max(0, totalTarget - paidSum);

    const registrationFeePaid = payments.some(
      (p) =>
        (p.type === PaymentType.REGISTRATION_FEE || p.type === 'registration_fee' || Number(p.amount) === 30) &&
        (p.status === PaymentRecordStatus.SUCCEEDED || (p.status || '').toString().toLowerCase() === 'succeeded'),
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
        where: { paymentStatus: BookingPaymentStatus.PAID },
      }),
      this.prisma.booking.count({ where: { paymentStatus: BookingPaymentStatus.RESERVED } }),
      this.prisma.booking.count({ where: { schedulingStatus: BookingSchedulingStatus.PENDING_COORDINATION } }),
    ]);
    return { totalCount, paidCount, reservedCount, leadsCount };
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { group: true },
    });
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
      const numStatus = Number(status);
      if (!isNaN(numStatus)) {
        where.paymentStatus = numStatus;
      }
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
          include: { group: true },
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
      include: { group: true },
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
    students?: Array<{
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      taxCode: string;
      birthDate?: string;
      birthPlace?: string;
    }>;
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
    groupId?: string;
  }) {
    let resolvedCourseId = dto.courseId;
    if (!resolvedCourseId) {
      const foundCourse = await this.prisma.course.findFirst({
        where: dto.courseName ? { name: { contains: dto.courseName, mode: 'insensitive' } } : undefined,
      });
      if (foundCourse) {
        resolvedCourseId = foundCourse.id.toString();
      } else {
        const fallbackCourse = await this.prisma.course.findFirst();
        if (fallbackCourse) {
          resolvedCourseId = fallbackCourse.id.toString();
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
      const taxCodeToCheck = isForChild ? (dto.studentTaxCode || dto.purchaserTaxCode) : dto.purchaserTaxCode;
      const feeStatus = await this.checkoutService.checkFeeStatus({ taxCode: taxCodeToCheck });
      const profile = await this.checkoutService.getSchoolProfile();
      const defaultFee = profile?.registration_fee_enabled !== false ? (profile?.registration_fee_eur != null ? Number(profile.registration_fee_eur) : 30) : 0;
      finalRegFee = feeStatus.annualFeePaid ? 0 : defaultFee;
    }

    const normalizedStatus = typeof dto.paymentStatus === 'number'
      ? dto.paymentStatus
      : (BOOKING_PAYMENT_STATUS_STRING_TO_ID[(dto.paymentStatus || '').toLowerCase()] || BookingPaymentStatus.RESERVED);

    const normalizedMethod = typeof dto.paymentMethod === 'number'
      ? dto.paymentMethod
      : (PAYMENT_METHOD_STRING_TO_ID[(dto.paymentMethod || '').toLowerCase()] || PaymentMethod.CASH);

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
      students: dto.students && dto.students.length > 0 ? (dto.students as any) : undefined,
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
      paymentMethod: normalizedMethod,
      groupId: dto.groupId || undefined,
    });

    const bookingId = reservation.booking?.id;

    if (bookingId) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          billingScheme: BillingScheme.FULL,
          paymentStatus: normalizedStatus,
        },
      });
    }

    return reservation.booking;
  }

  async getBookingLessons(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const where: any = booking.groupId
      ? { OR: [{ bookingId }, { groupId: booking.groupId }] }
      : { bookingId };

    const lessons = await this.prisma.lesson.findMany({
      where,
      orderBy: { startsAt: 'asc' },
    });

    return lessons.map((l) => ({
      id: l.id ? l.id.toString() : '',
      booking_id: l.bookingId,
      group_id: l.groupId ? l.groupId.toString() : null,
      starts_at: l.startsAt,
      ends_at: l.endsAt,
      status: l.status,
      attendance: l.attendance,
      teacher_notes: l.teacherNotes,
      location_type: (l as any).locationType,
    }));
  }

  async completeLesson(bookingId: string, lessonId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException(`Booking ${bookingId} not found`);

    const bigLessonId = BigInt(lessonId);
    const lesson = await this.prisma.lesson.findUnique({ where: { id: bigLessonId } });
    if (!lesson || (lesson.bookingId !== bookingId && (!booking.groupId || lesson.groupId !== booking.groupId))) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }

    await this.prisma.lesson.update({
      where: { id: bigLessonId },
      data: {
        status: LessonStatus.COMPLETED,
      },
    });

    return { success: true, lesson_id: lessonId };
  }

  async updateBookingPaymentStatus(id: string, dto: { payment_status?: number; scheduling_status?: number }) {
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
      payment_status?: number;
      payment_method?: number;
      scheduling_status?: number;
      notes?: string;
    },
  ) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Booking ${id} not found`);

    const updateData: Record<string, any> = {};
    if (dto.payment_status !== undefined) updateData.paymentStatus = Number(dto.payment_status);
    if (dto.payment_method !== undefined) updateData.paymentMethod = Number(dto.payment_method);
    if (dto.scheduling_status !== undefined) updateData.schedulingStatus = Number(dto.scheduling_status);
    if (dto.purchaser_name !== undefined) updateData.purchaserName = dto.purchaser_name;
    if (dto.purchaser_email !== undefined) updateData.purchaserEmail = dto.purchaser_email;
    if (dto.purchaser_phone !== undefined) updateData.purchaserPhone = dto.purchaser_phone;
    if (dto.purchaser_tax_code !== undefined) updateData.purchaserTaxCode = dto.purchaser_tax_code;
    if (dto.student_name !== undefined) updateData.studentName = dto.student_name;
    if (dto.student_email !== undefined) updateData.studentEmail = dto.student_email;
    if (dto.student_phone !== undefined) updateData.studentPhone = dto.student_phone;
    if (dto.student_tax_code !== undefined) updateData.studentTaxCode = dto.student_tax_code;
    if (dto.student_birth_date !== undefined) updateData.studentBirthDate = dto.student_birth_date ? new Date(dto.student_birth_date) : null;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data: updateData,
    });

    // Synchronize payments and annual_memberships table when status becomes paid/succeeded
    if (dto.payment_status === BookingPaymentStatus.PAID) {
      try {
        await this.prisma.payment.updateMany({
          where: { bookingId: id },
          data: { status: PaymentRecordStatus.SUCCEEDED, paidAt: new Date() },
        });

        // Fetch the registration fee payment if exists
        const regFeePayment = await this.prisma.payment.findFirst({
          where: {
            bookingId: id,
            type: PaymentType.REGISTRATION_FEE,
          },
        });

        // Activate or create membership in annual_memberships table
        const sTaxCode = updatedBooking.studentTaxCode || updatedBooking.purchaserTaxCode || null;
        const sEmail = updatedBooking.studentEmail || updatedBooking.purchaserEmail || null;

        if (sTaxCode) {
          const { data: existingMem } = await this.supabaseAdmin
            .from('annual_memberships')
            .select('id, membership_number')
            .ilike('tax_code', sTaxCode)
            .eq('academic_year', ACADEMIC_YEAR.CURRENT)
            .maybeSingle();

          const nextMembershipNumber = await generateNextMembershipNumber(this.supabaseAdmin, ACADEMIC_YEAR.CURRENT);

          if (existingMem?.id) {
            await this.supabaseAdmin
              .from('annual_memberships')
              .update({
                status: MembershipStatus.ACTIVE,
                membership_number: existingMem.membership_number || nextMembershipNumber,
                tax_code: sTaxCode,
                student_id: (updatedBooking as any).student_id || null,
                user_id: updatedBooking.userId || null,
                payment_id: regFeePayment?.id || undefined,
                payment_method: updatedBooking.paymentMethod || undefined,
                amount: regFeePayment ? Number(regFeePayment.amount) : Number((updatedBooking as any).registration_fee || (updatedBooking as any).registrationFee || 0),
                paid_at: new Date().toISOString(),
              })
              .eq('id', existingMem.id);
          } else {
            await this.supabaseAdmin
              .from('annual_memberships')
              .insert({
                student_id: (updatedBooking as any).student_id || null,
                user_id: updatedBooking.userId || null,
                tax_code: sTaxCode,
                membership_number: nextMembershipNumber,
                academic_year: ACADEMIC_YEAR.CURRENT,
                status: MembershipStatus.ACTIVE,
                payment_id: regFeePayment?.id || null,
                payment_method: updatedBooking.paymentMethod || 1,
                amount: regFeePayment ? Number(regFeePayment.amount) : Number((updatedBooking as any).registration_fee || (updatedBooking as any).registrationFee || 0),
                paid_at: new Date().toISOString(),
                expires_at: ACADEMIC_YEAR.EXPIRY_DATE,
              });
          }
        }

        // Update student annual_fee_paid status and activate profile
        const targetStudentId = (updatedBooking as any).student_id || (updatedBooking as any).studentId;
        if (targetStudentId) {
          await this.supabaseAdmin
            .from('students')
            .update({
              status: 'active',
              annual_fee_paid: true,
              annual_fee_paid_at: new Date().toISOString(),
            })
            .eq('id', targetStudentId);
        } else if (sTaxCode || sEmail) {
          let sQuery = this.supabaseAdmin
            .from('students')
            .update({
              status: 'active',
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
            language_level: LanguageLevel.A1,
            registration_date: new Date().toISOString().split('T')[0],
            status: isPaid ? StudentStatus.ACTIVE : StudentStatus.INACTIVE,
            annual_fee_paid: isPaid,
            annual_fee_paid_at: isPaid ? new Date().toISOString() : null,
          })
          .select('id')
          .single();

        if (sErr) throw new BadRequestException(sErr.message);
        if (newStudent?.id) studentId = newStudent.id;
      }
    }

    const profile = await this.checkoutService.getSchoolProfile();
    const { academicYear: fallbackAcademicYear, expiresAt: fallbackExpiresAt } = getCurrentAcademicYear();
    const academicYear = (dto as any).academicYear || profile?.academic_year || fallbackAcademicYear;
    const feeAmount = (dto as any).amount != null
      ? Number((dto as any).amount)
      : profile?.registration_fee_eur != null
      ? Number(profile.registration_fee_eur)
      : 30.0;

    const paymentMethodNum = parsePaymentMethod(pMethod) ?? PaymentMethod.CASH;

    // Check if membership already exists for this student/taxCode and academic year
    let existingMem: any = null;
    if (studentId) {
      const { data } = await this.supabaseAdmin
        .from('annual_memberships')
        .select('*')
        .eq('student_id', studentId)
        .eq('academic_year', academicYear)
        .maybeSingle();
      if (data?.id) existingMem = data;
    }
    if (!existingMem && sTaxCode) {
      const { data } = await this.supabaseAdmin
        .from('annual_memberships')
        .select('*')
        .ilike('tax_code', sTaxCode)
        .eq('academic_year', academicYear)
        .maybeSingle();
      if (data?.id) existingMem = data;
    }

    if (existingMem) {
      if (existingMem.status === MembershipStatus.ACTIVE && isPaid) {
        throw new BadRequestException(
          `Questo studente ha già una quota associativa attiva (Tessera: ${existingMem.membership_number || 'N/D'}) per l'A.A. ${academicYear}`,
        );
      }

      const finalNumber = isPaid
        ? (existingMem.membership_number || await generateNextMembershipNumber(this.supabaseAdmin, academicYear))
        : existingMem.membership_number;

      const { data: updatedMem, error: uErr } = await this.supabaseAdmin
        .from('annual_memberships')
        .update({
          status: isPaid ? MembershipStatus.ACTIVE : MembershipStatus.PENDING,
          amount: feeAmount,
          payment_method: paymentMethodNum,
          membership_number: finalNumber,
          paid_at: isPaid ? (existingMem.paid_at || new Date().toISOString()) : null,
          expires_at: fallbackExpiresAt,
          student_id: studentId || existingMem.student_id,
          tax_code: sTaxCode || existingMem.tax_code,
        })
        .eq('id', existingMem.id)
        .select('*')
        .single();

      if (uErr) throw new BadRequestException(uErr.message);

      let paymentId = existingMem.payment_id;
      if (paymentId) {
        await this.prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: isPaid ? PaymentRecordStatus.SUCCEEDED : PaymentRecordStatus.PENDING,
            paymentMethod: paymentMethodNum,
            paidAt: isPaid ? new Date() : null,
            amount: feeAmount,
          },
        }).catch(() => null);
      } else {
        const createdPayment = await this.prisma.payment.create({
          data: {
            bookingId: null,
            studentId: studentId || null,
            amount: feeAmount,
            currency: PaymentCurrency.EUR,
            paymentMethod: paymentMethodNum,
            type: PaymentType.REGISTRATION_FEE,
            status: isPaid ? PaymentRecordStatus.SUCCEEDED : PaymentRecordStatus.PENDING,
            provider: PaymentProvider.MANUAL,
            notes: `Quota d'iscrizione annuale A.A. ${academicYear} (${sName}) [membership_id:${existingMem.id}]`,
            paidAt: isPaid ? new Date() : null,
          },
        });
        await this.supabaseAdmin
          .from('annual_memberships')
          .update({ payment_id: createdPayment.id })
          .eq('id', existingMem.id);
      }

      if (isPaid && studentId) {
        await this.supabaseAdmin
          .from('students')
          .update({
            status: 'active',
            annual_fee_paid: true,
            annual_fee_paid_at: new Date().toISOString(),
          })
          .eq('id', studentId);
      }

      return { success: true, membership: updatedMem };
    }

    const nextMembershipNumber = isPaid
      ? await generateNextMembershipNumber(this.supabaseAdmin, academicYear)
      : null;

    const { data: membership, error: mErr } = await this.supabaseAdmin
      .from('annual_memberships')
      .insert({
        student_id: studentId || null,
        tax_code: sTaxCode,
        academic_year: academicYear,
        status: isPaid ? MembershipStatus.ACTIVE : MembershipStatus.PENDING,
        amount: feeAmount,
        payment_method: paymentMethodNum,
        membership_number: nextMembershipNumber,
        paid_at: isPaid ? new Date().toISOString() : null,
        expires_at: fallbackExpiresAt,
      })
      .select('*')
      .single();

    if (mErr) throw new BadRequestException(mErr.message);

    try {
      const createdPayment = await this.prisma.payment.create({
        data: {
          bookingId: null,
          studentId: studentId || null,
          amount: feeAmount,
          currency: PaymentCurrency.EUR,
          paymentMethod: paymentMethodNum,
          type: PaymentType.REGISTRATION_FEE,
          status: isPaid ? PaymentRecordStatus.SUCCEEDED : PaymentRecordStatus.PENDING,
          provider: PaymentProvider.MANUAL,
          notes: `Quota d'iscrizione annuale A.A. ${academicYear} (${sName}) [membership_id:${membership.id}]`,
          paidAt: isPaid ? new Date() : null,
        },
      });

      if (createdPayment?.id && membership?.id) {
        await this.supabaseAdmin
          .from('annual_memberships')
          .update({ payment_id: createdPayment.id })
          .eq('id', membership.id);
      }
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

        const { academicYear } = getCurrentAcademicYear();
        const { data: mem } = await this.supabaseAdmin
          .from('annual_memberships')
          .select('id, status, membership_number')
          .or(`student_id.eq.${student.id},tax_code.ilike.${student.tax_code || 'NONE'}`)
          .eq('academic_year', academicYear)
          .maybeSingle();

        return {
          found: true,
          studentId: student.id,
          purchaserName: student.full_name || '',
          purchaserEmail: student.email || '',
          purchaserPhone: student.phone || '',
          purchaserTaxCode: student.tax_code || '',
          studentName: student.full_name || '',
          studentEmail: student.email || '',
          studentPhone: student.phone || '',
          studentTaxCode: student.tax_code || '',
          studentBirthDate: birthDateStr,
          annualFeePaid: student.annual_fee_paid,
          annualFeePaidAt: student.annual_fee_paid_at,
          membershipId: mem?.id || null,
          membershipStatus: mem?.status != null ? Number(mem.status) : null,
          membershipNumber: mem?.membership_number || null,
        };
      }

      // 2. Search in annual_memberships table
      const { data: membership } = await this.supabaseAdmin
        .from('annual_memberships')
        .select('*')
        .ilike('tax_code', q)
        .limit(1)
        .maybeSingle();

      if (membership) {
        return {
          found: true,
          purchaserTaxCode: membership.tax_code || '',
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
        const allFamilyBookings = await this.prisma.booking.findMany({
          where: {
            OR: [
              ...(booking.purchaserEmail ? [{ purchaserEmail: booking.purchaserEmail }] : []),
              ...(booking.purchaserTaxCode ? [{ purchaserTaxCode: booking.purchaserTaxCode }] : []),
              ...(booking.purchaserPhone ? [{ purchaserPhone: booking.purchaserPhone }] : []),
            ],
          },
          select: {
            studentName: true,
            studentTaxCode: true,
            studentBirthDate: true,
            studentEmail: true,
            studentPhone: true,
          },
        });

        const savedStudentsMap = new Map<string, any>();
        for (const fb of allFamilyBookings) {
          if (fb.studentName) {
            const parts = fb.studentName.trim().split(' ');
            const sFirst = parts[0] || '';
            const sLast = parts.slice(1).join(' ') || '';
            const sKey = (fb.studentTaxCode || fb.studentName).toLowerCase();
            if (!savedStudentsMap.has(sKey)) {
              savedStudentsMap.set(sKey, {
                firstName: sFirst,
                lastName: sLast,
                taxCode: fb.studentTaxCode || '',
                birthDate: fb.studentBirthDate ? (fb.studentBirthDate instanceof Date ? fb.studentBirthDate.toISOString().split('T')[0] : String(fb.studentBirthDate).split('T')[0]) : '',
                email: fb.studentEmail || '',
                phone: fb.studentPhone || '',
              });
            }
          }
        }

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
          savedStudents: Array.from(savedStudentsMap.values()),
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
