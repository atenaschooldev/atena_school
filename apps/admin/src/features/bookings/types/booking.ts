import {
  BookingPaymentStatus,
  BookingStatus,
  BookingSchedulingStatus,
  PaymentMethod,
  BillingScheme,
} from '@atena/api-types';

export interface BookingOrder {
  id: string;
  course_id?: string | null;
  course_name: string;
  purchaser_name: string;
  purchaser_email: string;
  purchaser_phone?: string | null;
  purchaser_tax_code?: string | null;
  student_name: string;
  student_email?: string | null;
  student_phone?: string | null;
  student_tax_code?: string | null;
  student_birth_date?: string | null;
  student_birth_place?: string | null;
  birth_place?: string | null;
  is_for_child?: boolean;
  amount_paid: number;
  registration_fee: number;
  discount_amount?: number | null;
  promo_code?: string | null;
  promo_code_id?: string | null;
  payment_status: BookingPaymentStatus | number | string;
  payment_status_id?: number;
  payment_method?: PaymentMethod | number | string;
  payment_method_id?: number;
  billing_scheme?: BillingScheme | number | string;
  scheduling_status: BookingSchedulingStatus | number | string;
  scheduling_status_id?: number;
  booking_status?: BookingStatus | number;
  schedule_days?: number[] | null;
  start_time?: string | null;
  end_time?: string | null;
  start_date?: string | null;
  sdi_code?: string | null;
  pec_email?: string | null;
  notes?: string | null;
  total_lessons_count?: number | null;
  subscription_starts_at?: string | null;
  subscription_ends_at?: string | null;
  group_id?: string | null;
  group?: {
    id: string;
    name: string;
    room?: string | null;
    schedule_days?: number[];
    start_time?: string | null;
    end_time?: string | null;
  } | null;
  created_at: string;
}

export type Booking = BookingOrder;
