export interface ActiveServiceItem {
  booking_id: string;
  student_id: string | null;
  user_id: string | null;
  student_name: string;
  student_email: string | null;
  student_phone: string | null;
  student_tax_code: string | null;
  student_birth_date: string | null;
  student_annual_fee_paid: boolean;
  student_annual_fee_paid_at: string | null;
  purchaser_name: string | null;
  purchaser_email: string | null;
  purchaser_phone: string | null;
  purchaser_tax_code: string | null;
  course_id: string | null;
  course_name: string;
  course_category: string | null;
  course_format: string | null;
  course_schedule_type: string | null;
  billing_scheme: number | null; // 1=FULL, 2=SUBSCRIPTION, 3=INSTALLMENTS
  payment_status: number | null; // 1=UNPAID, 2=RESERVED, 3=PAID, 4=REFUNDED, 5=PARTIALLY_PAID
  booking_status: number | null;
  scheduling_status: number | null;
  payment_method: number | null;
  amount_paid: number | null;
  registration_fee: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: number | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  cancel_at_period_end: boolean | null;
  start_date: string | null;
  start_time: string | null;
  end_time: string | null;
  schedule_days: number[] | null;
  total_lessons_count: number | null;
  completed_lessons_count: number;
  scheduled_lessons_count: number;
  remaining_lessons_count: number;
  next_lesson_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActiveServicesStats {
  totalActive: number;
  activeSubscriptions: number;
  totalCompletedLessons: number;
  totalRemainingLessons: number;
  unpaidAnnualFeeCount: number;
}
