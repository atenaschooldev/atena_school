import type { SupabaseClient } from '@supabase/supabase-js';
import { DiscountType, ValidatePromoCodeResponse, PromoCode } from '@atena/api-types';

export interface ValidatePromoCodeParams {
  code: string;
  coursePrice: number;
  registrationFee?: number;
  courseId?: string;
  purchaserEmail?: string;
  purchaserTaxCode?: string;
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

  // Check course scope restriction if configured
  if (
    Array.isArray(promo.applicable_course_ids) &&
    promo.applicable_course_ids.length > 0
  ) {
    if (!params.courseId || !promo.applicable_course_ids.map(String).includes(String(params.courseId))) {
      return {
        valid: false,
        error: 'Questo codice promozionale non è valido per il corso selezionato',
      };
    }
  }

  // Check global max uses limit
  if (promo.max_uses != null && Number(promo.max_uses) > 0) {
    const { count: actualUses } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .ilike('promo_code', cleanCode)
      .neq('booking_status', 3); // 3=CANCELLED

    if (actualUses != null && actualUses >= Number(promo.max_uses)) {
      return { valid: false, error: 'Limite di utilizzi per questo codice promozionale raggiunto' };
    }
  }

  // Check per-user max uses limit if user identifier is provided
  if (
    promo.max_uses_per_user != null &&
    Number(promo.max_uses_per_user) > 0 &&
    (params.purchaserEmail || params.purchaserTaxCode)
  ) {
    let userQuery = supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .ilike('promo_code', cleanCode)
      .neq('booking_status', 3);

    if (params.purchaserEmail && params.purchaserTaxCode) {
      userQuery = userQuery.or(
        `purchaser_email.eq.${params.purchaserEmail.trim().toLowerCase()},purchaser_tax_code.ilike.${params.purchaserTaxCode.trim()}`
      );
    } else if (params.purchaserEmail) {
      userQuery = userQuery.eq('purchaser_email', params.purchaserEmail.trim().toLowerCase());
    } else if (params.purchaserTaxCode) {
      userQuery = userQuery.ilike('purchaser_tax_code', params.purchaserTaxCode.trim());
    }

    const { count: userUses } = await userQuery;

    if (userUses != null && userUses >= Number(promo.max_uses_per_user)) {
      return {
        valid: false,
        error: 'Hai già raggiunto il limite di utilizzi per questo codice promozionale',
      };
    }
  }

  const coursePrice = Number(params.coursePrice) || 0;
  const regFee = params.registrationFee != null ? Number(params.registrationFee) : 0;
  const discountType = Number(promo.discount_type) as DiscountType;
  const discountValue = Number(promo.discount_value) || 0;
  const waiveFee = Boolean(promo.waive_registration_fee);

  let discountAmount = 0;

  if (discountType === DiscountType.PERCENTAGE) {
    discountAmount = Math.round((coursePrice * (discountValue / 100)) * 100) / 100;
  } else if (discountType === DiscountType.FIXED_AMOUNT) {
    discountAmount = Math.min(coursePrice, discountValue);
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
 * Legacy counter compatibility stubs (dynamic count from bookings is used instead)
 */
export async function incrementPromoCodeUsage(_supabase: SupabaseClient, _promoCodeId: string): Promise<void> {
  // No-op: usage is derived dynamically from public.bookings
}

export async function decrementPromoCodeUsage(_supabase: SupabaseClient, _promoCodeId: string): Promise<void> {
  // No-op: usage is derived dynamically from public.bookings
}

