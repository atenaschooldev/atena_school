import { LessonAttendance } from './lessons';

export interface AttendanceRecord {
  id: string;
  created_at: string;
  updated_at: string;
  lesson_id: string;
  student_id?: string | null;
  booking_id?: string | null;
  status: LessonAttendance;
  marked_by?: string | null;
  marked_at: string;
  notes?: string | null;
}
