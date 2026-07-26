import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeClient = require('stripe');
import { CheckFeeDto, CreateReservationDto, VerifyPaymentDto } from './checkout.controller';
import { calculateLessonDates } from '../../shared/utils/bookingScheduler';

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

  constructor(private configService: ConfigService) {
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
}
