import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CourseEntity } from '../domain/course.entity';
import { CoursesRepository } from '../domain/courses.repository.interface';
import { Prisma } from '@prisma/client';
import {
  CourseStatus,
  CourseScheduleType,
  CourseFormat,
  CourseCategory,
  parseCourseStatus,
  parseCourseScheduleType,
  parseCourseFormat,
  parseCourseCategory,
} from '@atena/api-types';
import { slugify } from '@atena/utils';

const toBigInt = (val: any): bigint | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  try {
    return BigInt(val);
  } catch {
    return undefined;
  }
};

@Injectable()
export class PrismaCoursesRepository implements CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async getTeachersMap(teacherIds: string[]): Promise<Map<string, string>> {
    const map = new Map<string, string>();
    if (!teacherIds.length) return map;

    try {
      const ids = teacherIds.map((id) => toBigInt(id)).filter((id): id is bigint => id !== undefined);
      if (!ids.length) return map;

      const teachers = await this.prisma.teacher.findMany({
        where: { id: { in: ids } },
        select: { id: true, fullName: true },
      });
      for (const t of teachers) {
        if (t.fullName) map.set(t.id.toString(), t.fullName);
      }
    } catch {}
    return map;
  }

  async findMany(): Promise<CourseEntity[]> {
    const list = await this.prisma.course.findMany({
      include: {
        courseCategory: true,
        settings: true,
        courseTeachers: { include: { teacher: true } },
      },
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
    const bigId = toBigInt(id);
    if (bigId === undefined) return null;

    const c = await this.prisma.course.findUnique({
      where: { id: bigId },
      include: {
        courseCategory: true,
        settings: true,
        courseTeachers: { include: { teacher: true } },
      },
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
    category?: CourseCategory | number | string | null;
    categoryId?: string | null;
    price?: number | null;
    status?: CourseStatus | number | string | null;
    photoUrl?: string | null;
    description?: string | null;
    teacherId?: string | null;
    lessonsPerWeek?: number | null;
    sortOrder?: number | null;
    scheduleType?: CourseScheduleType | number | string | null;
    totalLessons?: number | null;
    scheduleDays?: number[] | null;
    startTime?: string | null;
    endTime?: string | null;
    lessonDurationMinutes?: number | null;
    totalHours?: number | null;
    courseFormat?: CourseFormat | number | string | null;
    slug?: string | null;
    settingsId?: string | null;
  }): Promise<CourseEntity> {
    const c = await this.prisma.course.create({
      data: {
        name: data.name,
        category: data.category !== undefined && data.category !== null ? parseCourseCategory(data.category) : CourseCategory.LANGUAGES,
        categoryId: toBigInt(data.categoryId) || null,
        settingsId: toBigInt(data.settingsId) || null,
        price: data.price != null ? new Prisma.Decimal(data.price) : null,
        status: data.status !== undefined && data.status !== null ? parseCourseStatus(data.status) : CourseStatus.ACTIVE,
        photoUrl: data.photoUrl,
        description: data.description ?? '',
        teacherId: toBigInt(data.teacherId) || null,
        sortOrder: data.sortOrder ?? 0,
        slug: data.slug || slugify(data.name || 'course'),
      },
      include: {
        courseCategory: true,
        settings: true,
        courseTeachers: { include: { teacher: true } },
      },
    });
    return this.mapToEntity(c);
  }

  async update(id: string, data: Partial<CourseEntity>): Promise<CourseEntity> {
    const bigId = toBigInt(id);
    if (bigId === undefined) throw new Error('Invalid Course ID');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined && data.category !== null) updateData.category = parseCourseCategory(data.category);
    if (data.categoryId !== undefined) updateData.categoryId = toBigInt(data.categoryId) || null;
    if (data.settingsId !== undefined) updateData.settingsId = toBigInt(data.settingsId) || null;
    if (data.price !== undefined) updateData.price = data.price != null ? new Prisma.Decimal(data.price) : null;
    if (data.status !== undefined && data.status !== null) updateData.status = parseCourseStatus(data.status);
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.teacherId !== undefined) updateData.teacherId = toBigInt(data.teacherId) || null;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.slug !== undefined) updateData.slug = data.slug;

    const c = await this.prisma.course.update({
      where: { id: bigId },
      data: updateData,
      include: {
        courseCategory: true,
        settings: true,
        courseTeachers: { include: { teacher: true } },
      },
    });
    return this.mapToEntity(c);
  }

  async delete(id: string): Promise<void> {
    const bigId = toBigInt(id);
    if (bigId === undefined) return;
    await this.prisma.course.delete({
      where: { id: bigId },
    });
  }

  private mapToEntity(c: any): CourseEntity {
    const primaryTeacher = c.courseTeachers?.find((ct: any) => ct.isPrimary) || c.courseTeachers?.[0];
    const teacherName = primaryTeacher?.teacher?.fullName ?? null;
    const teacherId = primaryTeacher?.teacherId ? primaryTeacher.teacherId.toString() : (c.teacherId ? c.teacherId.toString() : null);

    const courseTeachers = Array.isArray(c.courseTeachers)
      ? c.courseTeachers.map((ct: any) => ({
          course_id: ct.courseId ? ct.courseId.toString() : null,
          teacher_id: ct.teacherId ? ct.teacherId.toString() : null,
          role: ct.role,
          is_primary: ct.isPrimary,
          teacher: ct.teacher
            ? {
                teacher_id: ct.teacher.id ? ct.teacher.id.toString() : '',
                full_name: ct.teacher.fullName,
                photo_url: ct.teacher.photoUrl,
              }
            : undefined,
        }))
      : [];

    const settings = c.settings
      ? {
          id: c.settings.id ? c.settings.id.toString() : '',
          name: c.settings.name,
          delivery_mode: c.settings.deliveryMode,
          deliveryMode: c.settings.deliveryMode,
          schedule_days: c.settings.scheduleDays || [],
          scheduleDays: c.settings.scheduleDays || [],
          start_time: c.settings.startTime,
          startTime: c.settings.startTime,
          end_time: c.settings.endTime,
          endTime: c.settings.endTime,
          lesson_duration_minutes: c.settings.lessonDurationMinutes,
          lessonDurationMinutes: c.settings.lessonDurationMinutes,
          lessons_per_week: c.settings.lessonsPerWeek,
          lessonsPerWeek: c.settings.lessonsPerWeek,
          total_lessons: c.settings.totalLessons,
          totalLessons: c.settings.totalLessons,
          total_hours: c.settings.totalHours ? Number(c.settings.totalHours) : null,
          totalHours: c.settings.totalHours ? Number(c.settings.totalHours) : null,
          min_students: c.settings.minStudents,
          minStudents: c.settings.minStudents,
          max_students: c.settings.maxStudents,
          maxStudents: c.settings.maxStudents,
          created_at: c.settings.createdAt?.toISOString(),
          updated_at: c.settings.updatedAt?.toISOString(),
        }
      : null;

    const deliveryMode = settings?.delivery_mode ?? 1;

    return {
      id: c.id ? c.id.toString() : '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      name: c.name,
      slug: c.slug,
      category: c.category,
      categoryId: c.categoryId ? c.categoryId.toString() : null,
      categorySlug: c.courseCategory?.slug ?? null,
      categoryName: c.courseCategory?.name ?? null,
      settingsId: c.settingsId ? c.settingsId.toString() : null,
      price: c.price ? Number(c.price) : null,
      status: c.status,
      photoUrl: c.photoUrl,
      description: c.description,
      teacherId,
      lessonsPerWeek: settings?.lessons_per_week ?? null,
      sortOrder: c.sortOrder,
      scheduleType: deliveryMode === 2 ? CourseScheduleType.FLEXIBLE : CourseScheduleType.FIXED,
      totalLessons: settings?.total_lessons ?? null,
      scheduleDays: settings?.schedule_days ?? [],
      startTime: settings?.start_time ?? null,
      endTime: settings?.end_time ?? null,
      lessonDurationMinutes: settings?.lesson_duration_minutes ?? null,
      totalHours: settings?.total_hours ?? null,
      courseFormat: deliveryMode === 4 ? CourseFormat.CERTIFICATION : (deliveryMode === 2 ? CourseFormat.INDIVIDUAL : CourseFormat.GROUP),
      billingType: c.billingType,
      subscriptionPrice: c.subscriptionPrice ? Number(c.subscriptionPrice) : null,
      stripeMonthlyPriceId: c.stripeMonthlyPriceId,
      deliveryMode,
      settings,
      teacherName,
      courseTeachers,
    };
  }
}
