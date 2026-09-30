import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  processStudentAndBookingLinks as processStudentAndBookingLinksCore,
  generateAndSaveLessons as generateAndSaveLessonsCore,
  recordPaymentLedger as recordPaymentLedgerCore,
  CreateReservationParams,
  SupabaseCourseRow,
} from '@atena/core';
import { PaymentMethod, BookingPaymentStatus } from '@atena/api-types';

export interface ProcessStudentParams {
  dto: CreateReservationParams;
  bookingId: string;
  feeStatus: { annualFeePaid: boolean; requiresFee?: boolean };
  regFee: number;
  purchaserName: string;
  studentName: string;
  supabaseAdmin: SupabaseClient;
}

/**
 * Thin delegate service ensuring NestJS uses @atena/core as Single Source of Truth
 */
@Injectable()
export class CheckoutCoreService {
  async processStudentAndBookingLinks(params: ProcessStudentParams) {
    return processStudentAndBookingLinksCore({
      dto: params.dto,
      bookingId: params.bookingId,
      feeStatus: params.feeStatus,
      regFee: params.regFee,
      purchaserName: params.purchaserName,
      studentName: params.studentName,
      supabase: params.supabaseAdmin,
    });
  }

  async generateAndSaveLessons(
    bookingId: string,
    course: SupabaseCourseRow | null,
    lessons: Array<{ startsAt: string; endsAt: string }>,
    supabase: SupabaseClient,
    studentId?: string | null,
    startDateStr?: string | null,
    timeStr?: string | null,
    explicitGroupId?: string | null
  ) {
    return generateAndSaveLessonsCore(bookingId, course, lessons, supabase, studentId, startDateStr, timeStr, explicitGroupId);
  }

  async recordPaymentLedger(
    bookingId: string,
    coursePrice: number,
    regFee: number,
    paymentMethod?: string | number,
    paymentStatus?: string | number,
    supabase?: SupabaseClient,
    studentId?: string | null,
    studentTaxCode?: string | null,
    userId?: string | null
  ) {
    if (supabase) {
      return recordPaymentLedgerCore(
        bookingId,
        coursePrice,
        regFee,
        paymentMethod ?? PaymentMethod.CASH,
        paymentStatus ?? BookingPaymentStatus.RESERVED,
        supabase,
        studentId,
        studentTaxCode,
        userId
      );
    }
  }
}

