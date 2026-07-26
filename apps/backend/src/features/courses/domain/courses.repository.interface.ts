import { CourseEntity } from './course.entity';

export abstract class CoursesRepository {
  abstract findMany(): Promise<CourseEntity[]>;
  abstract findOne(id: string): Promise<CourseEntity | null>;
  abstract create(data: {
    name: string;
    category: string;
    duration: string;
    price: number;
    status?: string;
    teacherId?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    level?: string | null;
    capacity?: number;
  }): Promise<CourseEntity>;
  abstract update(id: string, data: Partial<CourseEntity>): Promise<CourseEntity>;
  abstract delete(id: string): Promise<void>;
}
