// Centralized API Types & DTO Interfaces (Single Source of Truth)

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at?: string;
}

export interface CourseItem {
  id: string;
  name: string;
  title_it?: string;
  slug?: string;
  description?: string;
  description_it?: string;
  photo_url?: string;
  image_url?: string;
  price: number | string;
  status: 'active' | 'published' | 'draft' | 'archived';
  category?: string;
  schedule_days?: string[];
  schedule_type?: string;
  lesson_duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  teacher_id?: string;
  teacher_name?: string;
  teachers?: {
    full_name: string;
  };
}

export interface BookingRecord {
  id: string;
  course_id: string;
  course_name: string;
  purchaser_name: string;
  purchaser_email: string;
  purchaser_phone?: string;
  purchaser_tax_code?: string;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  student_tax_code?: string;
  student_birth_date?: string;
  booking_date: string;
  start_date: string;
  schedule_days?: number[];
  start_time?: string;
  end_time?: string;
  schedule_type?: string;
  status: string;
  payment_status: 'paid' | 'reserved' | 'completed' | 'pending' | 'cancelled';
  payment_method: 'stripe' | 'cash' | 'card';
  amount_paid: number;
  registration_fee: number;
  course_price?: number;
  item_price?: number;
  notes?: string;
  created_at?: string;
}

export interface EnrichedBooking extends BookingRecord {
  item_id: string;
  item_type: string;
  item_title: string;
  price: number;
  teacher_name: string;
  location?: string;
  is_future: boolean;
  status: string;
  booking_status?: string;
  slot_starts_at?: string;
}

export interface FeeStatusResponse {
  annualFeePaid: boolean;
  academicYear: string;
  requiresFee: boolean;
  membership?: any;
}

export interface ReservationResponse {
  success: boolean;
  bookingId: string;
  booking: BookingRecord;
}

export interface CheckoutSessionResponse {
  success: boolean;
  url: string;
  bookingId: string;
}

export interface SiteContentResponse {
  success: boolean;
  hero?: any;
  about?: any;
  testimonials?: any[];
  contact?: any;
}
