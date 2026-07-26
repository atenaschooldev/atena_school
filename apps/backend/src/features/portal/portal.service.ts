import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UpdateProfileDto } from './portal.controller';
import { calculateLessonDates } from '../../shared/utils/bookingScheduler';
import { getDynamicMaxLessons } from '@atena/utils';

export interface PortalUser {
  id: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
}

export interface PortalBooking {
  id: string;
  user_id?: string | null;
  student_email?: string | null;
  purchaser_email?: string | null;
  purchaser_phone?: string | null;
  student_phone?: string | null;
  purchaser_name?: string | null;
  student_name?: string | null;
}

@Injectable()
export class PortalService {
  private readonly logger = new Logger(PortalService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  private isUserBookingAuthorized(booking: PortalBooking, user: PortalUser): boolean {
    if (!user || !booking) return false;
    if (booking.user_id && booking.user_id === user.id) return true;
    const userEmail = (user.email || '').trim().toLowerCase();
    if (!userEmail) return false;
    const sEmail = (booking.student_email || '').trim().toLowerCase();
    const pEmail = (booking.purchaser_email || '').trim().toLowerCase();
    return sEmail === userEmail || pEmail === userEmail;
  }

  async getDashboardData(user: any) {
    if (!user || !user.id) {
      return { success: false, user: null, bookings: [] };
    }

    const cleanEmail = user.email ? user.email.trim().toLowerCase() : '';

    if (cleanEmail && user.id) {
      let officialFullName: string | null = null;
      let phoneFromBooking: string | null = null;
      let userRole = 'student';

      try {
        const { data: userBookings } = await this.supabaseAdmin
          .from('bookings')
          .select('*')
          .or(`purchaser_email.ilike.${cleanEmail},student_email.ilike.${cleanEmail}`);

        if (userBookings && userBookings.length > 0) {
          const parentBooking = userBookings.find(
            (b) => b.purchaser_email?.toLowerCase() === cleanEmail && b.student_email?.toLowerCase() !== cleanEmail,
          );
          if (parentBooking) {
            userRole = 'parent';
            phoneFromBooking = parentBooking.purchaser_phone || parentBooking.student_phone || null;
            officialFullName = parentBooking.purchaser_name || null;
          } else {
            const studentBooking = userBookings.find((b) => b.student_email?.toLowerCase() === cleanEmail);
            const anyB = studentBooking || userBookings[0];
            const isPurchaser = anyB.purchaser_email?.toLowerCase() === cleanEmail;
            phoneFromBooking = isPurchaser ? anyB.purchaser_phone : anyB.student_phone;
            officialFullName = isPurchaser ? anyB.purchaser_name : (anyB.student_name || anyB.purchaser_name);
          }
        }
      } catch {}

      const meta = user.user_metadata || {};
      const fallbackFirstName = meta.first_name || meta.given_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || cleanEmail.split('@')[0] || 'User';
      const fallbackLastName = meta.last_name || meta.family_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : '') || 'Student';

      let firstName = fallbackFirstName;
      let lastName = fallbackLastName;

      if (officialFullName && officialFullName.trim() !== '') {
        const parts = officialFullName.trim().split(' ');
        firstName = parts[0] || fallbackFirstName;
        lastName = parts.slice(1).join(' ') || fallbackLastName;
      }

      const calculatedFullName = `${firstName} ${lastName}`.trim();

      try {
        // Upsert public.users with official full name, role, and phone
        await this.supabaseAdmin.from('users').upsert({
          id: user.id,
          email: cleanEmail,
          first_name: firstName,
          last_name: lastName,
          full_name: calculatedFullName,
          role: userRole,
          phone: phoneFromBooking || null,
          is_active: true,
        }, { onConflict: 'id' });
      } catch (uErr: any) {
        this.logger.warn(`Users upsert error: ${uErr?.message || uErr}`);
      }

      try {
        await this.supabaseAdmin.rpc('sync_user_profile_from_bookings', {
          p_user_id: user.id,
          p_email: cleanEmail,
        });
      } catch {}

      try {
        // Link bookings.user_id
        await this.supabaseAdmin.from('bookings').update({ user_id: user.id })
          .or(`purchaser_email.ilike.${cleanEmail},student_email.ilike.${cleanEmail}`)
          .is('user_id', null);
      } catch (bErr: any) {
        this.logger.warn(`Bookings link error: ${bErr?.message || bErr}`);
      }

      try {
        // Link payments.user_id for all linked bookings
        const { data: matchingBookings } = await this.supabaseAdmin
          .from('bookings')
          .select('id')
          .or(`purchaser_email.ilike.${cleanEmail},student_email.ilike.${cleanEmail},user_id.eq.${user.id}`);

        if (matchingBookings && matchingBookings.length > 0) {
          const bIds = matchingBookings.map((b) => b.id);
          await this.supabaseAdmin.from('payments').update({ user_id: user.id })
            .in('booking_id', bIds)
            .is('user_id', null);
        }
      } catch (pErr: any) {
        this.logger.warn(`Payments link error: ${pErr?.message || pErr}`);
      }

      try {
        // Link students.student_user_id
        await this.supabaseAdmin.from('students').update({ student_user_id: user.id })
          .ilike('email', cleanEmail)
          .is('student_user_id', null);
      } catch (sErr: any) {
        this.logger.warn(`Students link error: ${sErr?.message || sErr}`);
      }

      try {
        // Link annual_memberships.user_id
        await this.supabaseAdmin.from('annual_memberships').update({ user_id: user.id })
          .ilike('email', cleanEmail)
          .is('user_id', null);
      } catch (mErr: any) {
        this.logger.warn(`Memberships link error: ${mErr?.message || mErr}`);
      }

      // Link Parent / Child students.parent_id
      try {
        if (userRole === 'parent') {
          const { data: parentBookings } = await this.supabaseAdmin
            .from('bookings')
            .select('student_email')
            .ilike('purchaser_email', cleanEmail);

          if (parentBookings && parentBookings.length > 0) {
            for (const pb of parentBookings) {
              if (pb.student_email && pb.student_email.toLowerCase() !== cleanEmail) {
                await this.supabaseAdmin
                  .from('students')
                  .update({ parent_id: user.id })
                  .ilike('email', pb.student_email.trim());
              }
            }
          }
        }
      } catch (parErr: any) {
        this.logger.warn(`Parent-child linking error: ${parErr?.message || parErr}`);
      }
    }

    const filterConditions = [`user_id.eq.${user.id}`];
    if (cleanEmail) {
      filterConditions.push(`student_email.ilike.${cleanEmail}`);
      filterConditions.push(`purchaser_email.ilike.${cleanEmail}`);
    }

    const { data: rawBookings } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .or(filterConditions.join(','))
      .in('payment_status', ['paid', 'completed', 'reserved', 'pending_payment', 'pending'])
      .order('created_at', { ascending: false });

    const bookingsList = rawBookings || [];

    const courseIds = Array.from(new Set(bookingsList.map((b) => b.course_id || b.item_id).filter(Boolean)));
    let coursesMap = new Map<string, any>();

    if (courseIds.length > 0) {
      const { data: cData } = await this.supabaseAdmin
        .from('courses')
        .select('id, name, title_it, price, schedule_days, start_time, end_time, schedule_type, teachers!courses_teacher_id_fkey(full_name)')
        .in('id', courseIds);

      if (cData) {
        coursesMap = new Map(cData.map((c) => [c.id, c]));
      }
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const enrichedBookings = bookingsList.map((b: any) => {
      const cid = b.course_id || b.item_id;
      const c = coursesMap.get(cid);
      const title = c?.name || c?.title_it || b.course_name || 'Corso Atena School';
      const coursePrice = c?.price ? Number(c.price) : Number(b.amount_paid || 0);
      const teacherName = (c as any)?.teachers?.full_name || 'Atena School';

      const bdateStr = b.start_date || b.booking_date || b.created_at;
      let isFuture = true;
      if (bdateStr) {
        const d = new Date(bdateStr);
        if (!isNaN(d.getTime())) {
          isFuture = d.getTime() >= now.getTime();
        }
      }

      return {
        ...b,
        item_id: cid,
        item_title: title,
        course_name: title,
        price: coursePrice,
        teacher_name: teacherName,
        is_future: isFuture,
        schedule_days: b.schedule_days || c?.schedule_days || null,
        start_time: b.start_time || c?.start_time || null,
        end_time: b.end_time || c?.end_time || null,
        schedule_type: b.schedule_type || c?.schedule_type || null,
      };
    });

    let annualFeePaid = false;
    if (cleanEmail) {
      try {
        const { data: mem } = await this.supabaseAdmin
          .from('annual_memberships')
          .select('id')
          .ilike('email', cleanEmail)
          .eq('status', 'active')
          .maybeSingle();
        if (mem?.id) annualFeePaid = true;
      } catch {}
    }

    const { data: dbProfile } = await this.supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const pData = dbProfile as any;
    const dbFullName = (pData?.full_name || (pData?.first_name ? `${pData.first_name} ${pData.last_name || ''}`.trim() : '')) || undefined;

    return {
      success: true,
      annualFeePaid,
      user: {
        ...user,
        annualFeePaid,
        dbProfile: dbProfile || null,
        user_metadata: {
          ...user.user_metadata,
          ...(dbFullName ? { custom_full_name: dbFullName, full_name: dbFullName } : {}),
          ...(pData?.phone ? { phone: pData.phone } : {}),
          ...(pData?.tax_code ? { tax_code: pData.tax_code } : {}),
        },
      },
      bookings: enrichedBookings,
    };
  }

  async getBookingLessons(bookingId: string, user: any) {
    const { data: booking } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) {
      throw new NotFoundException('Prenotazione non trovata');
    }

    if (!this.isUserBookingAuthorized(booking, user)) {
      throw new ForbiddenException('Non sei autorizzato ad accedere a questa prenotazione');
    }

    const cid = booking.course_id || booking.item_id;
    let course: any = null;
    if (cid) {
      const { data: cData } = await this.supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', cid)
        .maybeSingle();
      course = cData;
    }

    const bdate = booking.start_date || booking.booking_date || new Date().toISOString();

    const calculated = calculateLessonDates(
      bdate,
      course?.start_time || '10:00',
      course?.category || 'general',
      course?.schedule_days || null,
      course?.lesson_duration_minutes || 60,
      course?.start_time || null,
      course?.end_time || null,
      course?.schedule_type || null
    );

    const lessons = calculated.map((item, idx) => ({
      id: `lesson-${booking.id}-${idx}`,
      booking_id: booking.id,
      starts_at: item.startsAt,
      ends_at: item.endsAt,
      status: idx === 0 ? 'scheduled' : 'upcoming',
      created_at: booking.created_at,
    }));

    const isFixedSchedule = course?.schedule_type === 'fixed';
    const maxLessons = booking.total_lessons_count != null
      ? booking.total_lessons_count
      : isFixedSchedule
        ? lessons.length
        : getDynamicMaxLessons(
            course?.name || '',
            bdate,
            course?.category || '',
            course?.lessons_per_week,
          );

    return { success: true, booking, course, lessons, max_lessons: maxLessons };
  }

  async updateProfile(user: any, dto: UpdateProfileDto) {
    const parts = dto.profileName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    await this.supabaseAdmin
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: dto.profileName,
        first_name: firstName,
        last_name: lastName,
        phone: dto.profilePhone,
        updated_at: new Date().toISOString(),
      });

    return { success: true };
  }

  async scheduleNextLesson(bookingId: string, dateStr: string, timeStr: string, user: any) {
    const { data: booking } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .maybeSingle();

    if (!booking) throw new NotFoundException('Prenotazione non trovata');

    if (!this.isUserBookingAuthorized(booking, user)) {
      throw new ForbiddenException('Non sei autorizzato ad accedere a questa prenotazione');
    }

    const cid = booking.course_id || booking.item_id;
    const { data: course } = await this.supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', cid)
      .maybeSingle();

    if (!course) throw new NotFoundException('Corso non trovato');

    const { count } = await this.supabaseAdmin
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('booking_id', bookingId);

    const bdate = booking.start_date || booking.booking_date || new Date().toISOString();
    const maxLessons = booking.total_lessons_count || getDynamicMaxLessons(
      course.name || '',
      bdate,
      course.category || '',
      course.lessons_per_week
    );

    if ((count || 0) >= maxLessons) {
      return {
        success: false,
        error: `Hai già programmato tutte le lezioni disponibili (${maxLessons}/${maxLessons}).`,
      };
    }

    const timeMatch = (timeStr || '').match(/^(\d{2}):(\d{2})$/);
    if (!timeMatch) return { success: false, error: 'Formato orario non valido. Usa HH:MM.' };

    const startHour = parseInt(timeMatch[1], 10);
    const startMin = parseInt(timeMatch[2], 10);
    const baseDate = new Date(dateStr);

    const romeString = baseDate.toLocaleString('en-US', { timeZone: 'Europe/Rome' });
    const utcString = baseDate.toLocaleString('en-US', { timeZone: 'UTC' });
    const offset = Math.round((new Date(romeString).getTime() - new Date(utcString).getTime()) / (1000 * 60 * 60));

    const startsAt = new Date(Date.UTC(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth(),
      baseDate.getUTCDate(),
      startHour - offset,
      startMin,
      0,
    ));
    const durationMinutes = Number(course.lesson_duration_minutes || 60);
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

    const { data: newLesson, error: insertErr } = await (this.supabaseAdmin.from('lessons') as any)
      .insert({
        booking_id: bookingId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'scheduled',
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    return { success: true, lesson: newLesson };
  }
}
