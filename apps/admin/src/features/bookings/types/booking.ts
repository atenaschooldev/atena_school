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
  is_for_child?: boolean;
  amount_paid: number;
  registration_fee: number;
  payment_status: 'paid' | 'reserved' | 'pending_payment' | 'partially_paid' | 'overdue' | string;
  payment_method?: 'stripe' | 'cash' | 'card' | string;
  billing_scheme?: 'full' | string;
  scheduling_status: 'scheduled' | 'pending_coordination' | 'confirmed';
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
  created_at: string;
}

export type Booking = BookingOrder;
