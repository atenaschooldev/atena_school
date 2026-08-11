import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { calculateLessonDates } from '@atena/utils';

export interface CheckFeeParams {
  taxCode?: string;
  email?: string;
  phone?: string;
}

export interface CreateReservationParams {
  itemId: string;
  itemType?: string;
  date?: string;
  time?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  purchaserTaxCode?: string;
  isForChild?: boolean;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentTaxCode?: string;
  studentBirthDate?: string;
  includeRegistrationFee?: boolean;
  notes?: string;
  sdiCode?: string;
  pecEmail?: string;
  needsCompanyInvoice?: boolean;
  paymentMethod?: string;
  paymentStatus?: string;
}

export interface VerifyPaymentParams {
  sessionId?: string;
  bookingId?: string;
}

export interface ContactFormParams {
  name: string;
  email: string;
  phone?: string;
  message: string;
  courseInterest?: string;
}

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !serviceKey) {
    throw new Error('Supabase configuration missing: URL or Service Role Key is missing');
  }
  return createClient(url, serviceKey);
}

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  return new Stripe(secretKey, { apiVersion: '2023-10-16' as any });
}

export async function checkFeeStatus(params: CheckFeeParams) {
  const supabase = getSupabaseAdmin();
  const cleanTax = params.taxCode ? params.taxCode.trim().toUpperCase() : null;

  if (!cleanTax) {
    return { success: true, annualFeePaid: false, userFound: false, requiresFee: true };
  }

  // 1. Check active annual memberships by Codice Fiscale
  const { data: mem } = await supabase
    .from('annual_memberships')
    .select('id')
    .ilike('tax_code', cleanTax)
    .eq('academic_year', '2026/2027')
    .eq('status', 'active')
    .maybeSingle();

  if (mem) {
    return { success: true, annualFeePaid: true, userFound: true, requiresFee: false };
  }

  // 2. Check student record by Codice Fiscale
  const { data: st } = await supabase
    .from('students')
    .select('id')
    .ilike('tax_code', cleanTax)
    .eq('annual_fee_paid', true)
    .maybeSingle();

  if (st) {
    return { success: true, annualFeePaid: true, userFound: true, requiresFee: false };
  }

  // 3. Check if fee is reserved in an existing booking by Codice Fiscale
  const { data: pendingBooking } = await supabase
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

function computeTotalLessonsCount(course: any, calculatedLessonsCount: number): number | null {
  if (course?.total_lessons != null) return course.total_lessons;
  if (course?.total_hours != null) return null;
  if (course?.lessons_per_week != null && course?.schedule_type === 'flexible') {
    return course.lessons_per_week * 4;
  }
  return calculatedLessonsCount || 8;
}

export async function getPublicCourses() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    const { data: fallbackData } = await supabase.from('courses').select('*');
    return { success: true, courses: fallbackData || [] };
  }
  return { success: true, courses: data || [] };
}

export async function getItem(id: string) {
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let course = null;
  if (isUuid) {
    const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    course = data;
  }
  if (!course) {
    const { data } = await supabase.from('courses').select('*').eq('slug', id).maybeSingle();
    course = data;
  }

  if (!course) {
    return { success: false, error: 'Item not found' };
  }
  return { success: true, item: course, course };
}

export async function getBookingDetails(id: string) {
  const supabase = getSupabaseAdmin();
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !booking) {
    return { success: false, error: 'Booking not found' };
  }
  return { success: true, booking };
}

async function processStudentAndBookingLinks(params: {
  dto: CreateReservationParams;
  bookingId: string;
  feeStatus: { annualFeePaid: boolean };
  regFee: number;
  purchaserName: string;
  studentName: string;
  supabase: SupabaseClient;
}) {
  const { dto, bookingId, feeStatus, regFee, purchaserName, studentName, supabase } = params;

  const purchaserEmail = dto.email;
  let linkedUserId: string | null = null;

  if (purchaserEmail) {
    try {
      const { data: pUser } = await supabase
        .from('users')
        .select('id')
        .ilike('email', purchaserEmail)
        .maybeSingle();
      if (pUser?.id) linkedUserId = pUser.id;
    } catch {}
  }

  if (linkedUserId) {
    await supabase.from('bookings').update({ user_id: linkedUserId }).eq('id', bookingId);
  }

  const sEmail = dto.isForChild ? (dto.studentEmail || dto.email) : dto.email;
  const sName = studentName || purchaserName || 'Studente';
  const sTaxCode = dto.isForChild ? (dto.studentTaxCode || dto.purchaserTaxCode) : dto.purchaserTaxCode;

  let studentId: string | null = null;

  if (sEmail || sTaxCode) {
    try {
      let existingStudent: { id: string } | null = null;
      if (sTaxCode) {
        const { data } = await supabase
          .from('students')
          .select('id')
          .ilike('tax_code', sTaxCode)
          .maybeSingle();
        if (data?.id) existingStudent = data;
      }
      if (!existingStudent && sEmail) {
        const { data } = await supabase
          .from('students')
          .select('id')
          .ilike('email', sEmail)
          .maybeSingle();
        if (data?.id) existingStudent = data;
      }

      let studentAuthUserId: string | null = null;
      if (sEmail) {
        try {
          const { data: sUser } = await supabase
            .from('users')
            .select('id')
            .ilike('email', sEmail)
            .maybeSingle();
          if (sUser?.id) studentAuthUserId = sUser.id;
        } catch {}
      }

      const isPaid = dto.paymentStatus === 'completed' || dto.paymentStatus === 'paid';
      const hasPaidMembership = feeStatus.annualFeePaid || (regFee > 0 && isPaid);

      if (!existingStudent) {
        const sNameParts = (sName || '').trim().split(' ');
        const { data: newStudent } = await supabase
          .from('students')
          .insert({
            full_name: sName || 'Studente',
            first_name: sNameParts[0] || 'Studente',
            last_name: sNameParts.slice(1).join(' ') || '',
            email: sEmail,
            phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
            tax_code: sTaxCode || null,
            birth_date: dto.studentBirthDate || null,
            parent_id: linkedUserId || null,
            student_user_id: studentAuthUserId || null,
            language_level: 'A1',
            registration_date: new Date().toISOString().split('T')[0],
            status: 'active',
            annual_fee_paid: hasPaidMembership,
            annual_fee_paid_at: hasPaidMembership ? new Date().toISOString() : null,
          })
          .select('id')
          .single();

        studentId = newStudent?.id || null;
      } else {
        studentId = existingStudent.id;
        await supabase
          .from('students')
          .update({
            full_name: sName || undefined,
            phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
            tax_code: sTaxCode || undefined,
            birth_date: dto.studentBirthDate || undefined,
            parent_id: linkedUserId || undefined,
            student_user_id: studentAuthUserId || undefined,
            annual_fee_paid: hasPaidMembership ? true : undefined,
            annual_fee_paid_at: hasPaidMembership ? new Date().toISOString() : undefined,
          })
          .eq('id', existingStudent.id);
      }

      if (studentId) {
        await supabase.from('bookings').update({ student_id: studentId }).eq('id', bookingId);
      }

      if (hasPaidMembership) {
        let existingMem: { id: string } | null = null;
        if (studentId) {
          const { data: mData } = await supabase
            .from('annual_memberships')
            .select('id')
            .eq('student_id', studentId)
            .eq('academic_year', '2026/2027')
            .maybeSingle();
          if (mData) existingMem = mData;
        }

        if (existingMem) {
          await supabase
            .from('annual_memberships')
            .update({
              status: 'active',
              paid_at: new Date().toISOString(),
              booking_id: bookingId,
              user_id: linkedUserId || studentAuthUserId || undefined,
              tax_code: sTaxCode || undefined,
              email: sEmail || undefined,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
            })
            .eq('id', existingMem.id);
        } else {
          await supabase.from('annual_memberships').upsert(
            {
              tax_code: sTaxCode || null,
              email: sEmail || null,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
              academic_year: '2026/2027',
              status: 'active',
              student_id: studentId || null,
              user_id: linkedUserId || studentAuthUserId || null,
              booking_id: bookingId,
              paid_at: new Date().toISOString(),
              expires_at: '2027-08-31T23:59:59.000Z',
            },
            { onConflict: 'booking_id' }
          );
        }
      }
    } catch (sErr) {
      console.warn('Student resolution error in checkout service:', sErr);
    }
  }

  return { studentId, linkedUserId };
}

async function generateAndSaveLessons(
  bookingId: string,
  course: any,
  lessons: Array<{ startsAt: string; endsAt: string }>,
  supabase: SupabaseClient
) {
  if (!lessons || lessons.length === 0) return;
  try {
    const teacherId = course?.teacher_id || course?.teacherId || 'e1180b01-2222-4000-8000-000000000002';
    const lessonRows = lessons.map((l) => ({
      booking_id: bookingId,
      teacher_id: teacherId,
      starts_at: l.startsAt,
      ends_at: l.endsAt,
      status: 'scheduled',
    }));

    await supabase.from('lessons').insert(lessonRows);
  } catch (err) {
    console.warn('Lessons insert error:', err);
  }
}

async function recordPaymentLedger(
  bookingId: string,
  coursePrice: number,
  regFee: number,
  paymentMethod: string,
  paymentStatus: string,
  supabase: SupabaseClient
) {
  try {
    const pStatus = paymentStatus === 'completed' || paymentStatus === 'paid' ? 'succeeded' : 'pending';
    const pMethod = paymentMethod || 'cash';
    const provider = pMethod === 'stripe' || pMethod === 'card_online' ? 'stripe' : 'manual';

    const paymentsToInsert: any[] = [];
    if (coursePrice > 0) {
      paymentsToInsert.push({
        booking_id: bookingId,
        amount: coursePrice,
        currency: 'eur',
        status: pStatus,
        type: 'payment',
        payment_method: pMethod,
        provider: provider,
      });
    }
    if (regFee > 0) {
      paymentsToInsert.push({
        booking_id: bookingId,
        amount: regFee,
        currency: 'eur',
        status: pStatus,
        type: 'registration_fee',
        payment_method: pMethod,
        provider: provider,
      });
    }

    if (paymentsToInsert.length > 0) {
      await supabase.from('payments').insert(paymentsToInsert);
    }
  } catch (err) {
    console.warn('Payments ledger insert error:', err);
  }
}

export async function createReservation(dto: CreateReservationParams) {
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
  let course: any = null;

  if (isUuid) {
    const { data } = await supabase.from('courses').select('*').eq('id', dto.itemId).maybeSingle();
    course = data;
  }
  if (!course) {
    const { data } = await supabase.from('courses').select('*').eq('slug', dto.itemId).maybeSingle();
    course = data;
  }

  const courseId = course?.id || dto.itemId;
  const coursePrice = course ? Number(course.price) : 73.2;

  const feeStatus = await checkFeeStatus({
    taxCode: dto.isForChild ? dto.studentTaxCode : dto.purchaserTaxCode,
    email: dto.isForChild ? dto.studentEmail : dto.email,
    phone: dto.isForChild ? dto.studentPhone : dto.phone,
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

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      course_id: courseId,
      course_name: course?.name || course?.title_it || 'Corso Atena School',
      purchaser_name: purchaserName,
      purchaser_email: dto.email,
      purchaser_phone: dto.phone || null,
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
      payment_status: dto.paymentStatus || 'reserved',
      payment_method: dto.paymentMethod || 'cash',
      amount_paid: totalPaidAmount,
      registration_fee: regFee,
      total_lessons_count: computeTotalLessonsCount(course, lessons.length),
      subscription_starts_at: subStartsAt,
      subscription_ends_at: subEndsAt,
      notes: dto.notes || '',
      sdi_code: dto.sdiCode || null,
      pec_email: dto.pecEmail || null,
    })
    .select('*')
    .single();

  if (error || !booking) {
    throw new Error(error?.message || 'Failed to create reservation');
  }

  await processStudentAndBookingLinks({
    dto,
    bookingId: booking.id,
    feeStatus,
    regFee,
    purchaserName,
    studentName,
    supabase,
  });

  await generateAndSaveLessons(booking.id, course, lessons, supabase);
  await recordPaymentLedger(booking.id, coursePrice, regFee, dto.paymentMethod || 'cash', dto.paymentStatus || 'reserved', supabase);

  return { success: true, bookingId: booking.id, booking };
}

export async function createStripeSession(dto: CreateReservationParams) {
  const supabase = getSupabaseAdmin();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  // 1. Guaranteed pending booking creation in Supabase Postgres
  const reservationRes = await createReservation({
    ...dto,
    paymentMethod: 'stripe',
    paymentStatus: 'pending',
  });

  const booking = reservationRes.booking;
  const coursePrice = Number(booking.amount_paid) - Number(booking.registration_fee || 0);
  const regFee = Number(booking.registration_fee || 0);

  let resolvedItemId = dto.itemId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
  if (!isUuid) {
    const { data: course } = await supabase.from('courses').select('id').eq('slug', dto.itemId).maybeSingle();
    if (course?.id) {
      resolvedItemId = course.id;
    }
  }

  // 2. Attempt invoking Supabase Edge Function 'create-checkout-session' passing existing bookingId
  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        bookingId: booking.id,
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

    if (!edgeErr && edgeData?.url) {
      return { success: true, url: edgeData.url, bookingId: booking.id };
    }
    if (edgeErr || edgeData?.error) {
      console.warn('[Supabase Edge Function Warning]:', edgeErr?.message || edgeData?.error);
    }
  } catch (invokeErr: any) {
    console.warn('[Supabase Functions Invoke Failed, fallback to direct Stripe SDK]:', invokeErr?.message || invokeErr);
  }

  // 3. Fallback: Direct Stripe SDK session creation
  const stripe = getStripe();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
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

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: dto.email,
    success_url: `${siteUrl}/checkout/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/${dto.itemId}`,
    metadata: {
      booking_id: booking.id,
      purchaser_tax_code: dto.purchaserTaxCode || '',
      student_tax_code: dto.studentTaxCode || dto.purchaserTaxCode || '',
    },
  });

  return { success: true, url: session.url, bookingId: booking.id };
}

export async function verifyPayment(params: VerifyPaymentParams) {
  const supabase = getSupabaseAdmin();
  const { sessionId, bookingId } = params;

  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('verify-payment', {
      body: {
        session_id: sessionId,
        booking_id: bookingId,
      },
    });
    if (!edgeErr && edgeData?.booking) {
      return { success: true, booking: edgeData.booking };
    }
  } catch (edgeErr) {
    console.warn('Supabase edge verify-payment warning:', edgeErr);
  }

  if (sessionId) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        const targetBookingId = bookingId || (session.metadata?.booking_id as string);
        if (targetBookingId) {
          await supabase.from('bookings').update({ payment_status: 'completed', payment_method: 'card_online' }).eq('id', targetBookingId);
          await supabase.from('payments').update({ status: 'succeeded' }).eq('booking_id', targetBookingId);
        }
      }
    } catch (err) {
      console.warn('Verify payment stripe check warning:', err);
    }
  }

  if (bookingId) {
    const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
    return { success: true, booking };
  }

  return { success: true };
}

export async function submitContact(dto: ContactFormParams) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('contact_requests').insert({
    name: dto.name,
    email: dto.email,
    phone: dto.phone || null,
    message: dto.message,
    course_interest: dto.courseInterest || null,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.warn('Contact request insert warning:', error.message);
  }

  return { success: true, message: 'Messaggio inviato con successo' };
}

export async function handleStripeWebhook(rawBody: string | Buffer, signature: string) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Stripe webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      const supabase = getSupabaseAdmin();
      await supabase.from('bookings').update({ payment_status: 'completed', payment_method: 'card_online' }).eq('id', bookingId);
      await supabase.from('payments').update({ status: 'succeeded' }).eq('booking_id', bookingId);
    }
  }

  return { received: true };
}
