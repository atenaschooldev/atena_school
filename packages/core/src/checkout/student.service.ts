import type { SupabaseClient } from '@supabase/supabase-js';
import {
  StudentStatus,
  LanguageLevel,
  MembershipStatus,
  BookingPaymentStatus,
  parseBookingPaymentStatus,
  parsePaymentMethod,
  ACADEMIC_YEAR,
} from '@atena/api-types';
import { CreateReservationParams } from '../types';
import { generateNextMembershipNumber } from '../memberships/number-generator';

export async function processStudentAndBookingLinks(params: {
  dto: CreateReservationParams;
  bookingId: string;
  feeStatus: { annualFeePaid: boolean };
  regFee: number;
  purchaserName: string;
  studentName: string;
  supabase: SupabaseClient;
}): Promise<{ studentId: string | null; linkedUserId: string | null }> {
  const { dto, bookingId, feeStatus, regFee, purchaserName, studentName, supabase } = params;

  const purchaserEmail = dto.email;
  let linkedUserId: string | null = null;

  if (purchaserEmail) {
    try {
      const { data: pUser } = await supabase
        .from('users')
        .select('id')
        .ilike('email', purchaserEmail)
        .maybeSingle();
      if (pUser?.id) linkedUserId = pUser.id;
    } catch {}
  }

  if (linkedUserId) {
    await supabase.from('bookings').update({ user_id: linkedUserId }).eq('id', bookingId);
    if (purchaserName || dto.phone) {
      await supabase
        .from('users')
        .update({
          full_name: purchaserName || undefined,
          phone: dto.phone || undefined,
        })
        .eq('id', linkedUserId);
    }
  }

  const sEmail = dto.isForChild ? (dto.studentEmail || null) : (dto.email || null);
  const sName = (studentName || purchaserName || 'Studente').trim();
  const sTaxCode = dto.isForChild ? (dto.studentTaxCode || null) : (dto.purchaserTaxCode || null);
  const sNameParts = sName.split(' ');
  const sFirstName = sNameParts[0] || 'Studente';
  const sLastName = sNameParts.slice(1).join(' ') || '';

  let studentId: string | null = null;

  if (sEmail || sTaxCode) {
    try {
      let existingStudent: { id: string } | null = null;
      if (sTaxCode) {
        const { data } = await supabase
          .from('students')
          .select('id')
          .ilike('tax_code', sTaxCode)
          .maybeSingle();
        if (data?.id) existingStudent = data;
      }
      // For child bookings, do NOT lookup by parent email (only by dedicated studentEmail if provided)
      if (!existingStudent && sEmail) {
        const { data } = await supabase
          .from('students')
          .select('id')
          .ilike('email', sEmail)
          .maybeSingle();
        if (data?.id) existingStudent = data;
      }

      let studentAuthUserId: string | null = null;
      if (sEmail) {
        try {
          const { data: sUser } = await supabase
            .from('users')
            .select('id')
            .ilike('email', sEmail)
            .maybeSingle();
          if (sUser?.id) studentAuthUserId = sUser.id;
        } catch {}
      }

      const isPaid = parseBookingPaymentStatus(dto.paymentStatus) === BookingPaymentStatus.PAID;
      const hasPaidMembership = feeStatus.annualFeePaid || (regFee > 0 && isPaid);

      if (!existingStudent) {
        const { data: newStudent } = await supabase
          .from('students')
          .insert({
            full_name: sName || 'Studente',
            first_name: sFirstName,
            last_name: sLastName,
            email: sEmail,
            phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
            tax_code: sTaxCode || null,
            birth_date: dto.studentBirthDate || null,
            parent_id: linkedUserId || null,
            student_user_id: studentAuthUserId || null,
            language_level: LanguageLevel.A1,
            registration_date: new Date().toISOString().split('T')[0],
            status: hasPaidMembership ? StudentStatus.ACTIVE : StudentStatus.INACTIVE,
            annual_fee_paid: hasPaidMembership,
            annual_fee_paid_at: hasPaidMembership ? new Date().toISOString() : null,
          })
          .select('id')
          .single();

        studentId = newStudent?.id || null;
      } else {
        studentId = existingStudent.id;
        await supabase
          .from('students')
          .update({
            full_name: sName || undefined,
            first_name: sFirstName || undefined,
            last_name: sLastName || undefined,
            phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
            tax_code: sTaxCode || undefined,
            birth_date: dto.studentBirthDate || undefined,
            parent_id: linkedUserId || undefined,
            student_user_id: studentAuthUserId || undefined,
            status: hasPaidMembership ? StudentStatus.ACTIVE : undefined,
            annual_fee_paid: hasPaidMembership ? true : undefined,
            annual_fee_paid_at: hasPaidMembership ? new Date().toISOString() : undefined,
          })
          .eq('id', existingStudent.id);
      }

      if (studentId) {
        await supabase.from('bookings').update({ student_id: studentId }).eq('id', bookingId);
      }

      if (hasPaidMembership) {
        let existingMem: { id: string; membership_number?: string | null } | null = null;
        if (sTaxCode) {
          const { data: mData } = await supabase
            .from('annual_memberships')
            .select('id, membership_number')
            .ilike('tax_code', sTaxCode)
            .eq('academic_year', ACADEMIC_YEAR.CURRENT)
            .maybeSingle();
          if (mData) existingMem = mData;
        } else if (studentId) {
          const { data: mData } = await supabase
            .from('annual_memberships')
            .select('id, membership_number')
            .eq('student_id', studentId)
            .eq('academic_year', ACADEMIC_YEAR.CURRENT)
            .maybeSingle();
          if (mData) existingMem = mData;
        }

        const pMethod = typeof dto.paymentMethod === 'number' ? dto.paymentMethod : parsePaymentMethod(dto.paymentMethod) || 1;
        const nextMembershipNumber = await generateNextMembershipNumber(supabase, ACADEMIC_YEAR.CURRENT);

        if (existingMem) {
          await supabase
            .from('annual_memberships')
            .update({
              status: MembershipStatus.ACTIVE,
              membership_number: existingMem.membership_number || nextMembershipNumber,
              paid_at: new Date().toISOString(),
              student_id: studentId || undefined,
              user_id: linkedUserId || studentAuthUserId || undefined,
              tax_code: sTaxCode || undefined,
              payment_method: pMethod,
            })
            .eq('id', existingMem.id);
        } else if (sTaxCode) {
          await supabase.from('annual_memberships').upsert(
            {
              tax_code: sTaxCode,
              academic_year: ACADEMIC_YEAR.CURRENT,
              status: MembershipStatus.ACTIVE,
              membership_number: nextMembershipNumber,
              student_id: studentId || null,
              user_id: linkedUserId || studentAuthUserId || null,
              amount: 30.00,
              payment_method: pMethod,
              paid_at: new Date().toISOString(),
              expires_at: ACADEMIC_YEAR.EXPIRY_DATE,
            },
            { onConflict: 'tax_code,academic_year' }
          );
        }
      }
    } catch (sErr) {
      console.warn('Student resolution error in checkout service:', sErr);
    }
  }

  return { studentId, linkedUserId };
}
