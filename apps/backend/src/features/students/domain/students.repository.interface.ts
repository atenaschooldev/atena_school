import { StudentEntity } from './student.entity';

export abstract class StudentsRepository {
  abstract findMany(): Promise<StudentEntity[]>;
  abstract findOne(id: string): Promise<StudentEntity | null>;
  abstract create(data: {
    studentId: string;
    languageLevel?: string;
    status?: string;
    registrationDate?: Date;
    contractId?: string;
  }): Promise<StudentEntity>;
  abstract update(id: string, data: Partial<StudentEntity>): Promise<StudentEntity>;
  abstract delete(id: string): Promise<void>;
}
