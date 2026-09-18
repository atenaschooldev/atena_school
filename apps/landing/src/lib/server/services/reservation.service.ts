import { getSupabaseAdmin } from '../supabase-admin';
import {
  createReservationWorkflow,
  generateAndSaveLessons as generateAndSaveLessonsCore,
  recordPaymentLedger as recordPaymentLedgerCore,
  getBookingDetails as getBookingDetailsCore,
  CreateReservationParams,
  SupabaseCourseRow,
} from '@atena/core';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function generateAndSaveLessons(
  bookingId: string,
  course: SupabaseCourseRow | null,
  lessons: Array<{ startsAt: string; endsAt: string }>,
  supabase: SupabaseClient = getSupabaseAdmin(),
  studentId?: string | null
) {
  return generateAndSaveLessonsCore(bookingId, course, lessons, supabase, studentId);
}

export async function recordPaymentLedger(
  bookingId: string,
  coursePrice: number,
  regFee: number,
  paymentMethod: string | number,
  paymentStatus: string | number,
  supabase: SupabaseClient = getSupabaseAdmin(),
  studentId?: string | null
) {
  return recordPaymentLedgerCore(bookingId, coursePrice, regFee, paymentMethod, paymentStatus, supabase, studentId);
}

export async function getBookingDetails(id: string) {
  const supabase = getSupabaseAdmin();
  return getBookingDetailsCore(supabase, id);
}

export async function createReservation(dto: CreateReservationParams) {
  const supabase = getSupabaseAdmin();
  return createReservationWorkflow(supabase, dto);
}
