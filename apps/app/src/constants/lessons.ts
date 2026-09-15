// Re-export lesson enums from @atena/api-types as the single source of truth
export {
  LessonStatus,
  LessonAttendance,
  LessonLocationType,
} from '@atena/api-types';

// Keep legacy string constants for backward compatibility in non-critical display code
// These are NOT sent to the API — use LessonStatus/LessonAttendance/LessonLocationType for that
export const LESSON_STATUS_LEGACY = {
  SCHEDULED:   'scheduled',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
  RESCHEDULED: 'rescheduled',
} as const;

export const FLEXIBLE_LESSON_TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
] as const;

export const DEFAULT_LESSON_TIME_SLOTS = FLEXIBLE_LESSON_TIME_SLOTS;
