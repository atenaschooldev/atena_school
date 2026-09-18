/**
 * ============================================================================
 * ATENA SCHOOL — ACADEMIC / ATTENDANCE RECORDS DOMAIN
 * ============================================================================
 * @module @atena/api-types/academic/attendance
 * @description
 * Реестр и статистика посещаемости уроков (attendance_records table).
 * Позволяет отмечать присутствие конкретного студента на конкретном уроке
 * с фиксацией автора отметки (учитель/секретарь), даты и заметок.
 * ============================================================================
 */

import { LessonAttendance } from './lessons';

/**
 * Запись журнала посещаемости студента на уроке
 */
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
