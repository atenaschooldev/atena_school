import { TeacherEntity } from './teacher.entity';

export abstract class TeachersRepository {
  abstract findMany(): Promise<TeacherEntity[]>;
  abstract findOne(id: string): Promise<TeacherEntity | null>;
  abstract create(data: {
    teacherId: string;
    subject?: string;
    experience?: string;
    status?: string;
    hireDate?: Date;
  }): Promise<TeacherEntity>;
  abstract update(id: string, data: Partial<TeacherEntity>): Promise<TeacherEntity>;
  abstract delete(id: string): Promise<void>;
}
