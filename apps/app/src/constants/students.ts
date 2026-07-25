export const STUDENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PAUSED: "paused",
  GRADUATED: "graduated",
} as const;

export const STUDENT_LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const MINIMUM_ATTENDANCE_PERCENT_FOR_EXAM = 80;

export const CAMBRIDGE_EXAM_SIMULATIONS_COUNT = 6;

// Aliases for backwards compatibility
export const LANGUAGE_LEVELS = STUDENT_LANGUAGE_LEVELS;
export const MINIMUM_ATTENDANCE_PERCENT = MINIMUM_ATTENDANCE_PERCENT_FOR_EXAM;
