import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { TeachersRepository, TeacherEntity } from '../domain/teachers.repository.interface';

function mapTeacher(t: any, lessonCount = 0, courseCount = 0): TeacherEntity {
  const isActive = t.isActive ?? t.is_active ?? true;
  return {
    teacherId: String(t.id),
    fullName: t.fullName,
    photoUrl: t.photoUrl,
    isActive,
    status: isActive ? 'active' : 'inactive',
    experience: t.experience,
    hireDate: t.hireDate,
    birthDate: t.birthDate,
    colorValue: t.colorValue !== null && t.colorValue !== undefined ? Number(t.colorValue) : null,
    contractId: t.contractId,
    createdAt: t.createdAt,
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

    const lessonMap = new Map(lessonCounts.map((l) => [String(l.teacherId), l._count.id]));
    const courseMap = new Map(courseCounts.map((c) => [String(c.teacher_id), Number(c.cnt)]));

    return teachers.map((t) =>
      mapTeacher(t, lessonMap.get(String(t.id)) ?? 0, courseMap.get(String(t.id)) ?? 0),
    );
  }

  async findById(id: string): Promise<TeacherEntity | null> {
    const parsedId = isNaN(Number(id)) ? 0n : BigInt(id);
    const t = await this.prisma.teacher.findUnique({ where: { id: parsedId } });
    if (!t) return null;
    return mapTeacher(t);
  }

  async create(data: { fullName: string; isActive?: boolean; status?: string; experience?: string; photoUrl?: string }): Promise<TeacherEntity> {
    const isActive = data.isActive !== undefined ? data.isActive : data.status !== 'inactive';
    const t = await this.prisma.teacher.create({
      data: {
        fullName: data.fullName,
        isActive,
        experience: data.experience || null,
        photoUrl: data.photoUrl || null,
      },
    });
    return mapTeacher(t, 0, 0);
  }

  async update(
    id: string,
    data: Partial<Pick<TeacherEntity, 'fullName' | 'isActive' | 'status' | 'photoUrl' | 'experience'>>,
  ): Promise<TeacherEntity> {
    const parsedId = isNaN(Number(id)) ? 0n : BigInt(id);
    const isActive = data.isActive !== undefined ? data.isActive : (data.status !== undefined ? data.status !== 'inactive' : undefined);
    const t = await this.prisma.teacher.update({
      where: { id: parsedId },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(isActive !== undefined && { isActive }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
        ...(data.experience !== undefined && { experience: data.experience }),
      },
    });
    const lessonCount = await this.prisma.lesson.count({ where: { teacherId: parsedId } });
    const courseCount = await this.prisma.courseTeacher.count({ where: { teacherId: parsedId } });

    return mapTeacher(t, lessonCount, courseCount);
  }

  async delete(id: string): Promise<void> {
    const parsedId = isNaN(Number(id)) ? 0n : BigInt(id);
    await this.prisma.courseTeacher.deleteMany({ where: { teacherId: parsedId } });
    await this.prisma.teacher.delete({ where: { id: parsedId } });
  }
}

