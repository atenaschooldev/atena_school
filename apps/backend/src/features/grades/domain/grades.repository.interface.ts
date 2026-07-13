import { GradeEntity, SkillGradeEntity } from './grade.entity';

export abstract class GradesRepository {
  abstract findStudentGrades(studentId: string): Promise<GradeEntity[]>;
  abstract createGrade(data: {
    studentId: string;
    courseId: string;
    teacherId: string;
    score: number;
    note?: string | null;
    date?: Date;
  }): Promise<GradeEntity>;
  
  abstract findStudentSkillGrades(studentId: string): Promise<SkillGradeEntity[]>;
  abstract createSkillGrade(data: {
    studentId: string;
    courseId: string;
    teacherId: string;
    period: string;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    overallComment?: string | null;
    date?: Date;
  }): Promise<SkillGradeEntity>;
}
