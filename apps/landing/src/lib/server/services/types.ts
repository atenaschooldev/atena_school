import {
  BookingPaymentStatus,
  PaymentMethod,
} from '@atena/api-types';

export interface StudentInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  taxCode: string;
  birthDate?: string;
}

export interface CreateReservationParams {
  itemId: string;
  itemType?: string;
  date?: string;
  time?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  purchaserTaxCode?: string;
  students?: StudentInfo[];
  isForChild?: boolean;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  studentTaxCode?: string;
  studentBirthDate?: string;
  includeRegistrationFee?: boolean;
  notes?: string;
  sdiCode?: string;
  pecEmail?: string;
  needsCompanyInvoice?: boolean;
  paymentMethod?: PaymentMethod | string | number;
  paymentStatus?: BookingPaymentStatus | string | number;
}

export interface VerifyPaymentParams {
  sessionId?: string;
  bookingId?: string;
}

export interface ContactFormParams {
  nome?: string;
  cognome?: string;
  name?: string;
  email: string;
  phone?: string;
  telefono?: string;
  message?: string;
  messaggio?: string;
  interest?: string;
  interesse?: string | null;
  courseInterest?: string;
}

export interface SupabaseCourseRow {
  id: string;
  name?: string;
  title_it?: string;
  price?: number | string | null;
  status?: string | null;
  photo_url?: string | null;
  description?: string | null;
  teacher_id?: string | null;
  lessons_per_week?: number | null;
  sort_order?: number | null;
  schedule_type?: string | null;
  total_lessons?: number | null;
  schedule_days?: number[] | null;
  start_time?: string | null;
  end_time?: string | null;
  lesson_duration_minutes?: number | null;
  total_hours?: number | null;
  course_format?: string | null;
  category?: string | null;
  slug?: string | null;
  updated_at?: string | null;
}

export interface SupabasePaymentRow {
  id?: string;
  booking_id?: string | null;
  user_id?: string | null;
  student_id?: string | null;
  amount: number;
  currency: number;
  payment_method: number;
  type: number;
  status: number;
  provider: number;
  provider_transaction_id?: string | null;
  notes?: string | null;
  created_at?: string;
}

export interface SupabaseBookingRow {
  id: string;
  course_id?: string | null;
  course_name?: string | null;
  purchaser_name?: string | null;
  purchaser_email?: string | null;
  student_name?: string | null;
  student_email?: string | null;
  student_tax_code?: string | null;
  amount_paid?: number | null;
  registration_fee?: number | null;
  payment_status?: number | null;
  payment_method?: number | null;
  start_date?: string | null;
  schedule_days?: number[] | null;
  start_time?: string | null;
  notes?: string | null;
  created_at?: string;
}
