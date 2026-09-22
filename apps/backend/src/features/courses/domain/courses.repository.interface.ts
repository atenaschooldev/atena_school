import { CourseEntity } from './course.entity';
import { CourseStatus, CourseScheduleType, CourseFormat, CourseCategory } from '@atena/api-types';

export abstract class CoursesRepository {
  abstract findMany(): Promise<CourseEntity[]>;
  abstract findOne(id: string): Promise<CourseEntity | null>;
  abstract create(data: {
    name: string;
    category?: CourseCategory | number | string | null;
    price?: number | null;
    status?: CourseStatus | number | string | null;
    photoUrl?: string | null;
    description?: string | null;
    teacherId?: string | null;
    lessonsPerWeek?: number | null;
    sortOrder?: number | null;
    scheduleType?: CourseScheduleType | number | string | null;
    totalLessons?: number | null;
    scheduleDays?: number[] | null;
    startTime?: string | null;
    endTime?: string | null;
    lessonDurationMinutes?: number | null;
    totalHours?: number | null;
    courseFormat?: CourseFormat | number | string | null;
    slug?: string | null;
    categoryId?: string | null;
    settingsId?: string | null;
  }): Promise<CourseEntity>;
  abstract update(id: string, data: Partial<CourseEntity>): Promise<CourseEntity>;
  abstract delete(id: string): Promise<void>;
}
