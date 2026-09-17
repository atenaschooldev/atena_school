import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeClient = require('stripe');
import { CheckFeeDto, CreateReservationDto, VerifyPaymentDto, ContactFormDto } from '../dto/checkout.public.dto';
import { calculateLessonDates } from '@atena/utils';
import {
  BookingPaymentStatus,
  BookingStatus,
  BookingSchedulingStatus,
  BillingScheme,
  PaymentMethod,
  PaymentType,
  PaymentRecordStatus,
  BOOKING_PAYMENT_STATUS_ID_TO_STRING,
  PAYMENT_METHOD_ID_TO_STRING,
  AppSettingKey,
  MembershipStatus,
  StudentStatus,
  CourseStatus,
  CourseScheduleType,
  parseCourseScheduleType,
} from '@atena/api-types';

import { PrismaService } from '../../../core/prisma/prisma.service';
import { CheckoutCoreService } from '../checkout-core.service';
import { MailService } from '../../mail/mail.service';
import { TelegramService } from '../../mail/telegram.service';

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
  private readonly logger = new Logger(CheckoutService.name);
  private supabaseAdmin: SupabaseClient;
  private stripe: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private checkoutCore: CheckoutCoreService,
    private mailService: MailService,
    private telegramService: TelegramService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const stripeSecret = this.configService.get<string>('STRIPE_SECRET_KEY') || process.env.STRIPE_SECRET_KEY || '';

    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const StripeConstructor = typeof StripeClient === 'function' ? StripeClient : StripeClient.default;
    this.stripe = new StripeConstructor(stripeSecret, { apiVersion: '2023-10-16' });
  }

  async checkFeeStatus(dto: CheckFeeDto) {
    const cleanTax = dto.taxCode ? dto.taxCode.trim().toUpperCase() : null;

    // Strict rule: Registration fee (€30) check MUST be strictly by Codice Fiscale (taxCode)
    if (!cleanTax) {
      return { success: true, annualFeePaid: false, userFound: false, requiresFee: true };
    }

    // 1. Check active annual memberships by Codice Fiscale
    const { data: mem } = await this.supabaseAdmin
      .from('annual_memberships')
      .select('id')
      .ilike('tax_code', cleanTax)
      .eq('academic_year', '2026/2027')
      .eq('status', MembershipStatus.ACTIVE)
      .maybeSingle();

    if (mem) return { success: true, annualFeePaid: true, userFound: true, requiresFee: false };

    // 2. Check student record by Codice Fiscale
    const { data: st } = await this.supabaseAdmin
      .from('students')
      .select('id')
      .ilike('tax_code', cleanTax)
      .eq('annual_fee_paid', true)
      .maybeSingle();

    if (st) return { success: true, annualFeePaid: true, userFound: true, requiresFee: false };

    // 3. Check if fee is ALREADY reserved in an existing booking by Codice Fiscale
    const { data: pendingBooking } = await this.supabaseAdmin
      .from('bookings')
      .select('id')
      .or(`student_tax_code.ilike.${cleanTax},purchaser_tax_code.ilike.${cleanTax}`)
      .gt('registration_fee', 0)
      .limit(1)
      .maybeSingle();

    if (pendingBooking) {
      return { success: true, annualFeePaid: true, userFound: true, feeReservedInBooking: true, requiresFee: false };
    }

    return { success: true, annualFeePaid: false, userFound: false, requiresFee: true };
  }

  private computeTotalLessonsCount(course: any, calculatedLessonsCount: number): number | null {
    // Fixed lessons package (e.g. Pacchetto 10, Lezioni Singole)
    if (course?.total_lessons != null) return course.total_lessons;
    // Hours-based course (e.g. EIPASS) — no fixed lesson count, stored as null
    if (course?.total_hours != null) return null;
    // Flexible with lessons_per_week (e.g. C2, C1 private) — estimate 1 month
    if (course?.lessons_per_week != null && parseCourseScheduleType(course?.schedule_type) === CourseScheduleType.FLEXIBLE) {
      return course.lessons_per_week * 4;
    }
    // Fixed schedule — use calendar-calculated count
    return calculatedLessonsCount || 8;
  }

  async createReservation(dto: CreateReservationDto) {
    // 1. Idempotency Check: if booking was already created with this idempotencyKey/session_id, return it
    if (dto.idempotencyKey) {
      const { data: existingBookings } = await this.supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('session_id', dto.idempotencyKey);

      if (existingBookings && existingBookings.length > 0) {
        const b = existingBookings[0];
        return {
          success: true,
          booking: b,
          bookings: existingBookings,
          bookingId: b.id,
          bookingIds: existingBookings.map((eb) => eb.id),
        };
      }
    }

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
    const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();

    // Determine target students list (multi-student or single)
    const rawStudents = dto.students && dto.students.length > 0
      ? dto.students
      : [
          {
            firstName: dto.isForChild ? (dto.studentFirstName || dto.firstName) : dto.firstName,
            lastName: dto.isForChild ? (dto.studentLastName || dto.lastName) : dto.lastName,
            email: dto.isForChild ? (dto.studentEmail || dto.email) : dto.email,
            phone: dto.isForChild ? (dto.studentPhone || dto.phone) : dto.phone,
            taxCode: (dto.isForChild ? dto.studentTaxCode : (dto.purchaserTaxCode || dto.studentTaxCode)) || '',
            birthDate: dto.studentBirthDate,
          },
        ];

    const lessons = calculateLessonDates(
      dto.date || new Date().toISOString(),
      dto.time || '10:00',
      course?.category || undefined,
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

    const createdBookings: any[] = [];
    const bookingIds: string[] = [];

    const paymentStatusNum = dto.paymentStatus !== undefined
      ? Number(dto.paymentStatus)
      : BookingPaymentStatus.RESERVED;

    const paymentMethodNum = dto.paymentMethod !== undefined
      ? Number(dto.paymentMethod)
      : PaymentMethod.CASH;

    for (const student of rawStudents) {
      const studentName = `${student.firstName} ${student.lastName}`.trim();
      const studentTaxCode = student.taxCode ? student.taxCode.trim().toUpperCase() : '';

      // Check annual membership fee for each student individually
      const feeStatus = await this.checkFeeStatus({
        taxCode: studentTaxCode,
      });

      const isFeeRequired = feeStatus.annualFeePaid === false;
      const regFee = isFeeRequired ? 30 : 0;
      const totalPaidAmount = coursePrice + regFee;

      const { data: booking, error } = await this.supabaseAdmin
        .from('bookings')
        .insert({
          course_id: courseId,
          course_name: course?.name || course?.title_it || 'Corso Atena School',
          session_id: dto.idempotencyKey || null,
          purchaser_name: purchaserName,
          purchaser_email: dto.email,
          purchaser_phone: dto.phone,
          purchaser_tax_code: dto.purchaserTaxCode || studentTaxCode || '',
          student_name: studentName,
          student_email: student.email || dto.email,
          student_phone: student.phone || dto.phone,
          student_tax_code: studentTaxCode,
          student_birth_date: student.birthDate || null,
          start_date: dto.date || new Date().toISOString(),
          schedule_days: course?.schedule_days || null,
          start_time: course?.start_time || (dto.time ? (dto.time.match(/(\d{1,2}:\d{2})/) ? dto.time.match(/(\d{1,2}:\d{2})/)![1] : dto.time) : null),
          end_time: course?.end_time || null,
          payment_status: paymentStatusNum,
          payment_method: paymentMethodNum,
          booking_status: BookingStatus.ACTIVE,
          scheduling_status: BookingSchedulingStatus.SCHEDULED,
          billing_scheme: BillingScheme.FULL,
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

      createdBookings.push(booking);
      bookingIds.push(booking.id);

      // Process Student resolution & profile link via core service
      const studentDto = {
        ...dto,
        isForChild: true,
        studentFirstName: student.firstName,
        studentLastName: student.lastName,
        studentEmail: student.email,
        studentPhone: student.phone,
        studentTaxCode: studentTaxCode,
        studentBirthDate: student.birthDate,
      };

      await this.checkoutCore.processStudentAndBookingLinks({
        dto: studentDto,
        bookingId: booking.id,
        feeStatus,
        regFee,
        purchaserName,
        studentName,
        supabaseAdmin: this.supabaseAdmin,
      });

      // Automatically generate and insert lessons into `lessons` table for Orari & Calendario
      await this.checkoutCore.generateAndSaveLessons(booking.id, course, lessons);

      // Generate accounting ledger entries in payments table
      await this.checkoutCore.recordPaymentLedger(
        booking.id,
        coursePrice,
        regFee,
        paymentMethodNum,
        paymentStatusNum,
      );
    }

    const primaryBooking = createdBookings[0];

    // Send transactional email & telegram notifications
    this.sendBookingNotificationEmails(primaryBooking, course, dto).catch((err) => {
      this.logger.warn(`Async notification send error: ${err.message}`);
    });

    return {
      success: true,
      bookingId: primaryBooking.id,
      bookingIds,
      booking: primaryBooking,
      bookings: createdBookings,
    };
  }

  private async sendBookingNotificationEmails(booking: any, course: any, dto: CreateReservationDto) {
    try {
      const courseName = course?.name || course?.title_it || 'Corso Atena School';
      const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();
      const studentName = dto.isForChild
        ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || purchaserName
        : purchaserName;
      const adminEmail = this.configService.get<string>('SCHOOL_ADMIN_EMAIL') || this.configService.get<string>('ADMIN_EMAIL') || 'info@atenaschool.com';
      const isPaidOnline = booking.payment_status === BookingPaymentStatus.PAID;
      const paymentStatusText = isPaidOnline ? 'Pagato Online con Carta' : 'Prenotato con Saldo in Sede';
      const totalEur = Number(booking.amount_paid || 0).toFixed(2);
      const regFeeEur = Number(booking.registration_fee || 0).toFixed(2);
      const courseFeeEur = (Number(totalEur) - Number(regFeeEur)).toFixed(2);

      const clientSubject = isPaidOnline
        ? `Conferma Pagamento e Iscrizione: ${courseName} - Atena School`
        : `Conferma Prenotazione: ${courseName} - Atena School`;

      const clientHtml = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px;">
            <div style="text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px;">
              <h1 style="font-size: 22px; font-weight: 900; color: #043569; margin: 0;">ATENA SCHOOL</h1>
              <span style="display: inline-block; padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${isPaidOnline ? '#ecfdf5; color: #047857;' : '#fffbeb; color: #b45309;'}; margin-top: 10px;">${paymentStatusText}</span>
            </div>
            <h2 style="color: #043569; font-size: 18px; margin-bottom: 8px;">Grazie per la tua prenotazione, ${purchaserName}!</h2>
            <p style="font-size: 14px; color: #475569;">La tua richiesta per il corso <strong>${courseName}</strong> è stata registrata con successo.</p>
            <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 14px;">
              <p style="margin: 4px 0;"><strong>Studente:</strong> ${studentName}</p>
              <p style="margin: 4px 0;"><strong>Data inizio:</strong> ${dto.date || 'Da concordare'}</p>
              <p style="margin: 4px 0;"><strong>Orario:</strong> ${dto.time || '16:00'}</p>
              ${Number(regFeeEur) > 0 ? `<p style="margin: 4px 0;"><strong>Quota iscrizione annuale:</strong> €${regFeeEur}</p>` : ''}
              <p style="margin: 8px 0 0 0; font-size: 16px; color: #f8861d;"><strong>Totale: €${totalEur}</strong></p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">Atena School — Via Matteotti 11, 89022 Cittanova (RC)<br>info@atenaschool.com</p>
          </div>
        </div>
      `;

      const adminSubject = `[Nuova Prenotazione] ${courseName} - ${studentName} (${paymentStatusText})`;
      const adminHtml = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #043569;">Nuova prenotazione ricevuta dal sito web</h2>
          <p><strong>Corso:</strong> ${courseName}</p>
          <p><strong>Acquirente:</strong> ${purchaserName} (${dto.email}, tel: ${dto.phone || 'N/D'})</p>
          <p><strong>Codice Fiscale Acquirente:</strong> ${dto.purchaserTaxCode || 'N/D'}</p>
          ${dto.isForChild ? `<p><strong>Studente (Figlio):</strong> ${studentName} (CF: ${dto.studentTaxCode || 'N/D'}, Nascita: ${dto.studentBirthDate || 'N/D'})</p>` : ''}
          <p><strong>Importo:</strong> €${totalEur} (Quota annuale: €${regFeeEur})</p>
          <p><strong>Modalità di pagamento:</strong> ${paymentStatusText}</p>
          <p><strong>Data/Orario richiesto:</strong> ${dto.date || 'Da concordare'} ore ${dto.time || 'N/D'}</p>
          ${dto.notes ? `<p><strong>Note cliente:</strong> ${dto.notes}</p>` : ''}
          <p><strong>ID Prenotazione:</strong> ${booking.id}</p>
        </div>
      `;

      // 1. Send to client via email
      await this.mailService.sendEmail(dto.email, clientSubject, `Conferma prenotazione ${courseName}`, clientHtml);
      // 2. Send to school admin via email
      await this.mailService.sendEmail(adminEmail, adminSubject, `Nuova prenotazione ${courseName} - ${studentName}`, adminHtml);

      // 3. Dispatch Telegram alert to school channel
      this.telegramService.sendBookingNotification({
        courseName,
        purchaserName,
        purchaserEmail: dto.email,
        purchaserPhone: dto.phone,
        purchaserTaxCode: dto.purchaserTaxCode,
        studentName,
        studentTaxCode: dto.studentTaxCode,
        studentBirthDate: dto.studentBirthDate,
        isForChild: dto.isForChild,
        date: dto.date,
        time: dto.time,
        lessonSchedule: dto.time,
        totalEur,
        courseFeeEur,
        regFeeEur,
        isPaidOnline,
        paymentStatusText,
        bookingId: booking.id,
        notes: dto.notes,
      }).catch((tErr) => {
        this.logger.warn(`Async Telegram booking notification error: ${tErr.message}`);
      });
    } catch (e: any) {
      this.logger.error(`Error sending booking notification emails/telegram: ${e.message}`);
    }
  }

  /**
   * Retrieves app settings (e.g. Stripe enablement toggle).
   */
  async getSettings() {
    try {
      const setting = await (this.prisma as any).appSetting.findUnique({
        where: { key: AppSettingKey.STRIPE_ENABLED },
      });

      if (setting && setting.value !== undefined && setting.value !== null) {
        if (typeof setting.value === 'boolean') return { stripeEnabled: setting.value };
        if (typeof setting.value === 'string') return { stripeEnabled: setting.value === 'true' };
        if (typeof setting.value === 'object' && 'enabled' in (setting.value as any)) {
          return { stripeEnabled: Boolean((setting.value as any).enabled) };
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to fetch app_settings from Prisma, falling back to Supabase: ${err}`);
      try {
        const { data, error } = await this.supabaseAdmin
          .from('app_settings')
          .select('value')
          .eq('key', AppSettingKey.STRIPE_ENABLED)
          .maybeSingle();

        if (!error && data?.value !== undefined && data?.value !== null) {
          if (typeof data.value === 'boolean') return { stripeEnabled: data.value };
          if (typeof data.value === 'string') return { stripeEnabled: data.value === 'true' };
          if (typeof data.value === 'object' && data.value !== null && 'enabled' in data.value) {
            return { stripeEnabled: Boolean((data.value as any).enabled) };
          }
        }
      } catch (sbErr) {
        this.logger.warn(`Failed to fetch app_settings from Supabase: ${sbErr}`);
      }
    }

    const envEnabled = this.configService.get<string>('ENABLE_STRIPE') === 'true' || process.env.ENABLE_STRIPE === 'true';
    return { stripeEnabled: envEnabled };
  }

  async updateSettings(dto: { stripeEnabled: boolean }) {
    try {
      await (this.prisma as any).appSetting.upsert({
        where: { key: AppSettingKey.STRIPE_ENABLED },
        update: {
          value: dto.stripeEnabled,
          description: 'Enable or disable Stripe online payment gateway on checkout',
        },
        create: {
          key: AppSettingKey.STRIPE_ENABLED,
          value: dto.stripeEnabled,
          description: 'Enable or disable Stripe online payment gateway on checkout',
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to update app_settings in Prisma, trying Supabase: ${err}`);
      try {
        await this.supabaseAdmin.from('app_settings').upsert({
          key: AppSettingKey.STRIPE_ENABLED,
          value: dto.stripeEnabled,
          description: 'Enable or disable Stripe online payment gateway on checkout',
          updated_at: new Date().toISOString(),
        });
      } catch (sbErr) {
        this.logger.error(`Failed to update app_settings: ${sbErr}`);
        throw new BadRequestException('Ошибка при сохранении настроек приложения');
      }
    }
    return { stripeEnabled: dto.stripeEnabled };
  }

  async createStripeSession(dto: CreateReservationDto) {
    const settings = await this.getSettings();
    if (!settings.stripeEnabled) {
      throw new BadRequestException('Онлайн-оплата временно отключена. Пожалуйста, выберите бронирование с оплатой в школе.');
    }

    const siteUrl = this.configService.get<string>('NEXT_PUBLIC_SITE_URL') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    let resolvedItemId = dto.itemId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
    if (!isUuid) {
      const { data: course } = await this.supabaseAdmin.from('courses').select('id').eq('slug', dto.itemId).maybeSingle();
      if (course?.id) {
        resolvedItemId = course.id;
      }
    }

    // If multi-student payload is provided, create direct Stripe Session with all student line items
    if (dto.students && dto.students.length > 0) {
      const reservationRes = await this.createReservation({
        ...dto,
        paymentMethod: PaymentMethod.STRIPE,
        paymentStatus: BookingPaymentStatus.PENDING,
      });

      const { data: course } = await this.supabaseAdmin.from('courses').select('*').eq('id', resolvedItemId).maybeSingle();
      const courseName = course?.name || course?.title_it || 'Corso Atena School';
      const coursePrice = course ? Number(course.price) : 73.20;

      const lineItems: any[] = [];
      let totalFeeCount = 0;

      for (const b of reservationRes.bookings) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${courseName} — ${b.student_name}`,
            },
            unit_amount: Math.round(coursePrice * 100),
          },
          quantity: 1,
        });

        const regFee = Number(b.registration_fee || 0);
        if (regFee > 0) {
          totalFeeCount += 1;
          lineItems.push({
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Quota Iscrizione Annuale 2026/2027 — ${b.student_name}`,
              },
              unit_amount: Math.round(regFee * 100),
            },
            quantity: 1,
          });
        }
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: dto.email,
        success_url: `${siteUrl}/checkout/success/${reservationRes.bookingId}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
        metadata: {
          booking_id: reservationRes.bookingId,
          booking_ids: reservationRes.bookingIds.join(','),
          purchaser_tax_code: dto.purchaserTaxCode || '',
        },
      });

      return { success: true, url: session.url, bookingId: reservationRes.bookingId };
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
      // Fallback to direct Stripe SDK session
      const reservationRes = await this.createReservation({
        ...dto,
        paymentMethod: PaymentMethod.STRIPE,
        paymentStatus: BookingPaymentStatus.PENDING,
      });

      const booking = reservationRes.booking;
      const coursePrice = Number(booking.amount_paid) - Number(booking.registration_fee || 0);
      const regFee = Number(booking.registration_fee || 0);

      const lineItems: any[] = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: booking.course_name || 'Corso Atena School',
            },
            unit_amount: Math.round(coursePrice * 100),
          },
          quantity: 1,
        },
      ];

      if (regFee > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Quota Associativa / Iscrizione Annuale (2026/2027)',
            },
            unit_amount: Math.round(regFee * 100),
          },
          quantity: 1,
        });
      }

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: dto.email,
        success_url: `${siteUrl}/checkout/success/${booking.id}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
        metadata: {
          booking_id: booking.id,
          purchaser_tax_code: dto.purchaserTaxCode || '',
          student_tax_code: dto.studentTaxCode || dto.purchaserTaxCode || '',
        },
      });

      return { success: true, url: session.url, bookingId: booking.id };
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
      throw new BadRequestException(`Ошибка проверки подписи вебхука Stripe: ${err.message}`);
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
      const bookingIdsStr = session.metadata?.booking_ids || session.metadata?.booking_id;

      if (bookingIdsStr) {
        const ids = bookingIdsStr.split(',').map((s) => s.trim()).filter(Boolean);
        for (const bId of ids) {
          const { data: updatedBooking } = await this.supabaseAdmin
            .from('bookings')
            .update({
              payment_status: BookingPaymentStatus.PAID,
              payment_method: PaymentMethod.STRIPE,
            })
            .eq('id', bId)
            .select('student_id')
            .maybeSingle();

          await this.supabaseAdmin.from('payments').update({ status: PaymentRecordStatus.SUCCEEDED }).eq('booking_id', bId);

          if (updatedBooking?.student_id) {
            await this.supabaseAdmin.from('students').update({
              status: StudentStatus.ACTIVE,
              annual_fee_paid: true,
              annual_fee_paid_at: new Date().toISOString(),
            }).eq('id', updatedBooking.student_id);
          }
        }
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
        .select('*')
        .eq('id', itemId)
        .maybeSingle();
      if (data) item = data;
    }

    if (!item) {
      const { data } = await this.supabaseAdmin
        .from('courses')
        .select('*')
        .eq('slug', itemId)
        .maybeSingle();
      if (data) item = data;
    }

    if (!item) {
      return { success: false, error: 'Курс не найден' };
    }

    let teacherName: string | null = null;
    let teacherPhotoUrl: string | null = null;
    if (item.teacher_id) {
      const { data: teacher } = await this.supabaseAdmin
        .from('teachers')
        .select('full_name, photo_url')
        .eq('teacher_id', item.teacher_id)
        .maybeSingle();
      if (teacher) {
        teacherName = teacher.full_name;
        teacherPhotoUrl = teacher.photo_url;
      }
    }

    const course = {
      ...item,
      teacher_name: teacherName,
      teacher_photo_url: teacherPhotoUrl,
    };

    return { success: true, item: course, course };
  }

  async getBookingDetails(bookingId: string) {
    const { data: booking, error } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (error || !booking) {
      return { success: false, error: 'Бронирование не найдено' };
    }

    const [paymentsRes, lessonsRes] = await Promise.all([
      this.supabaseAdmin
        .from('payments')
        .select('id, amount, type, status, payment_method, academic_year, created_at')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true }),
      this.supabaseAdmin
        .from('lessons')
        .select('id, starts_at, ends_at, status')
        .eq('booking_id', bookingId)
        .order('starts_at', { ascending: true }),
    ]);

    const payments = paymentsRes.data || [];
    const lessons = lessonsRes.data || [];

    const coursePayment = payments.find((p: any) => p.type === PaymentType.COURSE_PAYMENT || p.type === 1 || p.type === 'payment');
    const amountPaid = Number(booking.amount_paid || 0);
    const regFee = Number(booking.registration_fee || 0);
    const coursePrice = coursePayment
      ? Number(coursePayment.amount)
      : (amountPaid > 0 && regFee > 0 ? Math.max(0, amountPaid - regFee) : amountPaid);

    return {
      success: true,
      booking: {
        ...booking,
        course_price: coursePrice,
        item_price: coursePrice,
        total_price: amountPaid > 0 ? amountPaid : coursePrice + regFee,
        payments: payments,
        lessons_count: lessons.length,
        lessons: lessons,
      },
    };
  }

  async getPublicCourses() {
    let { data: coursesData, error } = await this.supabaseAdmin
      .from('courses')
      .select('*')
      .eq('status', CourseStatus.ACTIVE)
      .order('name');

    if (error || !coursesData) {
      const { data: fallbackData } = await this.supabaseAdmin.from('courses').select('*');
      coursesData = fallbackData || [];
    }

    const { data: teachersData } = await this.supabaseAdmin
      .from('teachers')
      .select('teacher_id, full_name, photo_url');
    const teacherMap = new Map((teachersData || []).map((t: any) => [t.teacher_id, t]));

    const courses = (coursesData || []).map((c: any) => {
      const teacher = c.teacher_id ? teacherMap.get(c.teacher_id) : null;
      return {
        ...c,
        teacher_name: teacher?.full_name || null,
        teacher_photo_url: teacher?.photo_url || null,
      };
    });

    return { success: true, courses };
  }

  async submitContact(dto: ContactFormDto) {
    const firstName = (dto.nome || (dto as any).first_name || (dto as any).name?.split(' ')[0] || '').trim();
    const lastName = (dto.cognome || (dto as any).last_name || (dto as any).name?.split(' ').slice(1).join(' ') || '').trim();
    const email = (dto.email || '').trim().toLowerCase();
    const phone = (dto.telefono || (dto as any).phone || '').trim() || null;
    const interest = (dto.interesse || (dto as any).interest || (dto as any).courseInterest || '').trim() || null;
    const message = (dto.messaggio || (dto as any).message || '').trim();

    const { error } = await this.supabaseAdmin
      .from('contact_messages')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        interest: interest,
        message: message,
        status: 'new',
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    // 1. Asynchronously send Telegram notification to school team
    this.telegramService.sendContactNotification({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      interest: interest || undefined,
      message,
    }).catch((tErr) => {
      this.logger.warn(`Async Telegram contact notification error: ${tErr.message}`);
    });

    // 2. Asynchronously send Email notification to admin
    const adminEmail = this.configService.get<string>('SCHOOL_ADMIN_EMAIL') || this.configService.get<string>('ADMIN_EMAIL') || 'atenaschool20@gmail.com';
    const subject = `[Nuovo Messaggio dal Sito Web] ${firstName} ${lastName}`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2 style="color: #043569;">Nuovo messaggio di contatto ricevuto dal sito web</h2>
        <p><strong>Nome:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefono:</strong> ${phone || 'N/D'}</p>
        <p><strong>Interesse:</strong> ${interest || 'N/D'}</p>
        <p><strong>Messaggio:</strong></p>
        <p style="background: #f1f5f9; padding: 12px; border-radius: 8px;">${message}</p>
      </div>
    `;
    this.mailService.sendEmail(adminEmail, subject, `Nuovo messaggio da ${firstName} ${lastName}: ${message}`, html).catch((mErr) => {
      this.logger.warn(`Async contact email notification error: ${mErr.message}`);
    });

    return { success: true, message: 'Messaggio inviato con successo' };
  }
}

