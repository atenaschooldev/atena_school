export class CourseEntity {
  id: string;
  name: string;
  category?: string | null;
  price?: number | null;
  status?: string | null;
  photoUrl?: string | null;
  description?: string | null;
  teacherId?: string | null;
  lessonsPerWeek?: number | null;
  sortOrder?: number | null;
  scheduleType?: string | null;
  totalLessons?: number | null;
  scheduleDays?: number[] | null;
  startTime?: string | null;
  endTime?: string | null;
  lessonDurationMinutes?: number | null;
  totalHours?: number | null;
  courseFormat?: string | null;
  slug?: string | null;
  updatedAt?: Date | null;

  teacherName?: string | null;
}
