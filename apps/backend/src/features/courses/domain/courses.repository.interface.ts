import { CourseEntity } from './course.entity';

export abstract class CoursesRepository {
  abstract findMany(): Promise<CourseEntity[]>;
  abstract findOne(id: string): Promise<CourseEntity | null>;
  abstract create(data: {
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
  }): Promise<CourseEntity>;
  abstract update(id: string, data: Partial<CourseEntity>): Promise<CourseEntity>;
  abstract delete(id: string): Promise<void>;
}
