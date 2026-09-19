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

export interface LinkUserAccountParams {
  userId: string;
  email: string;
  metadata?: Record<string, any>;
}

export async function linkUserAccountWorkflow(
  supabaseAdmin: SupabaseClient,
  params: LinkUserAccountParams
): Promise<{
  success: boolean;
  linkedBookings: number;
  linkedStudents: number;
  linkedMemberships: number;
  linkedPayments: number;
}> {
  const cleanEmail = (params.email || '').trim().toLowerCase();
  if (!cleanEmail || !params.userId) {
    return { success: false, linkedBookings: 0, linkedStudents: 0, linkedMemberships: 0, linkedPayments: 0 };
  }

  const userId = params.userId;

  // 1. Fetch matching bookings
  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('id, student_id, student_email, purchaser_email, student_tax_code, purchaser_tax_code, student_name, purchaser_name, student_phone, purchaser_phone, user_id')
    .or(`purchaser_email.ilike.${cleanEmail},student_email.ilike.${cleanEmail}`);

  const bookingList = bookings || [];
  const bookingIds = bookingList.map((b) => b.id);
  const studentIds = bookingList.map((b) => b.student_id).filter(Boolean) as string[];
  const taxCodes = Array.from(
    new Set(
      bookingList
        .flatMap((b) => [b.student_tax_code, b.purchaser_tax_code])
        .filter(Boolean)
        .map((t) => t.trim().toUpperCase())
    )
  );

  const isParent = bookingList.some(
    (b) => b.purchaser_email?.trim().toLowerCase() === cleanEmail && b.student_email?.trim().toLowerCase() !== cleanEmail
  );

  // 2. Ensure public.users row exists
  const meta = params.metadata || {};
  const bookingPurchaser = bookingList.find((b) => b.purchaser_email?.trim().toLowerCase() === cleanEmail);
  const bookingStudent = bookingList.find((b) => b.student_email?.trim().toLowerCase() === cleanEmail);

  const officialFullName =
    (isParent ? bookingPurchaser?.purchaser_name : (bookingStudent?.student_name || bookingPurchaser?.purchaser_name)) ||
    bookingPurchaser?.purchaser_name ||
    bookingStudent?.student_name ||
    meta.full_name ||
    meta.name ||
    cleanEmail.split('@')[0];

  const officialPhone =
    (isParent ? bookingPurchaser?.purchaser_phone : (bookingStudent?.student_phone || bookingPurchaser?.purchaser_phone)) ||
    bookingPurchaser?.purchaser_phone ||
    bookingStudent?.student_phone ||
    meta.phone ||
    null;

  await supabaseAdmin
    .from('users')
    .upsert(
      {
        id: userId,
        email: cleanEmail,
        full_name: officialFullName,
        role: isParent ? 4 : 1,
        phone: officialPhone,
        is_active: true,
      },
      { onConflict: 'id' }
    );

  // 3. Link bookings
  let linkedBookings = 0;
  if (bookingIds.length > 0) {
    const { data: updB } = await supabaseAdmin
      .from('bookings')
      .update({ user_id: userId })
      .in('id', bookingIds)
      .is('user_id', null)
      .select('id');
    linkedBookings = updB?.length || 0;
  }

  // 4. Link students
  let linkedStudents = 0;
  // Link by email (student_user_id)
  const { data: updS1 } = await supabaseAdmin
    .from('students')
    .update({ student_user_id: userId })
    .ilike('email', cleanEmail)
    .is('student_user_id', null)
    .select('id');
  linkedStudents += updS1?.length || 0;

  // Link child students where user is purchaser
  const childStudentIds = bookingList
    .filter((b) => b.purchaser_email?.trim().toLowerCase() === cleanEmail && b.student_email?.trim().toLowerCase() !== cleanEmail)
    .map((b) => b.student_id)
    .filter(Boolean) as string[];

  if (childStudentIds.length > 0) {
    const { data: updS2 } = await supabaseAdmin
      .from('students')
      .update({ parent_id: userId })
      .in('id', childStudentIds)
      .is('parent_id', null)
      .select('id');
    linkedStudents += updS2?.length || 0;
  }

  // 5. Link annual_memberships
  let linkedMemberships = 0;
  const { data: userStudents } = await supabaseAdmin
    .from('students')
    .select('id, tax_code')
    .or(`student_user_id.eq.${userId},parent_id.eq.${userId},email.ilike.${cleanEmail}`);

  const allStudentIds = Array.from(
    new Set([...studentIds, ...(userStudents || []).map((s) => s.id)])
  );
  const allTaxCodes = Array.from(
    new Set([
      ...taxCodes,
      ...(userStudents || []).map((s) => s.tax_code).filter(Boolean).map((t) => t.trim().toUpperCase()),
    ])
  );

  if (allStudentIds.length > 0) {
    const { data: updM1 } = await supabaseAdmin
      .from('annual_memberships')
      .update({ user_id: userId })
      .in('student_id', allStudentIds)
      .is('user_id', null)
      .select('id');
    linkedMemberships += updM1?.length || 0;
  }

  for (const tc of allTaxCodes) {
    const { data: updM2 } = await supabaseAdmin
      .from('annual_memberships')
      .update({ user_id: userId })
      .ilike('tax_code', tc)
      .is('user_id', null)
      .select('id');
    linkedMemberships += updM2?.length || 0;
  }

  // 6. Link payments
  let linkedPayments = 0;
  if (bookingIds.length > 0 || allStudentIds.length > 0) {
    const orFilter: string[] = [];
    if (bookingIds.length > 0) orFilter.push(`booking_id.in.(${bookingIds.join(',')})`);
    if (allStudentIds.length > 0) orFilter.push(`student_id.in.(${allStudentIds.join(',')})`);

    const { data: updP } = await supabaseAdmin
      .from('payments')
      .update({ user_id: userId })
      .or(orFilter.join(','))
      .is('user_id', null)
      .select('id');
    linkedPayments = updP?.length || 0;
  }

  return {
    success: true,
    linkedBookings,
    linkedStudents,
    linkedMemberships,
    linkedPayments,
  };
}

