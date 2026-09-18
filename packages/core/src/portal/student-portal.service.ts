import type { SupabaseClient } from '@supabase/supabase-js';

export interface GetStudentActiveServicesParams {
  userId?: string | null;
  studentId?: string | null;
  email?: string | null;
  taxCode?: string | null;
}

export async function getStudentActiveServices(
  supabase: SupabaseClient,
  params: GetStudentActiveServicesParams
) {
  let query = supabase.from('active_services').select('*');

  if (params.studentId) {
    query = query.eq('student_id', params.studentId);
  } else if (params.userId) {
    query = query.eq('user_id', params.userId);
  } else if (params.taxCode) {
    const cleanTax = params.taxCode.trim().toUpperCase();
    query = query.or(`student_tax_code.ilike.${cleanTax},purchaser_tax_code.ilike.${cleanTax}`);
  } else if (params.email) {
    const cleanEmail = params.email.trim().toLowerCase();
    query = query.or(`student_email.ilike.${cleanEmail},purchaser_email.ilike.${cleanEmail}`);
  } else {
    return { success: true, activeServices: [] };
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch active services: ${error.message}`);
  }

  return { success: true, activeServices: data || [] };
}

export async function getStudentBookings(
  supabase: SupabaseClient,
  params: GetStudentActiveServicesParams
) {
  let query = supabase.from('bookings').select('*, courses(*)').order('created_at', { ascending: false });

  if (params.studentId) {
    query = query.eq('student_id', params.studentId);
  } else if (params.userId) {
    query = query.eq('user_id', params.userId);
  } else if (params.taxCode) {
    const cleanTax = params.taxCode.trim().toUpperCase();
    query = query.or(`student_tax_code.ilike.${cleanTax},purchaser_tax_code.ilike.${cleanTax}`);
  } else if (params.email) {
    const cleanEmail = params.email.trim().toLowerCase();
    query = query.or(`student_email.ilike.${cleanEmail},purchaser_email.ilike.${cleanEmail}`);
  } else {
    return { success: true, bookings: [] };
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }

  return { success: true, bookings: data || [] };
}
