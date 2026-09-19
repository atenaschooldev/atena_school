import type { SupabaseClient } from '@supabase/supabase-js';
import { DiscountType, ValidatePromoCodeResponse, PromoCode } from '@atena/api-types';

export interface ValidatePromoCodeParams {
  code: string;
  coursePrice: number;
  registrationFee?: number;
  courseId?: string;
}

/**
 * Validates a promo code against the database and computes the discount amount.
 */
export async function validatePromoCode(
  supabase: SupabaseClient,
  params: ValidatePromoCodeParams
): Promise<ValidatePromoCodeResponse> {
  const cleanCode = (params.code || '').trim();
  if (!cleanCode) {
    return { valid: false, error: 'Codice promozionale non specificato' };
  }

  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .ilike('code', cleanCode)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !promo) {
    return { valid: false, error: 'Codice promozionale non valido o inesistente' };
  }

  const now = new Date();

  if (promo.valid_from && new Date(promo.valid_from) > now) {
    return { valid: false, error: 'Questo codice promozionale non è ancora attivo' };
  }

  if (promo.valid_until && new Date(promo.valid_until) < now) {
    return { valid: false, error: 'Questo codice promozionale è scaduto' };
  }

  if (promo.max_uses != null && Number(promo.used_count) >= Number(promo.max_uses)) {
    return { valid: false, error: 'Limite di utilizzi per questo codice promozionale raggiunto' };
  }

  const coursePrice = Number(params.coursePrice) || 0;
  const regFee = params.registrationFee != null ? Number(params.registrationFee) : 30;
  const discountType = Number(promo.discount_type) as DiscountType;
  const discountValue = Number(promo.discount_value) || 0;
  const waiveFee = Boolean(promo.waive_registration_fee);

  let discountAmount = 0;

  if (discountType === DiscountType.PERCENTAGE) {
    discountAmount = Math.round((coursePrice * (discountValue / 100)) * 100) / 100;
  } else if (discountType === DiscountType.FIXED_AMOUNT) {
    discountAmount = Math.min(coursePrice, discountValue);
  }

  // If waiveFee is set, also reduce the registration fee
  if (waiveFee && regFee > 0) {
    discountAmount += regFee;
  }

  return {
    valid: true,
    promo: {
      id: promo.id,
      code: promo.code,
      description: promo.description || null,
      discountType,
      discountValue,
      waiveRegistrationFee: waiveFee,
      discountAmount,
    },
  };
}

/**
 * Atomically increments the usage counter for a promo code
 */
export async function incrementPromoCodeUsage(supabase: SupabaseClient, promoCodeId: string): Promise<void> {
  try {
    const { data: current } = await supabase
      .from('promo_codes')
      .select('used_count')
      .eq('id', promoCodeId)
      .maybeSingle();

    if (current) {
      await supabase
        .from('promo_codes')
        .update({
          used_count: (Number(current.used_count) || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', promoCodeId);
    }
  } catch (err) {
    console.warn('Failed to increment promo code usage count:', err);
  }
}
