import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface ProcessStudentParams {
  dto: any;
  bookingId: string;
  feeStatus: { annualFeePaid: boolean; requiresFee?: boolean };
  regFee: number;
  purchaserName: string;
  studentName: string;
  supabaseAdmin: SupabaseClient;
}

@Injectable()
export class CheckoutCoreService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves purchaser & student profiles, creates or updates student records,
   * and links user_id & student_id to the booking.
   */
  async processStudentAndBookingLinks(params: ProcessStudentParams): Promise<{ studentId: string | null; linkedUserId: string | null }> {
    const { dto, bookingId, feeStatus, regFee, purchaserName, studentName, supabaseAdmin } = params;

    const purchaserEmail = dto.email;
    const purchaserTaxCode = dto.purchaserTaxCode || '';

    // Auto-link User if purchaser email exists in public.users
    let linkedUserId: string | null = null;
    if (purchaserEmail) {
      try {
        const { data: pUser } = await supabaseAdmin
          .from('users')
          .select('id')
          .ilike('email', purchaserEmail)
          .maybeSingle();
        if (pUser?.id) linkedUserId = pUser.id;
      } catch (aErr) {
        console.warn('Public user lookup error:', aErr);
      }
    }

    if (linkedUserId) {
      await supabaseAdmin.from('bookings').update({ user_id: linkedUserId }).eq('id', bookingId);
    }

    const sEmail = dto.isForChild ? (dto.studentEmail || dto.email) : dto.email;
    const sName = studentName || purchaserName || 'Studente';
    const sTaxCode = dto.isForChild ? (dto.studentTaxCode || dto.purchaserTaxCode) : dto.purchaserTaxCode;

    let studentId: string | null = null;

    if (sEmail || sTaxCode) {
      try {
        let existingStudent: { id: string } | null = null;
        if (sTaxCode) {
          const { data } = await supabaseAdmin
            .from('students')
            .select('id')
            .ilike('tax_code', sTaxCode)
            .maybeSingle();
          if (data?.id) existingStudent = data;
        }
        if (!existingStudent && sEmail) {
          const { data } = await supabaseAdmin
            .from('students')
            .select('id')
            .ilike('email', sEmail)
            .maybeSingle();
          if (data?.id) existingStudent = data;
        }

        let studentAuthUserId: string | null = null;
        if (sEmail) {
          try {
            const { data: sUser } = await supabaseAdmin
              .from('users')
              .select('id')
              .ilike('email', sEmail)
              .maybeSingle();
            if (sUser?.id) studentAuthUserId = sUser.id;
          } catch {}
        }

        const isPaid = dto.paymentStatus === 'completed' || dto.paymentStatus === 'paid';
        const hasPaidMembership = feeStatus.annualFeePaid || (regFee > 0 && isPaid);

        if (!existingStudent) {
          const sNameParts = (sName || '').trim().split(' ');
          const { data: newStudent, error: sInsertErr } = await supabaseAdmin
            .from('students')
            .insert({
              full_name: sName || 'Studente',
              first_name: sNameParts[0] || 'Studente',
              last_name: sNameParts.slice(1).join(' ') || '',
              email: sEmail,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
              tax_code: sTaxCode || null,
              birth_date: dto.studentBirthDate || null,
              parent_id: linkedUserId || null,
              student_user_id: studentAuthUserId || null,
              language_level: 'A1',
              registration_date: new Date().toISOString().split('T')[0],
              status: 'active',
              annual_fee_paid: hasPaidMembership,
              annual_fee_paid_at: hasPaidMembership ? new Date().toISOString() : null,
            })
            .select('id')
            .single();

          if (sInsertErr) {
            console.error('Student insert error:', sInsertErr);
            throw new BadRequestException(`Student insert error: ${sInsertErr.message || JSON.stringify(sInsertErr)}`);
          }

          studentId = newStudent?.id || null;
        } else {
          studentId = existingStudent.id;
          await supabaseAdmin
            .from('students')
            .update({
              full_name: sName || undefined,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
              tax_code: sTaxCode || undefined,
              birth_date: dto.studentBirthDate || undefined,
              parent_id: linkedUserId || undefined,
              student_user_id: studentAuthUserId || undefined,
              annual_fee_paid: hasPaidMembership ? true : undefined,
              annual_fee_paid_at: hasPaidMembership ? new Date().toISOString() : undefined,
            })
            .eq('id', existingStudent.id);
        }

        if (studentId) {
          await supabaseAdmin.from('bookings').update({ student_id: studentId }).eq('id', bookingId);
        }

        // Process annual memberships record
        if (hasPaidMembership) {
          let existingMem: { id: string } | null = null;
          if (studentId) {
            const { data: mData } = await supabaseAdmin
              .from('annual_memberships')
              .select('id')
              .eq('student_id', studentId)
              .eq('academic_year', '2026/2027')
              .maybeSingle();
            if (mData) existingMem = mData;
          }

          if (existingMem) {
            await supabaseAdmin
              .from('annual_memberships')
              .update({
                status: 'active',
                paid_at: new Date().toISOString(),
                booking_id: bookingId,
                user_id: linkedUserId || studentAuthUserId || undefined,
                tax_code: sTaxCode || undefined,
                email: sEmail || undefined,
                phone: (dto.isForChild ? dto.studentPhone : dto.phone) || undefined,
              })
              .eq('id', existingMem.id);
          } else {
            const { error: mErr } = await supabaseAdmin.from('annual_memberships').upsert({
              tax_code: sTaxCode || null,
              email: sEmail || null,
              phone: (dto.isForChild ? dto.studentPhone : dto.phone) || null,
              academic_year: '2026/2027',
              status: 'active',
              student_id: studentId || null,
              user_id: linkedUserId || studentAuthUserId || null,
              booking_id: bookingId,
              paid_at: new Date().toISOString(),
              expires_at: '2027-08-31T23:59:59.000Z',
            }, { onConflict: 'booking_id' });

            if (mErr && mErr.code !== '23505') {
              console.error('Membership insert error:', mErr);
              throw new BadRequestException(`Membership insert error: ${mErr.message || JSON.stringify(mErr)}`);
            }
          }
        }
      } catch (sErr: any) {
        console.warn('Auto-create student error in checkout core:', sErr);
        if (sErr instanceof BadRequestException) throw sErr;
      }
    }

    return { studentId, linkedUserId };
  }

  /**
   * Generates and inserts scheduled lessons into the Prisma `Lesson` table.
   */
  async generateAndSaveLessons(bookingId: string, course: any, lessons: Array<{ startsAt: string; endsAt: string }>) {
    if (!lessons || lessons.length === 0) return;

    try {
      const teacherId = (course as any)?.teacher_id || (course as any)?.teacherId || 'e1180b01-2222-4000-8000-000000000002';
      const lessonRows = lessons.map((l) => ({
        bookingId: bookingId,
        teacherId: teacherId,
        startsAt: new Date(l.startsAt),
        endsAt: new Date(l.endsAt),
        status: 'scheduled',
      }));

      await this.prisma.lesson.createMany({ data: lessonRows });
    } catch (lErr) {
      console.warn('Auto-create lessons error in checkout core:', lErr);
    }
  }

  /**
   * Generates payments accounting ledger entries.
   */
  async recordPaymentLedger(bookingId: string, coursePrice: number, regFee: number, paymentMethod: string, paymentStatus: string) {
    try {
      const pStatus = (paymentStatus === 'completed' || paymentStatus === 'paid') ? 'succeeded' : 'pending';
      const pMethod = paymentMethod || 'cash';
      const provider = (pMethod === 'stripe' || pMethod === 'card_online') ? 'stripe' : 'manual';

      if (coursePrice > 0) {
        await this.prisma.payment.create({
          data: {
            bookingId: bookingId,
            amount: coursePrice,
            currency: 'eur',
            status: pStatus,
            type: 'payment',
            paymentMethod: pMethod,
            provider: provider,
          },
        });
      }

      if (regFee > 0) {
        await this.prisma.payment.create({
          data: {
            bookingId: bookingId,
            amount: regFee,
            currency: 'eur',
            status: pStatus,
            type: 'registration_fee',
            paymentMethod: pMethod,
            provider: provider,
          },
        });
      }
    } catch (pErr) {
      console.warn('Payment accounting ledger insert error in checkout core:', pErr);
    }
  }
}
