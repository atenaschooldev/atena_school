import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CourseEntity } from '../domain/course.entity';
import { CoursesRepository } from '../domain/courses.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaCoursesRepository implements CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async getTeachersMap(teacherIds: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!teacherIds.length) return map;

    try {
      const teachers = await this.prisma.teacher.findMany({
        where: { teacherId: { in: teacherIds } },
        select: { teacherId: true, fullName: true },
      });
      for (const t of teachers) {
        if (t.fullName) map.set(t.teacherId, t.fullName);
      }
    } catch {}
    return map;
  }

  async findMany(): Promise<CourseEntity[]> {
    const list = await this.prisma.course.findMany({
      include: { courseTeachers: { include: { teacher: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    const entities = list.map((c) => this.mapToEntity(c));

    const missingTeacherIds = Array.from(
      new Set(
        entities
          .filter((e) => e.teacherId && !e.teacherName)
          .map((e) => e.teacherId!),
      ),
    );

    if (missingTeacherIds.length > 0) {
      const teachersMap = await this.getTeachersMap(missingTeacherIds);
      for (const entity of entities) {
        if (entity.teacherId && !entity.teacherName) {
          entity.teacherName = teachersMap.get(entity.teacherId) || null;
        }
      }
    }

    return entities;
  }

  async findOne(id: string): Promise<CourseEntity | null> {
    const c = await this.prisma.course.findUnique({
      where: { id },
      include: { courseTeachers: { include: { teacher: true } } },
    });
    if (!c) return null;
    const entity = this.mapToEntity(c);

    if (entity.teacherId && !entity.teacherName) {
      const teachersMap = await this.getTeachersMap([entity.teacherId]);
      entity.teacherName = teachersMap.get(entity.teacherId) || null;
    }

    return entity;
  }

  async create(data: {
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
  }): Promise<CourseEntity> {
    const c = await this.prisma.course.create({
      data: {
        name: data.name,
        category: data.category,
        price: data.price != null ? new Prisma.Decimal(data.price) : null,
        status: data.status || 'active',
        photoUrl: data.photoUrl,
        description: data.description ?? '',
        teacherId: data.teacherId || null,
        lessonsPerWeek: data.lessonsPerWeek,
        sortOrder: data.sortOrder ?? 0,
        scheduleType: data.scheduleType,
        totalLessons: data.totalLessons,
        scheduleDays: data.scheduleDays || [],
        startTime: data.startTime,
        endTime: data.endTime,
        lessonDurationMinutes: data.lessonDurationMinutes,
        totalHours: data.totalHours,
        courseFormat: data.courseFormat,
        slug: data.slug,
      },
    });
    return this.mapToEntity(c);
  }

  async update(id: string, data: Partial<CourseEntity>): Promise<CourseEntity> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.price !== undefined) updateData.price = data.price != null ? new Prisma.Decimal(data.price) : null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
    if (data.lessonsPerWeek !== undefined) updateData.lessonsPerWeek = data.lessonsPerWeek;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.scheduleType !== undefined) updateData.scheduleType = data.scheduleType;
    if (data.totalLessons !== undefined) updateData.totalLessons = data.totalLessons;
    if (data.scheduleDays !== undefined) updateData.scheduleDays = data.scheduleDays || [];
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.lessonDurationMinutes !== undefined) updateData.lessonDurationMinutes = data.lessonDurationMinutes;
    if (data.totalHours !== undefined) updateData.totalHours = data.totalHours;
    if (data.courseFormat !== undefined) updateData.courseFormat = data.courseFormat;
    if (data.slug !== undefined) updateData.slug = data.slug;

    const c = await this.prisma.course.update({ where: { id }, data: updateData });
    return this.mapToEntity(c);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({
      where: { id },
    });
  }

  private mapToEntity(c: any): CourseEntity {
    const teacherName = c.courseTeachers?.[0]?.teacher?.fullName ?? null;
    return {
      id: c.id,
      name: c.name,
      category: c.category,
      price: c.price ? Number(c.price) : null,
      status: c.status,
      photoUrl: c.photoUrl,
      description: c.description,
      teacherId: c.teacherId,
      lessonsPerWeek: c.lessonsPerWeek,
      sortOrder: c.sortOrder,
      scheduleType: c.scheduleType,
      totalLessons: c.totalLessons,
      scheduleDays: c.scheduleDays,
      startTime: c.startTime,
      endTime: c.endTime,
      lessonDurationMinutes: c.lessonDurationMinutes,
      totalHours: c.totalHours,
      courseFormat: c.courseFormat,
      slug: c.slug,
      updatedAt: c.updatedAt,
      teacherName,
    };
  }
}
