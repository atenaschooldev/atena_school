import { Injectable } from '@nestjs/common';
import { GradesRepository } from './domain/grades.repository.interface';

@Injectable()
export class GradesService {
  constructor(private readonly gradesRepository: GradesRepository) {}

  async getStudentGrades(studentId: string) {
    const list = await this.gradesRepository.findStudentGrades(studentId);
    return list.map((g) => ({
      grade_id: g.id,
      lesson_id: g.courseId, // Маппим courseId на lesson_id для совместимости
      course_id: g.courseId,
      student_id: g.studentId,
      teacher_id: g.teacherId,
      score: g.score,
      letter: this.calculateLetter(g.score),
      comment: g.note,
      created_at: g.date.toISOString(),
    }));
  }

  async createGrade(dto: any, teacherId: string) {
    const g = await this.gradesRepository.createGrade({
      studentId: dto.student_id || dto.studentId,
      courseId: dto.lesson_id || dto.course_id || dto.courseId,
      teacherId: teacherId,
      score: Number(dto.score),
      note: dto.comment || dto.note || null,
      date: dto.created_at ? new Date(dto.created_at) : new Date(),
    });

    return {
      grade_id: g.id,
      lesson_id: g.courseId,
      course_id: g.courseId,
      student_id: g.studentId,
      teacher_id: g.teacherId,
      score: g.score,
      letter: this.calculateLetter(g.score),
      comment: g.note,
      created_at: g.date.toISOString(),
    };
  }

  async getStudentSkillGrades(studentId: string) {
    const list = await this.gradesRepository.findStudentSkillGrades(studentId);
    return list.map((sg) => ({
      skill_grade_id: sg.id,
      student_id: sg.studentId,
      course_id: sg.courseId,
      teacher_id: sg.teacherId,
      period: sg.period,
      speaking: sg.speaking,
      listening: sg.listening,
      reading: sg.reading,
      writing: sg.writing,
      overall_comment: sg.overallComment,
      created_at: sg.date.toISOString(),
    }));
  }

  async createSkillGrade(dto: any, teacherId: string) {
    const sg = await this.gradesRepository.createSkillGrade({
      studentId: dto.student_id || dto.studentId,
      courseId: dto.course_id || dto.courseId,
      teacherId: teacherId,
      period: dto.period,
      speaking: Number(dto.speaking),
      listening: Number(dto.listening),
      reading: Number(dto.reading),
      writing: Number(dto.writing),
      overallComment: dto.overall_comment || dto.overallComment || null,
      date: dto.created_at ? new Date(dto.created_at) : new Date(),
    });

    return {
      skill_grade_id: sg.id,
      student_id: sg.studentId,
      course_id: sg.courseId,
      teacher_id: sg.teacherId,
      period: sg.period,
      speaking: sg.speaking,
      listening: sg.listening,
      reading: sg.reading,
      writing: sg.writing,
      overall_comment: sg.overallComment,
      created_at: sg.date.toISOString(),
    };
  }

  private calculateLetter(score: number): string {
    if (score >= 9.0) return 'A';
    if (score >= 8.0) return 'B';
    if (score >= 7.0) return 'C';
    if (score >= 6.0) return 'D';
    if (score >= 5.0) return 'E';
    return 'F';
  }
}
