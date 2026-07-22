export const COURSE_CATEGORY = {
  LANGUAGES: "languages",
  CERTIPASS: "Certipass",
  ACADEMIC: "academic",
} as const;

export const COURSE_STATUS = {
  ACTIVE: "active",
  PUBLISHED: "published",
  DRAFT: "draft",
  ARCHIVED: "archived",
} as const;

export const COURSE_SCHEDULE_TYPE = {
  FIXED: "fixed",
  FLEXIBLE: "flexible",
} as const;

export const COURSE_FORMAT = {
  GROUP: "group",
  PRIVATE: "private",
  CERTIFICATION: "certification",
} as const;
