import { CourseStatus, CourseScheduleType, CourseFormat } from '@atena/api-types';

export { CourseStatus, CourseScheduleType, CourseFormat };

export const COURSE_CATEGORY = {
  LANGUAGES: "languages",
  CERTIPASS: "Certipass",
  ACADEMIC: "academic",
} as const;

export const COURSE_STATUS = {
  ACTIVE: CourseStatus.ACTIVE,
  PUBLISHED: CourseStatus.ACTIVE,
  DRAFT: CourseStatus.DRAFT,
  ARCHIVED: CourseStatus.ARCHIVED,
} as const;

export const COURSE_SCHEDULE_TYPE = {
  FIXED: CourseScheduleType.FIXED,
  FLEXIBLE: CourseScheduleType.FLEXIBLE,
} as const;

export const COURSE_FORMAT = {
  GROUP: CourseFormat.GROUP,
  PRIVATE: CourseFormat.INDIVIDUAL,
  ONLINE: CourseFormat.ONLINE,
  CERTIFICATION: CourseFormat.CERTIFICATION,
} as const;
