import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UpdateProfileDto } from './portal.controller';
import { calculateLessonDates } from '../../shared/utils/bookingScheduler';

@Injectable()
export class PortalService {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  async getDashboardData(user: any) {
    if (!user || !user.id) {
      return { success: false, user: null, bookings: [] };
    }

    const cleanEmail = user.email ? user.email.trim().toLowerCase() : '';

    if (cleanEmail) {
      try {
        await this.supabaseAdmin.rpc('sync_user_profile_from_bookings', {
          p_user_id: user.id,
          p_email: cleanEmail,
        });
      } catch {
        // ignore
      }
    }

    const { data: rawBookings } = await this.supabaseAdmin
      .from('bookings')
      .select('*')
      .or(`user_id.eq.${user.id},student_email.ilike.${cleanEmail},purchaser_email.ilike.${cleanEmail}`)
      .in('payment_status', ['paid', 'completed', 'reserved', 'pending_payment', 'pending'])
      .order('created_at', { ascending: false });

    const bookingsList = rawBookings || [];

    const courseIds = Array.from(new Set(bookingsList.map((b) => b.course_id || b.item_id).filter(Boolean)));
    let coursesMap = new Map<string, any>();

    if (courseIds.length > 0) {
      const { data: cData } = await this.supabaseAdmin
        .from('courses')
        .select('id, name, title_it, price, teachers!courses_teacher_id_fkey(full_name)')
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
      };
    });

    const { data: dbProfile } = await this.supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const pData = dbProfile as any;
    const dbFullName = (pData?.full_name || (pData?.first_name ? `${pData.first_name} ${pData.last_name || ''}`.trim() : '')) || undefined;

    return {
      success: true,
      user: {
        ...user,
        dbProfile: dbProfile || null,
        user_metadata: {
          ...user.user_metadata,
          ...(dbFullName ? { custom_full_name: dbFullName, full_name: dbFullName } : {}),
          ...(pData?.phone ? { phone: pData.phone } : {}),
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
    const btime = booking.booking_time || '10:00';

    const calculated = calculateLessonDates(
      bdate,
      btime,
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

    return { success: true, booking, course, lessons };
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
}
