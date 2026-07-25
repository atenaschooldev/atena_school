import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeClient = require('stripe');
import { CheckFeeDto, CreateReservationDto, VerifyPaymentDto } from './checkout.controller';
import { calculateLessonDates } from '../../shared/utils/bookingScheduler';

@Injectable()
export class CheckoutService {
  private supabaseAdmin: SupabaseClient;
  private stripe: any;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
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

  async createReservation(dto: CreateReservationDto) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
    let course: any = null;

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
        booking_time: dto.time || '10:00',
        payment_status: 'reserved',
        payment_method: 'cash',
        amount_paid: totalPaidAmount,
        registration_fee: regFee,
        total_lessons_count: lessons.length || 8,
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

    // Auto-create / update student record in public.students table
    const sEmail = dto.isForChild ? (dto.studentEmail || dto.email) : dto.email;
    const sName = studentName || purchaserName || 'Studente';
    const sTaxCode = dto.isForChild ? (dto.studentTaxCode || dto.purchaserTaxCode) : dto.purchaserTaxCode;

    if (sEmail || sTaxCode) {
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

          if (!existingStudent) {
            await this.supabaseAdmin.from('students').insert({
              full_name: sName || 'Studente',
              email: sEmail,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
              tax_code: sTaxCode || null,
              birth_date: dto.studentBirthDate || null,
              status: 'active',
              annual_fee_paid: regFee > 0 || feeStatus.annualFeePaid,
            });
          } else {
            await this.supabaseAdmin.from('students').update({
              full_name: sName || undefined,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
              tax_code: sTaxCode || undefined,
              birth_date: dto.studentBirthDate || undefined,
              annual_fee_paid: regFee > 0 || feeStatus.annualFeePaid ? true : undefined,
            }).eq('id', existingStudent.id);
          }
        }
      } catch (sErr) {
        console.warn('Auto-create student error in backend checkout:', sErr);
      }
    }

    return { success: true, bookingId: booking.id, booking };
  }

  async createStripeSession(dto: CreateReservationDto) {
    const reservation = await this.createReservation(dto);
    const booking = reservation.booking;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: booking.course_name,
          },
          unit_amount: Math.round(Number(booking.amount_paid - booking.registration_fee) * 100),
        },
        quantity: 1,
      },
    ];

    if (booking.registration_fee > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: "Quota d'iscrizione annuale (Atena School)",
          },
          unit_amount: 3000,
        },
        quantity: 1,
      });
    }

    const siteUrl = this.configService.get<string>('NEXT_PUBLIC_SITE_URL') || 'https://atena-school.vercel.app';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: dto.email,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}&email=${encodeURIComponent(dto.email)}`,
      cancel_url: `${siteUrl}/checkout/course/${dto.itemId}`,
      metadata: {
        booking_id: booking.id,
      },
    });

    return { success: true, url: session.url, bookingId: booking.id };
  }

  async verifyPayment(dto: VerifyPaymentDto) {
    const session = await this.stripe.checkout.sessions.retrieve(dto.sessionId);
    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Платеж не завершен в Stripe');
    }

    const metaBookingId = session.metadata?.booking_id;
    if (metaBookingId && metaBookingId !== dto.bookingId) {
      throw new BadRequestException('Сессия Stripe не соответствует данному бронированию');
    }

    await this.supabaseAdmin
      .from('bookings')
      .update({ payment_status: 'paid', session_id: dto.sessionId })
      .eq('id', dto.bookingId);

    const { data: booking } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', dto.bookingId)
      .single();

    return { success: true, booking };
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
        booking_time: booking.booking_time || '10:00',
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
