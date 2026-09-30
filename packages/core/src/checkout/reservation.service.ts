import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateLessonDates } from '@atena/utils';
import {
  BookingPaymentStatus,
  BookingStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  BillingScheme,
  PaymentCurrency,
  PaymentType,
  PaymentRecordStatus,
  PaymentProvider,
  LessonStatus,
  SubscriptionStatus,
  CourseBillingType,
  parsePaymentMethod,
  formatBookingDto,
  ReservationResponse,
} from '@atena/api-types';

import { checkFeeStatus } from './fee.service';
import { validatePromoCode, incrementPromoCodeUsage } from './promo.service';
import { processStudentAndBookingLinks } from './student.service';
import { extractCleanTime, computeEndTime, computeTotalLessonsCount, getPublicCourseById } from './course.service';
import { sendBookingNotificationEmails, EmailServiceConfig } from '../notifications/notification.service';
import { sendBookingNotificationTelegram } from '../notifications/telegram-actions.service';
import { runBackgroundTask } from '../utils/background';
import { getSchoolProfile } from '../system/school-profile.service';
import type { CreateReservationParams, SupabaseCourseRow, SupabaseBookingRow } from '../types';

import { findOrCreateGroupAndEnroll } from './group-matcher.service';

export async function generateAndSaveLessons(
  bookingId: string,
  course: SupabaseCourseRow | null,
  lessons: Array<{ startsAt: string; endsAt: string }>,
  supabase: SupabaseClient,
  studentId?: string | null,
  startDateStr?: string | null,
  timeStr?: string | null,
  explicitGroupId?: string | null
): Promise<void> {
  if (!lessons || lessons.length === 0) return;
  try {
    if (studentId) {
      await findOrCreateGroupAndEnroll({
        supabase,
        course,
        courseId: course?.id || 0,
        studentId,
        bookingId,
        startDateStr: startDateStr || lessons[0].startsAt,
        timeStr: timeStr || '10:00',
        calculatedLessons: lessons,
        explicitGroupId,
      });
    } else {
      const teacherId = course?.teacher_id || null;
      const courseId = course?.id || null;
      const lessonRows = lessons.map((l) => ({
        booking_id: bookingId,
        course_id: courseId,
        student_id: null,
        teacher_id: teacherId,
        starts_at: l.startsAt,
        ends_at: l.endsAt,
        status: LessonStatus.SCHEDULED,
      }));

      await supabase.from('lessons').insert(lessonRows);
    }
  } catch (err) {
    console.warn('Lessons generation error:', err);
  }
}

export async function recordPaymentLedger(
  bookingId: string,
  coursePrice: number,
  regFee: number,
  paymentMethod: string | number,
  paymentStatus: string | number,
  supabase: SupabaseClient,
  studentId?: string | null,
  studentTaxCode?: string | null,
  userId?: string | null
): Promise<void> {
  try {
    const pStatus = Number(paymentStatus) === BookingPaymentStatus.PAID
      ? PaymentRecordStatus.SUCCEEDED
      : PaymentRecordStatus.PENDING;
    const pMethod = parsePaymentMethod(paymentMethod) ?? PaymentMethod.CASH;
    const provider = pMethod === PaymentMethod.STRIPE ? PaymentProvider.STRIPE : PaymentProvider.MANUAL;

    const paymentsToInsert: any[] = [];
    if (coursePrice > 0) {
      paymentsToInsert.push({
        booking_id: bookingId,
        user_id: userId || null,
        student_id: studentId || null,
        amount: coursePrice,
        currency: PaymentCurrency.EUR,
        status: pStatus,
        type: PaymentType.COURSE_PAYMENT,
        payment_method: pMethod,
        provider: provider,
      });
    }
    if (regFee > 0) {
      paymentsToInsert.push({
        booking_id: bookingId,
        user_id: userId || null,
        student_id: studentId || null,
        amount: regFee,
        currency: PaymentCurrency.EUR,
        status: pStatus,
        type: PaymentType.REGISTRATION_FEE,
        payment_method: pMethod,
        provider: provider,
      });
    }

    if (paymentsToInsert.length > 0) {
      const { data: insertedPayments } = await supabase
        .from('payments')
        .insert(paymentsToInsert)
        .select('id, type');

      const feePayment = insertedPayments?.find((p) => p.type === PaymentType.REGISTRATION_FEE);
      if (feePayment) {
        if (studentId) {
          await supabase
            .from('annual_memberships')
            .update({ payment_id: feePayment.id })
            .eq('student_id', studentId);
        }
        if (studentTaxCode) {
          await supabase
            .from('annual_memberships')
            .update({ payment_id: feePayment.id })
            .ilike('tax_code', studentTaxCode.trim());
        }
      }
    }
  } catch (err) {
    console.warn('Payments ledger insert error:', err);
  }
}

export async function getBookingDetails(supabase: SupabaseClient, id: string) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !booking) {
    return { success: false, error: 'Booking not found' };
  }

  const [paymentsRes, lessonsRes] = await Promise.all([
    supabase
      .from('payments')
      .select('id, amount, type, status, payment_method, academic_year, created_at')
      .eq('booking_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('lessons')
      .select('id, starts_at, ends_at, status')
      .eq('booking_id', id)
      .order('starts_at', { ascending: true }),
  ]);

  const payments = paymentsRes.data || [];
  const lessons = lessonsRes.data || [];

  const coursePayment = payments.find((p: any) => p.type === PaymentType.COURSE_PAYMENT);
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

export async function createReservationWorkflow(
  supabase: SupabaseClient,
  dto: CreateReservationParams,
  emailConfig?: EmailServiceConfig
): Promise<ReservationResponse> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);

  // 1. Idempotency Check: if booking was already created with this idempotencyKey/session_id, return it
  if (dto.idempotencyKey) {
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('session_id', dto.idempotencyKey);

    if (existingBookings && existingBookings.length > 0) {
      const b = existingBookings[0];
      return {
        success: true,
        bookingId: b.id,
        booking: formatBookingDto(b),
      };
    }
  }

  let course: any = null;
  const courseRes = await getPublicCourseById(supabase, dto.itemId);
  if (courseRes.success && courseRes.item) {
    course = courseRes.item;
  }

  const courseId = course?.id || dto.itemId;
  const coursePrice = course ? Number(course.price) : 73.2;
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

  const courseBillingType = course?.billing_type != null ? Number(course.billing_type) : CourseBillingType.ONE_TIME_ONLY;
  const courseAllowsSubscription = courseBillingType === CourseBillingType.BOTH || courseBillingType === CourseBillingType.SUBSCRIPTION_ONLY;
  const isSubscription = Number(dto.billingScheme) === BillingScheme.SUBSCRIPTION && courseAllowsSubscription;
  const effectiveCoursePrice = isSubscription
    ? (course?.subscription_price != null ? Number(course.subscription_price) : coursePrice)
    : coursePrice;

  const createdBookings: any[] = [];
  const bookingIds: string[] = [];

  const schoolProfile = await getSchoolProfile(supabase);
  const isFeeEnabled = schoolProfile?.registration_fee_enabled !== false;
  const defaultFeeEur = isFeeEnabled && schoolProfile?.registration_fee_eur != null ? Number(schoolProfile.registration_fee_eur) : 0;

  for (const student of rawStudents) {
    const studentName = `${student.firstName} ${student.lastName}`.trim();
    const studentTaxCode = student.taxCode ? student.taxCode.trim().toUpperCase() : '';

    const feeStatus = await checkFeeStatus(supabase, {
      taxCode: studentTaxCode,
      email: student.email || dto.email,
      phone: student.phone || dto.phone,
    });

    const isFeeRequired = feeStatus.annualFeePaid === false;
    const baseRegFee = isFeeRequired ? defaultFeeEur : 0;
    let effectiveRegFee = baseRegFee;
    let discountAmount = 0;
    let promoId: string | null = null;

    if (dto.promoCode) {
      try {
        const pRes = await validatePromoCode(supabase, {
          code: dto.promoCode,
          coursePrice: effectiveCoursePrice,
          registrationFee: baseRegFee,
          courseId,
        });
        if (pRes.valid && pRes.promo) {
          promoId = pRes.promo.id;
          discountAmount = pRes.promo.discountAmount;
          if (pRes.promo.waiveRegistrationFee) {
            effectiveRegFee = 0;
          }
        }
      } catch (pErr) {
        console.warn('Promo code validation warning in reservation:', pErr);
      }
    }

    const netCoursePrice = Math.max(0, effectiveCoursePrice - (dto.promoCode && promoId ? discountAmount : 0));
    const totalPaidAmount = Math.max(0, netCoursePrice + effectiveRegFee);

    const pStatus = typeof dto.paymentStatus === 'number' ? dto.paymentStatus : BookingPaymentStatus.RESERVED;
    const pMethod = typeof dto.paymentMethod === 'number' ? dto.paymentMethod : PaymentMethod.CASH;

    let subStatus: number | null = null;
    if (isSubscription) {
      if (pStatus === BookingPaymentStatus.PAID) {
        subStatus = SubscriptionStatus.ACTIVE;
      } else if (pMethod === PaymentMethod.STRIPE) {
        subStatus = SubscriptionStatus.ACTIVE;
      } else {
        subStatus = SubscriptionStatus.PENDING_RECEPTION_PAYMENT;
      }
    }

    const resolvedStartTime = course?.start_time || extractCleanTime(dto.time) || null;
    let resolvedEndTime = course?.end_time || null;
    if (!resolvedEndTime && dto.time) {
      const intervalMatch = dto.time.match(/\d{1,2}:\d{2}\s*-\s*(\d{1,2}:\d{2})/);
      if (intervalMatch) {
        resolvedEndTime = intervalMatch[1];
      }
    }
    if (!resolvedEndTime && resolvedStartTime && course?.lesson_duration_minutes && course.lesson_duration_minutes > 0) {
      resolvedEndTime = computeEndTime(resolvedStartTime, course.lesson_duration_minutes);
    }

    // Group assignment lookup for group courses
    let assignedGroupId: string | null = dto.groupId ? String(dto.groupId) : null;
    let assignedGroup: any = null;
    try {
      if (assignedGroupId) {
        const { data: explicitG } = await supabase
          .from('groups')
          .select('id, name, room, schedule_days, start_time, end_time, max_students')
          .eq('id', assignedGroupId)
          .maybeSingle();
        if (explicitG) assignedGroup = explicitG;
      } else {
        const { data: matchedGroup } = await supabase
          .from('groups')
          .select('id, name, room, schedule_days, start_time, end_time, max_students')
          .eq('course_id', courseId)
          .eq('status', 1) // 1=RECRUITING
          .limit(1)
          .maybeSingle();

        if (matchedGroup) {
          assignedGroupId = matchedGroup.id;
          assignedGroup = matchedGroup;
        }
      }
    } catch {
      // Non-blocking group lookup
    }

    const birthPlace = (dto.isForChild ? (dto.studentBirthPlace || dto.birthPlace) : dto.birthPlace) || student.birthPlace || null;

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        course_id: courseId,
        course_name: course?.name || course?.title_it || 'Corso Atena School',
        group_id: assignedGroupId,
        session_id: dto.idempotencyKey || null,
        purchaser_name: purchaserName,
        purchaser_email: dto.email,
        purchaser_phone: dto.phone || null,
        purchaser_tax_code: dto.purchaserTaxCode || studentTaxCode || '',
        student_name: studentName,
        student_email: student.email || dto.email,
        student_phone: student.phone || dto.phone,
        student_tax_code: studentTaxCode,
        student_birth_date: student.birthDate || null,
        student_birth_place: birthPlace,
        start_date: dto.date || new Date().toISOString(),
        schedule_days: course?.schedule_days || null,
        start_time: resolvedStartTime,
        end_time: resolvedEndTime,
        payment_status: pStatus,
        payment_method: pMethod,
        booking_status: BookingStatus.ACTIVE,
        scheduling_status: BookingSchedulingStatus.SCHEDULED,
        billing_scheme: isSubscription ? BillingScheme.SUBSCRIPTION : BillingScheme.FULL,
        subscription_status: subStatus,
        amount_paid: totalPaidAmount,
        registration_fee: effectiveRegFee,
        discount_amount: discountAmount > 0 ? discountAmount : 0,
        promo_code: dto.promoCode || null,
        promo_code_id: promoId || null,
        total_lessons_count: computeTotalLessonsCount(course, lessons.length),
        subscription_starts_at: subStartsAt,
        subscription_ends_at: subEndsAt,
        notes: dto.notes || '',
        sdi_code: dto.sdiCode || null,
        pec_email: dto.pecEmail || null,
        custom_fields: dto.custom_fields || {},
        form_id: dto.form_id || null,
      })
      .select('*')
      .single();

    if (error || !booking) {
      throw new Error(error?.message || 'Failed to create reservation');
    }

    if (promoId) {
      await incrementPromoCodeUsage(supabase, promoId);
    }

    const bookingWithGroup = { ...booking, group: assignedGroup };
    createdBookings.push(bookingWithGroup);
    bookingIds.push(booking.id);

    const studentDto: CreateReservationParams = {
      ...dto,
      isForChild: true,
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      studentBirthPlace: birthPlace || undefined,
      birthPlace: birthPlace || undefined,
      studentEmail: student.email,
      studentPhone: student.phone,
      studentTaxCode: studentTaxCode,
      studentBirthDate: student.birthDate,
    };

    try {
      const { studentId: createdStudentId, linkedUserId } = await processStudentAndBookingLinks({
        dto: studentDto,
        bookingId: booking.id,
        feeStatus,
        regFee: effectiveRegFee,
        purchaserName,
        studentName,
        supabase,
      });

      // If assigned to a group, enroll student into group_members
      if (assignedGroupId && createdStudentId) {
        try {
          await supabase.from('group_members').upsert(
            {
              group_id: assignedGroupId,
              student_id: createdStudentId,
              booking_id: booking.id,
              status: 1, // ACTIVE
            },
            { onConflict: 'group_id,student_id' }
          );
        } catch {
          // Non-blocking member insertion
        }
      }

      await generateAndSaveLessons(
        booking.id,
        course,
        lessons,
        supabase,
        createdStudentId,
        dto.date || subStartsAt,
        dto.time || '10:00',
        assignedGroupId
      );
      await recordPaymentLedger(booking.id, effectiveCoursePrice, effectiveRegFee, pMethod, pStatus, supabase, createdStudentId, studentTaxCode, linkedUserId);
    } catch (stepErr) {
      // Rollback created booking record on linkage / lessons failure
      await supabase.from('bookings').delete().eq('id', booking.id);
      throw stepErr;
    }
  }

  const primaryBooking = createdBookings[0];

  // Send transactional email & telegram notifications in non-blocking background task
  runBackgroundTask(
    () => sendBookingNotificationEmails({ supabase, booking: primaryBooking, course, dto, config: emailConfig }),
    'BookingConfirmationEmail'
  );

  runBackgroundTask(
    () => sendBookingNotificationTelegram({ supabase, booking: primaryBooking, course, dto }),
    'BookingTelegramNotification'
  );

  return {
    success: true,
    bookingId: primaryBooking.id,
    booking: formatBookingDto(primaryBooking),
  };
}

