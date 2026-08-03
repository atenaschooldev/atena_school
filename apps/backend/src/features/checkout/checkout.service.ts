import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeClient = require('stripe');
import { CheckFeeDto, CreateReservationDto, VerifyPaymentDto } from './checkout.controller';
import { calculateLessonDates } from '../../shared/utils/bookingScheduler';

import { PrismaService } from '../../core/prisma/prisma.service';

export interface CourseRecord {
  id: string;
  name?: string;
  title_it?: string;
  category?: string;
  price: number | string;
  schedule_days?: number[] | null;
  lesson_duration_minutes?: number | null;
  start_time?: string | null;
  end_time?: string | null;
  schedule_type?: string | null;
}

@Injectable()
export class CheckoutService {
  private supabaseAdmin: SupabaseClient;
  private stripe: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_dev';

    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const StripeConstructor = typeof StripeClient === 'function' ? StripeClient : StripeClient.default;
    this.stripe = new StripeConstructor(stripeSecret, { apiVersion: '2023-10-16' });
  }

  async checkFeeStatus(dto: CheckFeeDto) {
    const cleanTax = dto.taxCode ? dto.taxCode.trim().toUpperCase() : null;
    const cleanEmail = dto.email ? dto.email.trim().toLowerCase() : null;
    const cleanPhone = dto.phone ? dto.phone.trim() : null;

    if (!cleanTax && !cleanEmail && !cleanPhone) {
      return { success: true, annualFeePaid: false, userFound: false };
    }

    if (cleanTax) {
      const { data: mem } = await this.supabaseAdmin
        .from('annual_memberships')
        .select('id')
        .ilike('tax_code', cleanTax)
        .eq('academic_year', '2026/2027')
        .eq('status', 'active')
        .maybeSingle();

      if (mem) return { success: true, annualFeePaid: true, userFound: true };

      const { data: st } = await this.supabaseAdmin
        .from('students')
        .select('id')
        .ilike('tax_code', cleanTax)
        .eq('annual_fee_paid', true)
        .maybeSingle();

      if (st) return { success: true, annualFeePaid: true, userFound: true };
    }

    if (cleanEmail) {
      const { data: mem } = await this.supabaseAdmin
        .from('annual_memberships')
        .select('id')
        .ilike('email', cleanEmail)
        .eq('academic_year', '2026/2027')
        .eq('status', 'active')
        .maybeSingle();

      if (mem) return { success: true, annualFeePaid: true, userFound: true };

      const { data: st } = await this.supabaseAdmin
        .from('students')
        .select('id')
        .ilike('email', cleanEmail)
        .eq('annual_fee_paid', true)
        .maybeSingle();

      if (st) return { success: true, annualFeePaid: true, userFound: true };
    }

    return { success: true, annualFeePaid: false, userFound: false };
  }

  private computeTotalLessonsCount(course: any, calculatedLessonsCount: number): number | null {
    // Fixed lessons package (e.g. Pacchetto 10, Lezioni Singole)
    if (course?.total_lessons != null) return course.total_lessons;
    // Hours-based course (e.g. EIPASS) — no fixed lesson count, stored as null
    if (course?.total_hours != null) return null;
    // Flexible with lessons_per_week (e.g. C2, C1 private) — estimate 1 month
    if (course?.lessons_per_week != null && course?.schedule_type === 'flexible') {
      return course.lessons_per_week * 4;
    }
    // Fixed schedule — use calendar-calculated count
    return calculatedLessonsCount || 8;
  }

  async createReservation(dto: CreateReservationDto) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
    let course: CourseRecord | null = null;

    if (isUuid) {
      const { data } = await this.supabaseAdmin.from('courses').select('*').eq('id', dto.itemId).maybeSingle();
      course = data;
    }
    if (!course) {
      const { data } = await this.supabaseAdmin.from('courses').select('*').eq('slug', dto.itemId).maybeSingle();
      course = data;
    }

    const courseId = course?.id || dto.itemId;
    const coursePrice = course ? Number(course.price) : 73.20;

    const feeStatus = await this.checkFeeStatus({
      taxCode: dto.isForChild ? dto.studentTaxCode : dto.purchaserTaxCode,
      email: dto.isForChild ? dto.studentEmail : dto.email,
      phone: dto.isForChild ? dto.studentPhone : dto.phone
    });

    const isFeeRequired = feeStatus.annualFeePaid === false && dto.includeRegistrationFee !== false;
    const regFee = isFeeRequired ? 30 : 0;
    const totalPaidAmount = coursePrice + regFee;

    const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();
    const studentName = dto.isForChild
      ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || purchaserName
      : purchaserName;

    const lessons = calculateLessonDates(
      dto.date || new Date().toISOString(),
      dto.time || '10:00',
      course?.category || 'general',
      course?.schedule_days || null,
      course?.lesson_duration_minutes || 60,
      course?.start_time || null,
      course?.end_time || null,
      course?.schedule_type || null
    );

    const subStartsAt = lessons.length > 0 ? lessons[0].startsAt : new Date().toISOString();
    const subEndsAtDate = new Date(subStartsAt);
    subEndsAtDate.setMonth(subEndsAtDate.getMonth() + 1);
    const subEndsAt = subEndsAtDate.toISOString();

    const { data: booking, error } = await this.supabaseAdmin
      .from('bookings')
      .insert({
        course_id: courseId,
        course_name: course?.name || course?.title_it || 'Corso Atena School',
        purchaser_name: purchaserName,
        purchaser_email: dto.email,
        purchaser_phone: dto.phone,
        purchaser_tax_code: dto.purchaserTaxCode || '',
        student_name: studentName,
        student_email: dto.isForChild ? (dto.studentEmail || dto.email) : dto.email,
        student_phone: dto.isForChild ? (dto.studentPhone || dto.phone) : dto.phone,
        student_tax_code: dto.isForChild ? (dto.studentTaxCode || '') : (dto.purchaserTaxCode || ''),
        student_birth_date: dto.studentBirthDate || null,
        start_date: dto.date || new Date().toISOString(),
        schedule_days: course?.schedule_days || null,
        start_time: course?.start_time || dto.time || null,
        end_time: course?.end_time || null,
        payment_status: 'reserved',
        payment_method: 'cash',
        amount_paid: totalPaidAmount,
        registration_fee: regFee,
        total_lessons_count: this.computeTotalLessonsCount(course, lessons.length),
        subscription_starts_at: subStartsAt,
        subscription_ends_at: subEndsAt,
        notes: dto.notes || '',
        sdi_code: dto.sdiCode || null,
        pec_email: dto.pecEmail || null,
      })
      .select('*')
      .single();

    if (error || !booking) {
      throw new BadRequestException(error?.message || 'Не удалось создать бронирование');
    }

    const purchaserEmail = dto.email;
    const purchaserTaxCode = dto.purchaserTaxCode || '';

    // Auto-link Auth User if purchaser email exists in auth.users
    let linkedUserId: string | null = null;
    if (purchaserEmail) {
      try {
        const { data: authUsers } = await this.supabaseAdmin.auth.admin.listUsers();
        const foundUser = authUsers?.users?.find((u) => u.email?.toLowerCase() === purchaserEmail.toLowerCase());
        if (foundUser) linkedUserId = foundUser.id;
      } catch (aErr) {
        console.warn('Auth user lookup error:', aErr);
      }
    }

    if (linkedUserId) {
      await this.supabaseAdmin.from('bookings').update({ user_id: linkedUserId }).eq('id', booking.id);
      booking.user_id = linkedUserId;
    }

    // Handle Parent student record & parent_id linking when isForChild is true
    let parentStudentId: string | null = null;
    if (dto.isForChild && (purchaserEmail || purchaserTaxCode)) {
      try {
        const pOrConds: string[] = [];
        if (purchaserEmail) pOrConds.push(`email.ilike.${purchaserEmail}`);
        if (purchaserTaxCode) pOrConds.push(`tax_code.ilike.${purchaserTaxCode}`);

        const { data: existingParent } = await this.supabaseAdmin
          .from('students')
          .select('id')
          .or(pOrConds.join(','))
          .maybeSingle();

        if (existingParent?.id) {
          parentStudentId = existingParent.id;
        } else {
          const { data: newParent } = await this.supabaseAdmin
            .from('students')
            .insert({
              full_name: purchaserName || 'Genitore',
              email: purchaserEmail || null,
              phone: dto.phone || null,
              tax_code: purchaserTaxCode || null,
              status: 'active',
              student_user_id: linkedUserId || null,
            })
            .select('id')
            .single();
          if (newParent?.id) parentStudentId = newParent.id;
        }
      } catch (pErr) {
        console.warn('Parent student creation error:', pErr);
      }
    }

    // Create / Update Student Record
    const sEmail = dto.isForChild ? (dto.studentEmail || dto.email) : dto.email;
    const sName = studentName || purchaserName || 'Studente';
    const sTaxCode = dto.isForChild ? (dto.studentTaxCode || dto.purchaserTaxCode) : dto.purchaserTaxCode;

    if (sEmail || sTaxCode) {
      try {
        const orConditions: string[] = [];
        if (sEmail) orConditions.push(`email.ilike.${sEmail}`);
        if (sTaxCode) orConditions.push(`tax_code.ilike.${sTaxCode}`);

        let studentAuthUserId: string | null = null;
        if (sEmail) {
          try {
            const { data: authUsers } = await this.supabaseAdmin.auth.admin.listUsers();
            const foundStudentUser = authUsers?.users?.find((u) => u.email?.toLowerCase() === sEmail.toLowerCase());
            if (foundStudentUser) studentAuthUserId = foundStudentUser.id;
          } catch {}
        }

        if (orConditions.length > 0) {
          const { data: existingStudent } = await this.supabaseAdmin
            .from('students')
            .select('id')
            .or(orConditions.join(','))
            .maybeSingle();

          let studentId: string | null = null;

          if (!existingStudent) {
            const { data: newStudent } = await this.supabaseAdmin
              .from('students')
              .insert({
                full_name: sName || 'Studente',
                email: sEmail,
                phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
                tax_code: sTaxCode || null,
                birth_date: dto.studentBirthDate || null,
                parent_id: parentStudentId || null,
                student_user_id: studentAuthUserId || null,
                status: 'active',
                annual_fee_paid: regFee > 0 || feeStatus.annualFeePaid,
              })
              .select('id')
              .single();

            studentId = newStudent?.id || null;
          } else {
            studentId = existingStudent.id;
            await this.supabaseAdmin
              .from('students')
              .update({
                full_name: sName || undefined,
                phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
                tax_code: sTaxCode || undefined,
                birth_date: dto.studentBirthDate || undefined,
                parent_id: parentStudentId || undefined,
                student_user_id: studentAuthUserId || undefined,
                annual_fee_paid: regFee > 0 || feeStatus.annualFeePaid ? true : undefined,
              })
              .eq('id', existingStudent.id);
          }

          if (studentId) {
            await this.supabaseAdmin.from('bookings').update({ student_id: studentId }).eq('id', booking.id);
          }

          if (regFee > 0 || feeStatus.annualFeePaid) {
            await this.supabaseAdmin.from('annual_memberships').upsert({
              tax_code: sTaxCode || null,
              email: sEmail || null,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
              academic_year: '2026/2027',
              status: 'active',
              student_id: studentId || null,
              user_id: linkedUserId || studentAuthUserId || null,
              booking_id: booking.id,
              paid_at: new Date().toISOString(),
              expires_at: '2027-08-31T23:59:59.000Z',
            }, { onConflict: 'booking_id' });
          }
        }
      } catch (sErr) {
        console.warn('Auto-create student error in backend checkout:', sErr);
      }
    }

    // Automatically generate and insert lessons into `lessons` table for Orari & Calendario
    if (lessons && lessons.length > 0) {
      try {
        const teacherId = (course as any)?.teacher_id || (course as any)?.teacherId || 'e1180b01-2222-4000-8000-000000000002';
        const lessonRows = lessons.map((l) => ({
          booking_id: booking.id,
          teacher_id: teacherId,
          starts_at: l.startsAt,
          ends_at: l.endsAt,
          status: 'scheduled',
          location_type: 'in_person',
          teacher_notes: 'Aula 101',
        }));
        await this.supabaseAdmin.from('lessons').insert(lessonRows);
      } catch (lErr) {
        console.warn('Auto-create lessons error in checkout:', lErr);
      }
    }

    return { success: true, bookingId: booking.id, booking };
  }

  async createStripeSession(dto: CreateReservationDto) {
    const siteUrl = this.configService.get<string>('NEXT_PUBLIC_SITE_URL') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let resolvedItemId = dto.itemId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
    if (!isUuid) {
      const { data: course } = await this.supabaseAdmin.from('courses').select('id').eq('slug', dto.itemId).maybeSingle();
      if (course?.id) {
        resolvedItemId = course.id;
      }
    }

    const { data: edgeData, error: edgeErr } = await this.supabaseAdmin.functions.invoke('create-checkout-session', {
      body: {
        itemType: dto.itemType || 'course',
        itemId: resolvedItemId,
        date: dto.date,
        time: dto.time,
        firstName: dto.firstName,
        lastName: dto.lastName,
        customerEmail: dto.email,
        phone: dto.phone,
        notes: dto.notes,
        studentFirstName: dto.studentFirstName,
        studentLastName: dto.studentLastName,
        studentEmail: dto.studentEmail,
        studentPhone: dto.studentPhone,
        purchaserTaxCode: dto.purchaserTaxCode,
        taxCode: dto.studentTaxCode || dto.purchaserTaxCode,
        studentBirthDate: dto.studentBirthDate,
        needsCompanyInvoice: dto.needsCompanyInvoice,
        sdiCode: dto.sdiCode,
        pecEmail: dto.pecEmail,
        includeRegistrationFee: dto.includeRegistrationFee,
        isForChild: dto.isForChild,
        origin: siteUrl,
      },
    });

    if (edgeErr || !edgeData?.url) {
      let detailMessage = edgeErr?.message || edgeData?.error || 'Ошибка создания сессии оплаты в Edge Function';
      if (edgeErr && (edgeErr as any).context) {
        try {
          const body = await (edgeErr as any).context.json();
          if (body?.error) detailMessage = body.error;
        } catch {}
      }
      throw new BadRequestException(detailMessage);
    }

    return { success: true, url: edgeData.url, bookingId: edgeData.bookingId };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const { data: edgeData, error: edgeErr } = await this.supabaseAdmin.functions.invoke('verify-payment', {
      body: {
        session_id: dto.sessionId,
        booking_id: dto.bookingId,
      },
    });

    if (edgeErr || edgeData?.error) {
      let detailMessage = edgeErr?.message || edgeData?.error || 'Ошибка подтверждения платежа';
      if (edgeErr && (edgeErr as any).context) {
        try {
          const body = await (edgeErr as any).context.json();
          if (body?.error) detailMessage = body.error;
        } catch {}
      }
      throw new BadRequestException(detailMessage);
    }

    return { success: true, booking: edgeData?.booking };
  }

  async handleStripeWebhook(body: any, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret || '');
    } catch (err: any) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    if (event && event.id) {
      const { data: existingEvent } = await this.supabaseAdmin
        .from('stripe_webhook_events')
        .select('id')
        .eq('stripe_event_id', event.id)
        .maybeSingle();

      if (existingEvent) {
        return { received: true, duplicate: true };
      }
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await this.supabaseAdmin
          .from('bookings')
          .update({ payment_status: 'paid' })
          .eq('id', bookingId);
      }
    }

    if (event && event.id) {
      await this.supabaseAdmin.from('stripe_webhook_events').insert({
        stripe_event_id: event.id,
        event_type: event.type,
      });
    }

    return { received: true };
  }

  async getItem(itemId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId);
    let item: any = null;

    if (isUuid) {
      const { data } = await this.supabaseAdmin
        .from('courses')
        .select('*, teachers!courses_teacher_id_fkey(full_name)')
        .eq('id', itemId)
        .maybeSingle();
      if (data) item = data;
    }

    if (!item) {
      const { data } = await this.supabaseAdmin
        .from('courses')
        .select('*, teachers!courses_teacher_id_fkey(full_name)')
        .eq('slug', itemId)
        .maybeSingle();
      if (data) item = data;
    }

    if (item && item.teachers?.full_name) {
      item.teacher_name = item.teachers.full_name;
    }

    return { success: true, item, course: item };
  }

  async getBookingDetails(bookingId: string) {
    const { data: booking, error } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (error || !booking) {
      return { success: false, error: 'Booking not found' };
    }

    const cid = booking.course_id || booking.item_id;
    let courseName = booking.course_name || 'Corso Atena School';

    if (cid) {
      const { data: course } = await this.supabaseAdmin
        .from('courses')
        .select('name, title_it')
        .eq('id', cid)
        .maybeSingle();

      if (course) {
        courseName = course.name || course.title_it || courseName;
      }
    }

    const amountPaid = Number(booking.amount_paid || 0);
    const regFee = Number(booking.registration_fee || 0);
    const coursePrice = amountPaid > 0 && regFee > 0 ? Math.max(0, amountPaid - regFee) : amountPaid;

    return {
      success: true,
      booking: {
        id: booking.id,
        course_name: courseName,
        amount_paid: amountPaid,
        registration_fee: regFee,
        course_price: coursePrice,
        item_price: coursePrice,
        student_name: booking.student_name || booking.purchaser_name || 'Studente',
        purchaser_name: booking.purchaser_name || booking.student_name || 'Acquirente',
        student_email: booking.student_email || booking.purchaser_email || '',
        payment_method: booking.payment_method || 'card',
        payment_status: booking.payment_status || 'reserved',
        start_date: booking.start_date || booking.booking_date,
      },
    };
  }

  async getPublicCourses() {
    const { data } = await this.supabaseAdmin
      .from('courses')
      .select('*, teachers!courses_teacher_id_fkey(full_name)')
      .in('status', ['active', 'published']);

    const courses = (data || []).map((c: any) => ({
      ...c,
      teacher_name: c.teachers?.full_name || undefined,
    }));

    return { success: true, courses };
  }

  async submitContact(dto: any) {
    const { error } = await this.supabaseAdmin
      .from('contact_messages')
      .insert({
        first_name: dto.nome,
        last_name: dto.cognome,
        email: dto.email,
        phone: dto.telefono || null,
        interest: dto.interesse || null,
        message: dto.messaggio,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { success: true };
  }

  // ─── Admin: Bookings Management ────────────────────────────────────────────

  async createAdminBooking(dto: {
    courseId?: string;
    courseName?: string;
    purchaserName: string;
    purchaserEmail: string;
    purchaserPhone?: string;
    purchaserTaxCode?: string;
    studentName?: string;
    studentEmail?: string;
    studentPhone?: string;
    studentTaxCode?: string;
    studentBirthDate?: string;
    amountPaid?: number;
    registrationFee?: number;
    paymentStatus?: string;
    paymentMethod?: string;
    sdiCode?: string;
    pecEmail?: string;
    notes?: string;
    startDate?: string;
  }) {
    let resolvedCourseId = dto.courseId;
    let resolvedCourseName = dto.courseName || 'Corso';

    if (!resolvedCourseId) {
      const foundCourse = await this.prisma.course.findFirst({
        where: dto.courseName ? { name: { contains: dto.courseName, mode: 'insensitive' } } : undefined,
      });
      if (foundCourse) {
        resolvedCourseId = foundCourse.id;
        resolvedCourseName = foundCourse.name;
      } else {
        const fallbackCourse = await this.prisma.course.findFirst();
        if (fallbackCourse) {
          resolvedCourseId = fallbackCourse.id;
          resolvedCourseName = fallbackCourse.name;
        }
      }
    }

    if (!resolvedCourseId) {
      throw new BadRequestException('No courses available in database');
    }

    const regFee = Number(dto.registrationFee || 0);
    const isForChild = !!(dto.studentName && dto.studentName !== dto.purchaserName);

    // Determine effective student identifiers
    const sEmail = isForChild ? (dto.studentEmail || dto.purchaserEmail) : dto.purchaserEmail;
    const sTaxCode = isForChild ? (dto.studentTaxCode || dto.purchaserTaxCode || null) : (dto.purchaserTaxCode || null);
    const sPhone = isForChild ? (dto.studentPhone || dto.purchaserPhone || null) : (dto.purchaserPhone || null);
    const sName = dto.studentName || dto.purchaserName;

    // ── 1. CREATE BOOKING ────────────────────────────────────────────────────
    const booking = await this.prisma.booking.create({
      data: {
        courseId: resolvedCourseId,
        courseName: resolvedCourseName,
        purchaserName: dto.purchaserName,
        purchaserEmail: dto.purchaserEmail,
        purchaserPhone: dto.purchaserPhone || null,
        purchaserTaxCode: dto.purchaserTaxCode || null,
        studentName: sName,
        studentEmail: sEmail,
        studentPhone: sPhone,
        studentTaxCode: sTaxCode || null,
        studentBirthDate: dto.studentBirthDate ? new Date(dto.studentBirthDate) : null,
        amountPaid: dto.amountPaid ?? 0,
        registrationFee: regFee,
        paymentStatus: dto.paymentStatus || 'reserved',
        paymentMethod: dto.paymentMethod || 'cash',
        sdiCode: dto.sdiCode || null,
        pecEmail: dto.pecEmail || null,
        notes: dto.notes || null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        schedulingStatus: 'pending_coordination',
      },
    });

    // ── 2. CREATE/UPDATE STUDENT RECORD (parity with landing) ────────────────
    let studentId: string | null = null;
    try {
      const orConditions: string[] = [];
      if (sEmail) orConditions.push(`email.ilike.${sEmail}`);
      if (sTaxCode) orConditions.push(`tax_code.ilike.${sTaxCode}`);

      if (orConditions.length > 0) {
        const { data: existingStudent } = await this.supabaseAdmin
          .from('students')
          .select('id')
          .or(orConditions.join(','))
          .maybeSingle();

        if (existingStudent?.id) {
          studentId = existingStudent.id;
          await this.supabaseAdmin
            .from('students')
            .update({
              full_name: sName || undefined,
              phone: sPhone || undefined,
              tax_code: sTaxCode || undefined,
              birth_date: dto.studentBirthDate || undefined,
              annual_fee_paid: regFee > 0 ? true : undefined,
            })
            .eq('id', existingStudent.id);
        } else {
          const { data: newStudent } = await this.supabaseAdmin
            .from('students')
            .insert({
              full_name: sName || 'Studente',
              email: sEmail || null,
              phone: sPhone || null,
              tax_code: sTaxCode || null,
              birth_date: dto.studentBirthDate || null,
              status: 'active',
              annual_fee_paid: regFee > 0,
            })
            .select('id')
            .single();
          if (newStudent?.id) studentId = newStudent.id;
        }

        // If isForChild, create parent student record too
        if (isForChild && (dto.purchaserEmail || dto.purchaserTaxCode)) {
          const pOrConds: string[] = [];
          if (dto.purchaserEmail) pOrConds.push(`email.ilike.${dto.purchaserEmail}`);
          if (dto.purchaserTaxCode) pOrConds.push(`tax_code.ilike.${dto.purchaserTaxCode}`);

          const { data: existingParent } = await this.supabaseAdmin
            .from('students')
            .select('id')
            .or(pOrConds.join(','))
            .maybeSingle();

          if (!existingParent) {
            await this.supabaseAdmin.from('students').insert({
              full_name: dto.purchaserName || 'Genitore',
              email: dto.purchaserEmail || null,
              phone: dto.purchaserPhone || null,
              tax_code: dto.purchaserTaxCode || null,
              status: 'active',
            });
          }
        }

        // Link student_id to booking
        if (studentId) {
          await this.supabaseAdmin
            .from('bookings')
            .update({ student_id: studentId })
            .eq('id', booking.id);
        }
      }
    } catch (err) {
      console.warn('Admin booking: student create/update error:', err);
    }

    // ── 3. CREATE ANNUAL MEMBERSHIP (with student identifiers) ────────────────
    if (regFee > 0) {
      try {
        await this.supabaseAdmin.from('annual_memberships').upsert({
          tax_code: sTaxCode || null,
          email: sEmail || null,
          phone: sPhone || null,
          academic_year: '2026/2027',
          status: 'active',
          student_id: studentId || null,
          user_id: null,
          booking_id: booking.id,
          paid_at: new Date().toISOString(),
          expires_at: '2027-08-31T23:59:59Z',
        }, { onConflict: 'booking_id' });
      } catch (err) {
        console.error('Admin booking: annual_membership create error:', err);
      }
    }

    // ── 4. CREATE PAYMENT ENTRIES (split: corso + quota d'iscrizione) ─────────
    const courseAmount = Number(dto.amountPaid || 0);
    const paymentStatus = dto.paymentStatus === 'completed' ? 'succeeded' : 'pending';
    const paymentMethod = dto.paymentMethod || 'cash';

    try {
      // 4a. Course payment — always created if amount > 0
      if (courseAmount > 0) {
        await this.prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: courseAmount,
            paymentMethod,
            type: 'payment',
            status: paymentStatus,
            provider: 'manual',
            notes: `Corso: ${resolvedCourseName}`,
          },
        });
      }

      // 4b. Registration fee — separate record when > 0
      if (regFee > 0) {
        await this.prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: regFee,
            paymentMethod,
            type: 'registration_fee',
            status: paymentStatus,
            provider: 'manual',
            notes: `Quota d'iscrizione A.A. 2026/2027`,
          },
        });
      }
    } catch (err) {
      console.error('Admin booking: payment create error:', err);
    }

    // ── 5. GENERATE LESSONS via calculateLessonDates (parity with landing) ────
    if (dto.startDate && resolvedCourseId) {
      try {
        const course = await this.prisma.course.findUnique({
          where: { id: resolvedCourseId },
          include: { courseTeachers: true },
        });

        if (course) {
          const teacherId = course.courseTeachers?.[0]?.teacherId || null;
          const rawDays = (course.scheduleDays as any[]) || [];
          const scheduleDays = rawDays.length > 0 ? rawDays.map(Number).filter((n) => !isNaN(n)) : [1, 3];
          const startTime = course.startTime || '16:00';
          const durationMinutes = course.lessonDurationMinutes || 60;

          // Use the same shared calculateLessonDates as landing (100% parity)
          const lessons = calculateLessonDates(
            dto.startDate,
            startTime,
            (course as any).category || (course as any).categoria || '',
            scheduleDays,
            durationMinutes,
            course.startTime || null,
            course.endTime || null,
            course.scheduleType || null,
          );

          if (lessons.length > 0) {
            const lessonRows = lessons.map((l) => ({
              bookingId: booking.id,
              teacherId: teacherId,
              startsAt: new Date(l.startsAt),
              endsAt: new Date(l.endsAt),
              status: 'scheduled',
            }));

            await this.prisma.lesson.createMany({ data: lessonRows });

            await this.prisma.booking.update({
              where: { id: booking.id },
              data: {
                schedulingStatus: 'scheduled',
                totalLessonsCount: lessons.length,
              },
            });
          }
        }
      } catch (err) {
        console.error('Admin booking: lesson generation error:', err);
      }
    }

    return booking;
  }


  async listAllBookings() {
    const { data, error } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async updateBookingPaymentStatus(id: string, dto: { payment_status?: string; scheduling_status?: string }) {
    const update: Record<string, string> = {};
    if (dto.payment_status) update.payment_status = dto.payment_status;
    if (dto.scheduling_status) update.scheduling_status = dto.scheduling_status;

    const { data, error } = await this.supabaseAdmin
      .from('bookings')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deleteBooking(id: string) {
    const { data: existing, error: findError } = await this.supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (findError) throw new BadRequestException(findError.message);
    if (!existing) throw new NotFoundException(`Booking ${id} not found`);

    const { error: lessonsError } = await this.supabaseAdmin
      .from('lessons')
      .delete()
      .eq('booking_id', id);

    if (lessonsError) throw new BadRequestException(lessonsError.message);

    const { error: membershipsError } = await this.supabaseAdmin
      .from('annual_memberships')
      .delete()
      .eq('booking_id', id);

    if (membershipsError) throw new BadRequestException(membershipsError.message);

    const { error: bookingError } = await this.supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id);

    if (bookingError) throw new BadRequestException(bookingError.message);

    return { success: true };
  }


  async lookupClient(query: string) {
    if (!query || !query.trim()) return { found: false };

    const q = query.trim();
    try {
      // 1. Search students table
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

      // 2. Search bookings table (using correct column names)
      const { data: booking } = await this.supabaseAdmin
        .from('bookings')
        .select('*')
        .or(`purchaser_email.ilike.${q},purchaser_tax_code.ilike.${q},purchaser_phone.ilike.${q},purchaser_name.ilike.%${q}%`)
        .limit(1)
        .maybeSingle();

      if (booking) {
        return {
          found: true,
          purchaserName: booking.purchaser_name || '',
          purchaserEmail: booking.purchaser_email || '',
          purchaserPhone: booking.purchaser_phone || '',
          purchaserTaxCode: booking.purchaser_tax_code || '',
          studentName: booking.student_name || '',
          studentTaxCode: booking.student_tax_code || '',
          studentPhone: booking.student_phone || '',
          studentEmail: booking.student_email || '',
          studentBirthDate: booking.student_birth_date || '',
          isForChild: !!(booking.student_name && booking.student_name !== booking.purchaser_name),
        };
      }

      return { found: false };
    } catch (err) {
      console.error('Client lookup error:', err);
      return { found: false };
    }
  }
}

