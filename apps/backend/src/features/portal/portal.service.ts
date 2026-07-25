import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UpdateProfileDto } from './portal.controller';

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
      bookings: bookingsList,
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

    return { success: true, booking, lessons: [] };
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
