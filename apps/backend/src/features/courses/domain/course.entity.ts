import { CourseStatus, CourseScheduleType, CourseFormat, CourseBillingType, CourseCategory } from '@atena/api-types';

export class CourseEntity {
  id: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  name: string;
  slug?: string | null;
  category?: CourseCategory | number | string | null;
  status?: CourseStatus | number | string | null;
  sortOrder?: number | null;
  photoUrl?: string | null;
  description?: string | null;
  teacherId?: string | null;
  courseFormat?: CourseFormat | number | string | null;
  scheduleType?: CourseScheduleType | number | string | null;
  scheduleDays?: number[] | null;
  startTime?: string | null;
  endTime?: string | null;
  lessonDurationMinutes?: number | null;
  lessonsPerWeek?: number | null;
  totalLessons?: number | null;
  totalHours?: number | null;
  billingType?: CourseBillingType | number | string | null;
  price?: number | null;
  subscriptionPrice?: number | null;
  stripeMonthlyPriceId?: string | null;

  teacherName?: string | null;
}

