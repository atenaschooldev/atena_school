export interface AttendanceRecord {
  id: string;
  status: "present" | "absent" | "excused" | "late";
  marked_at: string;
  marked_by?: string;
  notes?: string;
}

export interface LessonAttendanceItem {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  payment_status: string;
  location_type?: string;
  teacher_id?: string;
  teacher_name: string;
  booking_id?: string;
  course_name: string;
  student_name: string;
  student_email?: string;
  student_phone?: string;
  purchaser_name?: string;
  billing_scheme: string;
  booking_payment_status: string;
  attendance_record: AttendanceRecord | null;
}

export interface BookingAttendanceStats {
  total_records: number;
  present_count: number;
  absent_count: number;
  excused_count: number;
  attendance_rate: number;
  eligible_for_certificate: boolean;
}
