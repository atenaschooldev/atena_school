export const LESSON_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
  NO_SHOW: "no_show",
} as const;

export const LESSON_LOCATION_TYPE = {
  IN_PERSON: "in_person",
  ONLINE: "online",
} as const;

export const DEFAULT_LESSON_DURATION_MINUTES = 60;

// Time slots available for flexible individual lesson scheduling
export const FLEXIBLE_LESSON_TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30"
] as const;

// Aliases for backwards compatibility
export const LOCATION_TYPE = LESSON_LOCATION_TYPE;
export const TIME_SLOTS = FLEXIBLE_LESSON_TIME_SLOTS;
