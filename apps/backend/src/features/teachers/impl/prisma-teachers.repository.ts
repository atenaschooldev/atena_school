import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TeachersRepository, TeacherEntity } from '../domain/teachers.repository.interface';

function mapTeacher(t: any, lessonCount = 0, courseCount = 0): TeacherEntity {
  return {
    teacherId: t.teacherId,
    fullName: t.fullName,
    photoUrl: t.photoUrl,
    status: t.status,
    experience: t.experience,
    hireDate: t.hireDate,
    birthDate: t.birthDate,
    colorValue: t.colorValue !== null && t.colorValue !== undefined ? Number(t.colorValue) : null,
    contractId: t.contractId,
    updatedAt: t.updatedAt,
    lessonCount,
    courseCount,
  };
}

@Injectable()
export class PrismaTeachersRepository extends TeachersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAll(): Promise<TeacherEntity[]> {
    const teachers = await this.prisma.teacher.findMany({
      orderBy: { fullName: 'asc' },
    });

    const lessonCounts = await this.prisma.lesson.groupBy({
      by: ['teacherId'],
      _count: { id: true },
      where: { teacherId: { not: null } },
    });

    const courseCounts = await this.prisma.$queryRaw<{ teacher_id: string; cnt: bigint }[]>`
      SELECT teacher_id, COUNT(*) AS cnt FROM courses WHERE teacher_id IS NOT NULL GROUP BY teacher_id
    `;

    const lessonMap = new Map(lessonCounts.map((l) => [l.teacherId, l._count.id]));
    const courseMap = new Map(courseCounts.map((c) => [c.teacher_id, Number(c.cnt)]));

    return teachers.map((t) =>
      mapTeacher(t, lessonMap.get(t.teacherId) ?? 0, courseMap.get(t.teacherId) ?? 0),
    );
  }

  async findById(id: string): Promise<TeacherEntity | null> {
    const t = await this.prisma.teacher.findUnique({ where: { teacherId: id } });
    if (!t) return null;
    return mapTeacher(t);
  }

  async create(data: { fullName: string; status?: string; experience?: string; photoUrl?: string }): Promise<TeacherEntity> {
    const t = await this.prisma.teacher.create({
      data: {
        teacherId: randomUUID(),
        fullName: data.fullName,
        status: data.status || 'active',
        experience: data.experience || null,
        photoUrl: data.photoUrl || null,
      },
    });
    return mapTeacher(t, 0, 0);
  }

  async update(
    id: string,
    data: Partial<Pick<TeacherEntity, 'fullName' | 'status' | 'photoUrl' | 'experience'>>,
  ): Promise<TeacherEntity> {
    const t = await this.prisma.teacher.update({
      where: { teacherId: id },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
        ...(data.experience !== undefined && { experience: data.experience }),
      },
    });
    const lessonCount = await this.prisma.lesson.count({ where: { teacherId: id } });
    const courseCount = await this.prisma.courseTeacher.count({ where: { teacherId: id } });

    return mapTeacher(t, lessonCount, courseCount);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.courseTeacher.deleteMany({ where: { teacherId: id } });
    await this.prisma.teacher.delete({ where: { teacherId: id } });
  }
}
