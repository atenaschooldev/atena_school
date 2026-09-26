import type { SupabaseClient } from '@supabase/supabase-js';
import { MembershipStatus, FeeStatusResponse } from '@atena/api-types';
import { getCurrentAcademicYear } from '@atena/utils';

export interface CheckFeeParams {
  taxCode?: string;
  email?: string;
  phone?: string;
  academicYear?: string;
}

/**
 * Checks if the student/purchaser has already paid the annual registration fee
 * for the school's configured academic year across annual_memberships, students, or bookings.
 */
export async function checkFeeStatus(
  supabase: SupabaseClient,
  params: CheckFeeParams
): Promise<FeeStatusResponse> {
  const rawTax = params.taxCode ? params.taxCode.trim().toUpperCase() : null;
  // Strict sanitization to prevent PostgREST filter injection in .or() query
  const cleanTax = rawTax ? rawTax.replace(/[^A-Z0-9]/gi, '') : null;

  if (!cleanTax) {
    return { success: true, annualFeePaid: false, userFound: false, requiresFee: true };
  }

  let targetAcademicYear = params.academicYear;
  if (!targetAcademicYear) {
    const { data: profile } = await supabase
      .from('school_profiles')
      .select('academic_year')
      .order('is_default', { ascending: false })
      .limit(1)
      .maybeSingle();
    targetAcademicYear = profile?.academic_year || getCurrentAcademicYear().academicYear;
  }

  // 1. Check active annual memberships by Codice Fiscale
  const { data: mem } = await supabase
    .from('annual_memberships')
    .select('id')
    .ilike('tax_code', cleanTax)
    .eq('academic_year', targetAcademicYear)
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

  // 3. Check if fee is reserved in an existing booking by Student's Codice Fiscale
  const { data: pendingBooking } = await supabase
    .from('bookings')
    .select('id')
    .ilike('student_tax_code', cleanTax)
    .gt('registration_fee', 0)
    .limit(1)
    .maybeSingle();

  if (pendingBooking) {
    return { success: true, annualFeePaid: true, userFound: true, feeReservedInBooking: true, requiresFee: false };
  }

  return { success: true, annualFeePaid: false, userFound: false, requiresFee: true };
}
