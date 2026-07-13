export class GradeEntity {
  id: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  score: number;
  date: Date;
  note: string | null;
}

export class SkillGradeEntity {
  id: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  period: string;
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
  overallComment: string | null;
  date: Date;
}
