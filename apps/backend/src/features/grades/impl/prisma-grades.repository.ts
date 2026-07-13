import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { GradeEntity, SkillGradeEntity } from '../domain/grade.entity';
import { GradesRepository } from '../domain/grades.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaGradesRepository implements GradesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStudentGrades(studentId: string): Promise<GradeEntity[]> {
    const list = await this.prisma.grade.findMany({
      where: { studentId },
    });

    const grades: GradeEntity[] = [];
    for (const g of list) {
      if (this.isSkillGradeNote(g.note)) {
        continue;
      }
      grades.push({
        id: g.id,
        studentId: g.studentId,
        courseId: g.courseId,
        teacherId: g.teacherId,
        score: Number(g.score),
        date: g.date,
        note: g.note,
      });
    }

    return grades;
  }

  async createGrade(data: {
    studentId: string;
    courseId: string;
    teacherId: string;
    score: number;
    note?: string | null;
    date?: Date;
  }): Promise<GradeEntity> {
    const g = await this.prisma.grade.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        teacherId: data.teacherId,
        score: new Prisma.Decimal(data.score),
        note: data.note || null,
        date: data.date || new Date(),
      },
    });

    return {
      id: g.id,
      studentId: g.studentId,
      courseId: g.courseId,
      teacherId: g.teacherId,
      score: Number(g.score),
      date: g.date,
      note: g.note,
    };
  }

  async findStudentSkillGrades(studentId: string): Promise<SkillGradeEntity[]> {
    const list = await this.prisma.grade.findMany({
      where: { studentId },
    });

    const skillGrades: SkillGradeEntity[] = [];
    for (const g of list) {
      if (this.isSkillGradeNote(g.note)) {
        try {
          const parsed = JSON.parse(g.note!);
          skillGrades.push({
            id: g.id,
            studentId: g.studentId,
            courseId: g.courseId,
            teacherId: g.teacherId,
            period: parsed.period,
            speaking: parsed.speaking,
            listening: parsed.listening,
            reading: parsed.reading,
            writing: parsed.writing,
            overallComment: parsed.overallComment || null,
            date: g.date,
          });
        } catch {
          // Игнорируем ошибки парсинга
        }
      }
    }

    return skillGrades;
  }

  async createSkillGrade(data: {
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
  }): Promise<SkillGradeEntity> {
    const averageScore = (data.speaking + data.listening + data.reading + data.writing) / 4;
    const noteObj = {
      period: data.period,
      speaking: data.speaking,
      listening: data.listening,
      reading: data.reading,
      writing: data.writing,
      overallComment: data.overallComment || null,
    };

    const g = await this.prisma.grade.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        teacherId: data.teacherId,
        score: new Prisma.Decimal(averageScore),
        note: JSON.stringify(noteObj),
        date: data.date || new Date(),
      },
    });

    return {
      id: g.id,
      studentId: g.studentId,
      courseId: g.courseId,
      teacherId: g.teacherId,
      period: data.period,
      speaking: data.speaking,
      listening: data.listening,
      reading: data.reading,
      writing: data.writing,
      overallComment: data.overallComment || null,
      date: g.date,
    };
  }

  private isSkillGradeNote(note: string | null): boolean {
    if (!note) return false;
    const trimmed = note.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed.includes('"speaking"') && trimmed.includes('"listening"');
    }
    return false;
  }
}
