export const LESSON_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
} as const;

export const LESSON_LOCATION_TYPE = {
  IN_PERSON: "in_person",
  ONLINE: "online",
  HYBRID: "hybrid",
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  EXCUSED: "excused",
  LATE: "late",
} as const;

export const SCHEDULE_LESSON_TYPE = {
  GROUP: "group",
  PRIVATE: "private",
  CERTIFICATION: "certification",
  TRIAL: "trial",
} as const;

export const FLEXIBLE_LESSON_TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
] as const;

export const DEFAULT_LESSON_TIME_SLOTS = FLEXIBLE_LESSON_TIME_SLOTS;
