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
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';

  if (!url || !serviceKey) {
    throw new Error('Supabase configuration missing: SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
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

export interface SupabaseCourseRow {
  id: string;
  name?: string;
  title_it?: string;
  price?: number | string | null;
  status?: string | null;
  photo_url?: string | null;
  description?: string | null;
  teacher_id?: string | null;
  lessons_per_week?: number | null;
  sort_order?: number | null;
  schedule_type?: string | null;
  total_lessons?: number | null;
  schedule_days?: number[] | null;
  start_time?: string | null;
  end_time?: string | null;
  lesson_duration_minutes?: number | null;
  total_hours?: number | null;
  course_format?: string | null;
  category?: string | null;
  slug?: string | null;
  updated_at?: string | null;
}

export interface SupabasePaymentRow {
  id?: string;
  booking_id?: string | null;
  user_id?: string | null;
  student_id?: string | null;
  amount: number;
  currency: string;
  payment_method: string;
  type: 'payment' | 'registration_fee' | string;
  status: string;
  provider: string;
  provider_transaction_id?: string | null;
  notes?: string | null;
  created_at?: string;
}

function extractCleanTime(timeStr?: string | null): string | null {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : timeStr.trim();
}

function computeEndTime(startTime?: string | null, durationMinutes: number = 60): string | null {
  if (!startTime) return null;
  const clean = extractCleanTime(startTime);
  if (!clean || !clean.includes(':')) return null;
  const [hStr, mStr] = clean.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return null;
  const totalMin = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

function computeTotalLessonsCount(course: SupabaseCourseRow | null, calculatedLessonsCount: number): number | null {
  if (course?.total_lessons != null) return course.total_lessons;
  if (course?.total_hours != null) return null;
  if (course?.lessons_per_week != null && course?.schedule_type === 'flexible') {
    return course.lessons_per_week * 4;
  }
  return calculatedLessonsCount || 8;
}

export async function getPublicCourses() {
  const supabase = getSupabaseAdmin();
  let { data: coursesData, error } = await supabase
    .from('courses')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error || !coursesData) {
    const { data: fallbackData } = await supabase.from('courses').select('*');
    coursesData = fallbackData || [];
  }

  const { data: teachersData } = await supabase.from('teachers').select('teacher_id, full_name, photo_url');
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

export async function getItem(id: string) {
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let courseData: any = null;
  if (isUuid) {
    const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
    courseData = data;
  }
  if (!courseData) {
    const { data } = await supabase.from('courses').select('*').eq('slug', id).maybeSingle();
    courseData = data;
  }

  if (!courseData) {
    return { success: false, error: 'Item not found' };
  }

  let teacherName = null;
  let teacherPhotoUrl = null;
  if (courseData.teacher_id) {
    const { data: teacher } = await supabase
      .from('teachers')
      .select('full_name, photo_url')
      .eq('teacher_id', courseData.teacher_id)
      .maybeSingle();
    if (teacher) {
      teacherName = teacher.full_name;
      teacherPhotoUrl = teacher.photo_url;
    }
  }

  const course = {
    ...courseData,
    teacher_name: teacherName,
    teacher_photo_url: teacherPhotoUrl,
  };

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

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, type')
    .eq('booking_id', id);

  const coursePayment = payments?.find((p: { amount: unknown; type: string }) => p.type === 'payment');
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
    },
  };
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

  const sEmail = dto.isForChild ? (dto.studentEmail || null) : (dto.email || null);
  const sName = (studentName || purchaserName || 'Studente').trim();
  const sTaxCode = dto.isForChild ? (dto.studentTaxCode || null) : (dto.purchaserTaxCode || null);
  const sNameParts = sName.split(' ');
  const sFirstName = sNameParts[0] || 'Studente';
  const sLastName = sNameParts.slice(1).join(' ') || '';

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
      // For child bookings, do NOT lookup by parent email (only by dedicated studentEmail if provided)
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
        const { data: newStudent } = await supabase
          .from('students')
          .insert({
            full_name: sName || 'Studente',
            first_name: sFirstName,
            last_name: sLastName,
            email: sEmail,
            phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
            tax_code: sTaxCode || null,
            birth_date: dto.studentBirthDate || null,
            parent_id: linkedUserId || null,
            student_user_id: studentAuthUserId || null,
            language_level: 'A1',
            registration_date: new Date().toISOString().split('T')[0],
            status: hasPaidMembership ? 'active' : 'pending',
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
            first_name: sFirstName || undefined,
            last_name: sLastName || undefined,
            phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
            tax_code: sTaxCode || undefined,
            birth_date: dto.studentBirthDate || undefined,
            parent_id: linkedUserId || undefined,
            student_user_id: studentAuthUserId || undefined,
            status: hasPaidMembership ? 'active' : undefined,
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
        if (sTaxCode) {
          const { data: mData } = await supabase
            .from('annual_memberships')
            .select('id')
            .ilike('tax_code', sTaxCode)
            .eq('academic_year', '2026/2027')
            .maybeSingle();
          if (mData) existingMem = mData;
        } else if (studentId) {
          const { data: mData } = await supabase
            .from('annual_memberships')
            .select('id')
            .eq('student_id', studentId)
            .eq('academic_year', '2026/2027')
            .maybeSingle();
          if (mData) existingMem = mData;
        }

        const memEmail = dto.isForChild ? (dto.studentEmail || dto.email || null) : (dto.email || null);
        const memPhone = (dto.isForChild ? dto.studentPhone : dto.phone) || null;

        if (existingMem) {
          await supabase
            .from('annual_memberships')
            .update({
              status: 'active',
              paid_at: new Date().toISOString(),
              booking_id: bookingId,
              student_id: studentId || undefined,
              user_id: linkedUserId || studentAuthUserId || undefined,
              tax_code: sTaxCode || undefined,
              email: memEmail || undefined,
              phone: memPhone || undefined,
            })
            .eq('id', existingMem.id);
        } else {
          await supabase.from('annual_memberships').upsert(
            {
              tax_code: sTaxCode || null,
              email: memEmail,
              phone: memPhone,
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
  course: SupabaseCourseRow | null,
  lessons: Array<{ startsAt: string; endsAt: string }>,
  supabase: SupabaseClient
) {
  if (!lessons || lessons.length === 0) return;
  try {
    const teacherId = course?.teacher_id || null;
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

    const paymentsToInsert: SupabasePaymentRow[] = [];
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

export async function sendBookingNotificationEmails(params: {
  booking: any;
  course: any;
  dto: CreateReservationParams;
}) {
  const { booking, course, dto } = params;
  const courseName = course?.name || course?.title_it || 'Corso Atena School';
  const purchaserName = `${dto.firstName} ${dto.lastName}`.trim();
  const studentName = dto.isForChild
    ? `${dto.studentFirstName || ''} ${dto.studentLastName || ''}`.trim() || purchaserName
    : purchaserName;
  const adminEmail = process.env.SCHOOL_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'info@atenaschool.com';
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || 'Atena School <prenotazioni@atenaschool.com>';

  const isPaidOnline = booking.payment_status === 'paid' || booking.payment_status === 'completed';
  const paymentStatusText = isPaidOnline ? 'Pagato Online con Carta' : 'Prenotato con Saldo in Sede';
  const totalEur = Number(booking.amount_paid || 0).toFixed(2);
  const regFeeEur = Number(booking.registration_fee || 0).toFixed(2);

  const clientSubject = isPaidOnline
    ? `Conferma Pagamento e Iscrizione: ${courseName} - Atena School`
    : `Conferma Prenotazione: ${courseName} - Atena School`;

  const clientHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 22px; font-weight: 900; color: #043569; letter-spacing: 1px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: ${isPaidOnline ? '#ecfdf5; color: #047857;' : '#fffbeb; color: #b45309;'}; margin-top: 10px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 14px; }
          .label { color: #64748b; font-weight: 500; }
          .val { font-weight: 700; color: #0f172a; }
          .total-box { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; }
          .btn { display: block; text-align: center; background: #043569; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 24px; border-radius: 12px; margin-top: 24px; font-size: 14px; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">ATENA SCHOOL</div>
            <div class="badge">${paymentStatusText}</div>
          </div>
          <h2 style="color: #043569; font-size: 18px; margin-bottom: 8px;">Grazie per la tua prenotazione, ${purchaserName}!</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">La tua richiesta per il corso <strong>${courseName}</strong> è stata registrata con successo.</p>
          
          <div class="total-box">
            <div class="row"><span class="label">Studente:</span><span class="val">${studentName}</span></div>
            <div class="row"><span class="label">Data inizio:</span><span class="val">${dto.date || 'Da concordare'}</span></div>
            <div class="row"><span class="label">Orario:</span><span class="val">${dto.time || '16:00'}</span></div>
            ${Number(regFeeEur) > 0 ? `<div class="row"><span class="label">Quota iscrizione annuale:</span><span class="val">€${regFeeEur}</span></div>` : ''}
            <div class="row" style="border: none; font-size: 16px; margin-top: 8px;"><span class="label" style="font-weight: 800; color: #043569;">Totale:</span><span class="val" style="font-size: 18px; color: #f8861d;">€${totalEur}</span></div>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://atena-school-app.vercel.app'}" class="btn">Accedi al tuo Portale Studente</a>
          
          <div class="footer">
            Atena School — Via Matteotti 11, 89022 Cittanova (RC)<br>
            Per qualsiasi informazione o supporto: info@atenaschool.com
          </div>
        </div>
      </body>
    </html>
  `;

  const adminSubject = `[Nuova Prenotazione] ${courseName} - ${studentName} (${paymentStatusText})`;
  const adminHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2 style="color: #043569;">Nuova prenotazione ricevuta dal sito web</h2>
      <p><strong>Corso:</strong> ${courseName}</p>
      <p><strong>Acquirente:</strong> ${purchaserName} (<a href="mailto:${dto.email}">${dto.email}</a>, tel: ${dto.phone || 'N/D'})</p>
      <p><strong>Codice Fiscale Acquirente:</strong> ${dto.purchaserTaxCode || 'N/D'}</p>
      ${dto.isForChild ? `<p><strong>Studente (Figlio):</strong> ${studentName} (CF: ${dto.studentTaxCode || 'N/D'}, Nascita: ${dto.studentBirthDate || 'N/D'})</p>` : ''}
      <p><strong>Importo:</strong> €${totalEur} (Quota annuale: €${regFeeEur})</p>
      <p><strong>Modalità di pagamento:</strong> ${paymentStatusText}</p>
      <p><strong>Data/Orario richiesto:</strong> ${dto.date || 'Da concordare'} ore ${dto.time || 'N/D'}</p>
      ${dto.notes ? `<p><strong>Note cliente:</strong> ${dto.notes}</p>` : ''}
      <p><strong>ID Prenotazione:</strong> ${booking.id}</p>
    </div>
  `;

  if (resendApiKey) {
    try {
      await Promise.allSettled([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [dto.email],
            subject: clientSubject,
            html: clientHtml,
          }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [adminEmail],
            subject: adminSubject,
            html: adminHtml,
          }),
        }),
      ]);
      console.log(`[EMAIL DISPATCHED]: Confirmation sent to ${dto.email} and admin ${adminEmail}`);
    } catch (err) {
      console.error('[EMAIL DISPATCH ERROR]:', err);
    }
  } else {
    console.log(`[EMAIL NOTIFICATION]: Booking ${booking.id} created for ${dto.email} -> ${adminEmail}`);
  }
}

export async function createReservation(dto: CreateReservationParams) {
  const supabase = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
  let course: SupabaseCourseRow | null = null;

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

  const isFeeRequired = feeStatus.annualFeePaid === false;
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
      purchaser_tax_code: dto.purchaserTaxCode || dto.studentTaxCode || '',
      student_name: studentName,
      student_email: dto.isForChild ? (dto.studentEmail || dto.email) : dto.email,
      student_phone: dto.isForChild ? (dto.studentPhone || dto.phone) : dto.phone,
      student_tax_code: dto.isForChild ? (dto.studentTaxCode || '') : (dto.purchaserTaxCode || dto.studentTaxCode || ''),
      student_birth_date: dto.studentBirthDate || null,
      start_date: dto.date || new Date().toISOString(),
      schedule_days: course?.schedule_days || null,
      start_time: course?.start_time || extractCleanTime(dto.time) || null,
      end_time: course?.end_time || computeEndTime(dto.time, course?.lesson_duration_minutes || 60),
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

  // Send transactional email notifications
  sendBookingNotificationEmails({ booking, course, dto }).catch((err) => {
    console.warn('Async sendBookingNotificationEmails error:', err);
  });

  return { success: true, bookingId: booking.id, booking };
}

export async function getSystemSettings(): Promise<{ stripeEnabled: boolean }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'stripe_enabled')
      .maybeSingle();

    if (!error && data?.value !== undefined && data?.value !== null) {
      if (typeof data.value === 'boolean') return { stripeEnabled: data.value };
      if (typeof data.value === 'string') return { stripeEnabled: data.value === 'true' };
      if (typeof data.value === 'object' && data.value !== null && 'enabled' in data.value) {
        return { stripeEnabled: Boolean((data.value as any).enabled) };
      }
    }
  } catch (err) {
    console.warn('[getSystemSettings fallback]:', err);
  }

  // Default fallback (disabled for MVP unless explicitly enabled in env)
  const envEnabled = process.env.NEXT_PUBLIC_ENABLE_STRIPE === 'true' || process.env.ENABLE_STRIPE === 'true';
  return { stripeEnabled: envEnabled };
}

export async function updateSystemSettings(settings: { stripeEnabled: boolean }): Promise<{ stripeEnabled: boolean }> {
  const supabase = getSupabaseAdmin();
  try {
    await supabase.from('app_settings').upsert({
      key: 'stripe_enabled',
      value: settings.stripeEnabled,
      description: 'Enable or disable Stripe online payment gateway on checkout',
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[updateSystemSettings error]:', err);
    throw err;
  }
  return { stripeEnabled: settings.stripeEnabled };
}

export async function createStripeSession(dto: CreateReservationParams) {
  const settings = await getSystemSettings();
  if (!settings.stripeEnabled) {
    throw new Error('I pagamenti online sono temporaneamente disabilitati. Si prega di selezionare la prenotazione con saldo in sede.');
  }

  const supabase = getSupabaseAdmin();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  let resolvedItemId = dto.itemId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.itemId);
  if (!isUuid) {
    const { data: course } = await supabase.from('courses').select('id').eq('slug', dto.itemId).maybeSingle();
    if (course?.id) {
      resolvedItemId = course.id;
    }
  }

  // 1. Primary: Invoke Supabase Edge Function 'create-checkout-session' (creates 1 booking + 1 Stripe session)
  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke('create-checkout-session', {
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

    if (!edgeErr && edgeData?.url) {
      return { success: true, url: edgeData.url, bookingId: edgeData.bookingId };
    }
    if (edgeErr || edgeData?.error) {
      console.warn('[Supabase Edge Function Warning]:', edgeErr?.message || edgeData?.error);
    }
  } catch (invokeErr: any) {
    console.warn('[Supabase Functions Invoke Failed, fallback to direct Stripe SDK]:', invokeErr?.message || invokeErr);
  }

  // 2. Fallback ONLY if Edge Function fails: Direct Stripe SDK session creation
  const reservationRes = await createReservation({
    ...dto,
    paymentMethod: 'stripe',
    paymentStatus: 'pending',
  });

  const booking = reservationRes.booking;
  const coursePrice = Number(booking.amount_paid) - Number(booking.registration_fee || 0);
  const regFee = Number(booking.registration_fee || 0);

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

  const supabase = getSupabaseAdmin();

  if (event && event.id) {
    const { data: existingEvent } = await supabase
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
      await supabase.from('bookings').update({ payment_status: 'completed', payment_method: 'card_online' }).eq('id', bookingId);
      await supabase.from('payments').update({ status: 'succeeded' }).eq('booking_id', bookingId);
    }
  }

  if (event && event.id) {
    await supabase.from('stripe_webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });
  }

  return { received: true };
}
