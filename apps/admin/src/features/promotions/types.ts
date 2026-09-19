export interface PromoCodeItem {
  id: string;
  code: string;
  description?: string | null;
  discount_type: number; // 1=PERCENTAGE, 2=FIXED_AMOUNT
  discount_value: number;
  waive_registration_fee: boolean;
  max_uses?: number | null;
  used_count: number;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePromoCodeInput {
  code: string;
  description?: string;
  discount_type: number;
  discount_value: number;
  waive_registration_fee?: boolean;
  max_uses?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
}
