import { getSupabaseAdmin } from './supabase-admin';
import { ACADEMIC_YEAR } from '@/constants/booking';
import { MembershipStatus } from '@atena/api-types';

export interface CheckFeeParams {
  taxCode?: string;
  email?: string;
  phone?: string;
}

export async function checkFeeStatus(params: CheckFeeParams) {
  const supabase = getSupabaseAdmin();
  const rawTax = params.taxCode ? params.taxCode.trim().toUpperCase() : null;
  // Strict sanitization to prevent PostgREST filter injection in .or() query
  const cleanTax = rawTax ? rawTax.replace(/[^A-Z0-9]/gi, '') : null;

  if (!cleanTax) {
    return { success: true, annualFeePaid: false, userFound: false, requiresFee: true };
  }

  // 1. Check active annual memberships by Codice Fiscale
  const { data: mem } = await supabase
    .from('annual_memberships')
    .select('id')
    .ilike('tax_code', cleanTax)
    .eq('academic_year', ACADEMIC_YEAR.CURRENT)
    .eq('status', MembershipStatus.ACTIVE)
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
