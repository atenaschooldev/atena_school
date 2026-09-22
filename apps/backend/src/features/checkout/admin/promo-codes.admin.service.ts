import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from '../dto/promo-codes.admin.dto';

@Injectable()
export class PromoCodesAdminService {
  private readonly logger = new Logger(PromoCodesAdminService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const serviceKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  async listAllPromoCodes() {
    const { data: promos, error } = await this.supabaseAdmin
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Failed to list promo codes:', error);
      throw new BadRequestException(`Failed to list promo codes: ${error.message}`);
    }

    const promoList = promos || [];

    // Derive active uses count dynamically from public.bookings for each promo code
    const results = await Promise.all(
      promoList.map(async (p) => {
        const { count } = await this.supabaseAdmin
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .ilike('promo_code', p.code)
          .neq('booking_status', 3); // 3=CANCELLED

        return {
          ...p,
          used_count: count || 0,
        };
      })
    );

    return results;
  }

  async createPromoCode(dto: CreatePromoCodeDto) {
    const cleanCode = dto.code.trim().toUpperCase();

    // Check duplicate
    const { data: existing } = await this.supabaseAdmin
      .from('promo_codes')
      .select('id')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException(`Il codice promozionale '${cleanCode}' esiste già.`);
    }

    const { data: created, error } = await this.supabaseAdmin
      .from('promo_codes')
      .insert({
        code: cleanCode,
        description: dto.description?.trim() || null,
        discount_type: dto.discount_type,
        discount_value: dto.discount_value,
        waive_registration_fee: Boolean(dto.waive_registration_fee),
        max_uses: dto.max_uses != null ? Number(dto.max_uses) : null,
        max_uses_per_user: dto.max_uses_per_user != null ? Number(dto.max_uses_per_user) : null,
        applicable_course_ids: dto.applicable_course_ids || [],
        valid_from: dto.valid_from || null,
        valid_until: dto.valid_until || null,
        is_active: dto.is_active !== false,
      })
      .select()
      .single();

    if (error || !created) {
      this.logger.error('Failed to create promo code:', error);
      throw new BadRequestException(error?.message || 'Failed to create promo code');
    }

    return {
      ...created,
      used_count: 0,
    };
  }

  async updatePromoCode(id: string, dto: UpdatePromoCodeDto) {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.code !== undefined) {
      updatePayload.code = dto.code.trim().toUpperCase();
    }
    if (dto.description !== undefined) {
      updatePayload.description = dto.description?.trim() || null;
    }
    if (dto.discount_type !== undefined) {
      updatePayload.discount_type = dto.discount_type;
    }
    if (dto.discount_value !== undefined) {
      updatePayload.discount_value = dto.discount_value;
    }
    if (dto.waive_registration_fee !== undefined) {
      updatePayload.waive_registration_fee = Boolean(dto.waive_registration_fee);
    }
    if (dto.max_uses !== undefined) {
      updatePayload.max_uses = dto.max_uses != null ? Number(dto.max_uses) : null;
    }
    if (dto.max_uses_per_user !== undefined) {
      updatePayload.max_uses_per_user = dto.max_uses_per_user != null ? Number(dto.max_uses_per_user) : null;
    }
    if (dto.applicable_course_ids !== undefined) {
      updatePayload.applicable_course_ids = dto.applicable_course_ids || [];
    }
    if (dto.valid_from !== undefined) {
      updatePayload.valid_from = dto.valid_from || null;
    }
    if (dto.valid_until !== undefined) {
      updatePayload.valid_until = dto.valid_until || null;
    }
    if (dto.is_active !== undefined) {
      updatePayload.is_active = Boolean(dto.is_active);
    }

    const { data: updated, error } = await this.supabaseAdmin
      .from('promo_codes')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      throw new BadRequestException(error?.message || 'Failed to update promo code');
    }

    const { count } = await this.supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .ilike('promo_code', updated.code)
      .neq('booking_status', 3);

    return {
      ...updated,
      used_count: count || 0,
    };
  }

  async togglePromoCode(id: string) {
    const { data: promo } = await this.supabaseAdmin
      .from('promo_codes')
      .select('id, is_active, code')
      .eq('id', id)
      .maybeSingle();

    if (!promo) {
      throw new NotFoundException('Promo code non trovato');
    }

    const nextActive = !promo.is_active;

    const { data: updated, error } = await this.supabaseAdmin
      .from('promo_codes')
      .update({
        is_active: nextActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) {
      throw new BadRequestException(error?.message || 'Failed to toggle promo code');
    }

    return updated;
  }

  async deletePromoCode(id: string) {
    const { error } = await this.supabaseAdmin
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message || 'Failed to delete promo code');
    }

    return { success: true, id };
  }
}
