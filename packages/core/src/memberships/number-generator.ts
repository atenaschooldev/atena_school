import type { SupabaseClient } from '@supabase/supabase-js';
import { ACADEMIC_YEAR } from '@atena/api-types';

/**
 * Generates the next sequential membership number for a given academic year.
 * Format: ATN-YYYY-XXXX (e.g. ATN-2026-0001)
 */
export async function generateNextMembershipNumber(
  supabase: SupabaseClient,
  academicYear: string = ACADEMIC_YEAR.CURRENT
): Promise<string> {
  const { count } = await supabase
    .from('annual_memberships')
    .select('id', { count: 'exact', head: true })
    .eq('academic_year', academicYear)
    .not('membership_number', 'is', null);

  const yearPrefix = academicYear.split('/')[0] || '2026';
  const nextNum = (count || 0) + 1;
  return `ATN-${yearPrefix}-${String(nextNum).padStart(4, '0')}`;
}
