import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './domain/courses.repository.interface';
import { CourseEntity } from './domain/course.entity';
import { PrismaService } from '../../core/prisma/prisma.service';
import { slugify } from '@atena/utils';
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
import { revalidateLanding } from '../../core/utils/revalidate-landing';

export interface CourseResponseDto {
  id: string;
  name: string;
  title: string;
  category: CourseCategory | number | string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  settingsId?: string | null;
  price: number | null;
  status: CourseStatus | number | null;
  photoUrl: string | null;
  description: string | null;
  teacherId: string | null;
  teacherName: string | null;
  lessonsPerWeek: number | null;
  sortOrder: number | null;
  scheduleType: CourseScheduleType | number | null;
  totalLessons: number | null;
  scheduleDays: string[] | null;
  startTime: string | null;
  endTime: string | null;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: CourseFormat | number | null;
  slug: string | null;
  updatedAt: Date | null;
  deliveryMode?: number | null;
  settings?: any;
  teachers?: Array<{
    teacherId: string;
    fullName: string;
    role: number;
    isPrimary: boolean;
  }>;
  courseTeachers?: any[];
}

const DAY_MAP: Record<number, string> = {
  1: "Lunedì",
  2: "Martedì",
  3: "Mercoledì",
  4: "Giovedì",
  5: "Venerdì",
  6: "Sabato",
  7: "Domenica"
};

const REV_DAY_MAP: Record<string, number> = {
  "lunedì": 1, "lunedi": 1, "lun": 1, "mon": 1, "monday": 1, "1": 1,
  "martedì": 2, "martedi": 2, "mar": 2, "tue": 2, "tuesday": 2, "2": 2,
  "mercoledì": 3, "mercoledi": 3, "mer": 3, "wed": 3, "wednesday": 3, "3": 3,
  "giovedì": 4, "giovedi": 4, "gio": 4, "thu": 4, "thursday": 4, "4": 4,
  "venerdì": 5, "venerdi": 5, "ven": 5, "fri": 5, "friday": 5, "5": 5,
  "sabato": 6, "sab": 6, "sat": 6, "saturday": 6, "6": 6,
  "domenica": 7, "dom": 7, "sun": 7, "sunday": 7, "7": 7,
};

function mapDaysToFrontend(days?: number[] | null): string[] {
  if (!days || !Array.isArray(days)) return [];
  return days.map(d => DAY_MAP[d] || String(d));
}

function mapDaysToDb(days: any[]): number[] {
  if (!Array.isArray(days)) return [];
  return days.map(d => {
    if (typeof d === 'number') return d;
    const str = String(d).toLowerCase().trim();
    return REV_DAY_MAP[str] || parseInt(str, 10) || 0;
  }).filter(d => !!d);
}

function toBigInt(val: any): bigint | undefined {
  if (val === null || val === undefined || val === '') return undefined;
  try {
    return BigInt(val);
  } catch {
    return undefined;
  }
}

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly prisma: PrismaService,
  ) {}

  private toDto(c: CourseEntity): CourseResponseDto {
    let computedTotalLessons = c.totalLessons ?? null;
    if (!computedTotalLessons) {
      if (c.lessonsPerWeek && c.lessonsPerWeek > 0) {
        computedTotalLessons = c.lessonsPerWeek * 4;
      } else if (c.totalHours && c.lessonDurationMinutes && c.lessonDurationMinutes > 0) {
        computedTotalLessons = Math.round((c.totalHours * 60) / c.lessonDurationMinutes);
      }
    }

    const teachers = Array.isArray(c.courseTeachers)
      ? c.courseTeachers.map((ct) => ({
          teacherId: ct.teacher_id || ct.teacherId,
          fullName: ct.teacher?.full_name || ct.teacher?.fullName || '',
          role: ct.role ?? 1,
          isPrimary: !!ct.is_primary || !!ct.isPrimary,
        }))
      : [];

    return {
      id: c.id,
      name: c.name,
      title: c.name,
      category: c.category ?? null,
      categoryId: c.categoryId ?? null,
      categorySlug: c.categorySlug ?? null,
      categoryName: c.categoryName ?? null,
      price: c.price ?? null,
      status: c.status != null ? (typeof c.status === 'number' ? c.status : parseCourseStatus(c.status)) : CourseStatus.ACTIVE,
      photoUrl: c.photoUrl ?? null,
      description: c.description ?? null,
      teacherId: c.teacherId ?? null,
      teacherName: c.teacherName ?? null,
      lessonsPerWeek: c.lessonsPerWeek ?? null,
      sortOrder: c.sortOrder ?? null,
      scheduleType: c.scheduleType != null ? (typeof c.scheduleType === 'number' ? c.scheduleType : parseCourseScheduleType(c.scheduleType)) : CourseScheduleType.FIXED,
      totalLessons: computedTotalLessons,
      scheduleDays: c.scheduleDays ? mapDaysToFrontend(c.scheduleDays) : null,
      startTime: c.startTime ?? null,
      endTime: c.endTime ?? null,
      lessonDurationMinutes: c.lessonDurationMinutes ?? null,
      totalHours: c.totalHours ?? null,
      courseFormat: c.courseFormat != null ? (typeof c.courseFormat === 'number' ? c.courseFormat : parseCourseFormat(c.courseFormat)) : CourseFormat.GROUP,
      slug: c.slug ?? null,
      updatedAt: c.updatedAt ?? null,
      settingsId: c.settingsId ?? c.settings?.id ?? null,
      deliveryMode: c.deliveryMode ?? c.settings?.delivery_mode ?? null,
      settings: c.settings ?? null,
      teachers,
      courseTeachers: c.courseTeachers,
    };
  }

  async getAllSettings(): Promise<any[]> {
    const list = await this.prisma.courseSettings.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return list.map((s) => ({
      id: s.id.toString(),
      name: s.name,
      deliveryMode: s.deliveryMode,
      delivery_mode: s.deliveryMode,
      lessonDurationMinutes: s.lessonDurationMinutes,
      lesson_duration_minutes: s.lessonDurationMinutes,
      lessonsPerWeek: s.lessonsPerWeek,
      lessons_per_week: s.lessonsPerWeek,
      totalLessons: s.totalLessons,
      total_lessons: s.totalLessons,
      totalHours: s.totalHours ? Number(s.totalHours) : null,
      total_hours: s.totalHours ? Number(s.totalHours) : null,
      coursesCount: s._count?.courses ?? 0,
      courses_count: s._count?.courses ?? 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  async listCourses(params?: { category?: string; status?: string | number; search?: string }): Promise<CourseResponseDto[]> {
    let list = await this.coursesRepository.findMany();

    if (params?.category) {
      const targetCat = parseCourseCategory(params.category);
      list = list.filter((c) => {
        if (c.categoryId === params.category || c.categorySlug === params.category) return true;
        const cat = c.category != null ? parseCourseCategory(c.category) : null;
        return cat === targetCat;
      });
    }
    if (params?.status !== undefined && params?.status !== null && params?.status !== '') {
      const targetStatus = parseCourseStatus(params.status);
      list = list.filter((c) => {
        const s = c.status != null ? (typeof c.status === 'number' ? c.status : parseCourseStatus(c.status)) : CourseStatus.ACTIVE;
        return s === targetStatus;
      });
    }
    if (params?.search) {
      const s = params.search.toLowerCase().trim();
      list = list.filter(
        (c) => (c.name || '').toLowerCase().includes(s) || (c.description || '').toLowerCase().includes(s),
      );
    }

    return list.map((c) => this.toDto(c));
  }

  async getCourse(id: string): Promise<CourseResponseDto> {
    const c = await this.coursesRepository.findOne(id);
    if (!c || Number(c.status) === CourseStatus.ARCHIVED) {
      throw new NotFoundException('Курс не найден');
    }
    return this.toDto(c);
  }

  async createCourse(dto: any): Promise<CourseResponseDto> {
    const teacherId: string | null = dto.teacherId ?? dto.teacher_id ?? null;
    const courseName = dto.title ?? dto.name ?? 'Nuovo Corso';
    const autoSlug = dto.slug || slugify(courseName);

    const rawStatus = dto.status ?? dto.stato;
    const rawSchedule = dto.scheduleType ?? dto.schedule_type;
    const rawFormat = dto.courseFormat ?? dto.course_format;
    const rawCategory = dto.category ?? dto.categoria;
    const categoryId: string | null = dto.categoryId ?? dto.category_id ?? null;
    let settingsId: string | null = dto.settingsId ?? dto.settings_id ?? null;

    const deliveryMode = dto.deliveryMode ?? dto.delivery_mode ?? (
      Number(rawFormat) === CourseFormat.CERTIFICATION || Number(rawFormat) === 4 ? 4 :
      Number(rawSchedule) === CourseScheduleType.FLEXIBLE || Number(rawSchedule) === 2 ? 2 : 1
    );

    const c = await this.coursesRepository.create({
      name: courseName,
      category: rawCategory != null ? parseCourseCategory(rawCategory) : CourseCategory.LANGUAGES,
      categoryId,
      settingsId,
      price: (dto.price != null ? Number(dto.price) : (dto.prezzo != null ? Number(dto.prezzo) : null)),
      status: rawStatus != null ? parseCourseStatus(rawStatus) : CourseStatus.ACTIVE,
      teacherId,
      description: dto.description ?? dto.descrizione ?? null,
      photoUrl: dto.photoUrl ?? dto.photo_url ?? dto.foto ?? null,
      lessonsPerWeek: dto.lessonsPerWeek != null ? Number(dto.lessonsPerWeek) : (dto.lessons_per_week != null ? Number(dto.lessons_per_week) : null),
      sortOrder: dto.sortOrder != null ? Number(dto.sortOrder) : (dto.sort_order != null ? Number(dto.sort_order) : null),
      scheduleType: rawSchedule != null ? parseCourseScheduleType(rawSchedule) : (deliveryMode === 2 ? CourseScheduleType.FLEXIBLE : CourseScheduleType.FIXED),
      totalLessons: dto.totalLessons != null ? Number(dto.totalLessons) : (dto.total_lessons != null ? Number(dto.total_lessons) : null),
      scheduleDays: dto.scheduleDays ? mapDaysToDb(dto.scheduleDays) : (dto.schedule_days ? mapDaysToDb(dto.schedule_days) : []),
      startTime: dto.startTime ?? dto.start_time ?? null,
      endTime: dto.endTime ?? dto.end_time ?? null,
      lessonDurationMinutes: dto.lessonDurationMinutes != null ? Number(dto.lessonDurationMinutes) : (dto.lesson_duration_minutes != null ? Number(dto.lesson_duration_minutes) : null),
      totalHours: dto.totalHours != null ? Number(dto.totalHours) : (dto.total_hours != null ? Number(dto.total_hours) : null),
      courseFormat: rawFormat != null ? parseCourseFormat(rawFormat) : (deliveryMode === 4 ? CourseFormat.CERTIFICATION : (deliveryMode === 2 ? CourseFormat.INDIVIDUAL : CourseFormat.GROUP)),
      slug: autoSlug,
    });

    // Multi-teacher sync to course_teachers pivot table
    const teachersList = dto.teachers ?? dto.courseTeachers ?? dto.course_teachers;
    const bigCourseId = BigInt(c.id);
    if (Array.isArray(teachersList) && teachersList.length > 0) {
      for (const t of teachersList) {
        const tId = t.teacherId ?? t.teacher_id;
        if (!tId) continue;
        const role = t.role != null ? Number(t.role) : (t.isPrimary || t.is_primary ? 1 : 2);
        const isPrimary = !!(t.isPrimary || t.is_primary);
        try {
          const bigTeacherId = BigInt(tId);
          await this.prisma.$executeRaw`
            INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
            VALUES (${bigCourseId}, ${bigTeacherId}, ${role}, ${isPrimary})
            ON CONFLICT (course_id, teacher_id) DO UPDATE SET role = ${role}, is_primary = ${isPrimary}
          `;
        } catch {}
      }
    } else if (teacherId) {
      try {
        const bigTeacherId = BigInt(teacherId);
        await this.prisma.$executeRaw`
          INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
          VALUES (${bigCourseId}, ${bigTeacherId}, 1, true)
          ON CONFLICT (course_id, teacher_id) DO UPDATE SET is_primary = true, role = 1
        `;
      } catch {}
    }

    const fresh = await this.coursesRepository.findOne(c.id);
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return this.toDto(fresh ?? c);
  }

  async updateCourse(id: string, dto: any): Promise<CourseResponseDto> {
    const existing = await this.coursesRepository.findOne(id);
    const updateData: Partial<CourseEntity> = {};
    if (dto.title !== undefined) updateData.name = dto.title;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.nome !== undefined) updateData.name = dto.nome;
    if (dto.category !== undefined) updateData.category = parseCourseCategory(dto.category);
    if (dto.categoria !== undefined) updateData.category = parseCourseCategory(dto.categoria);
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.category_id !== undefined) updateData.categoryId = dto.category_id;
    if (dto.settingsId !== undefined) updateData.settingsId = dto.settingsId;
    if (dto.settings_id !== undefined) updateData.settingsId = dto.settings_id;
    if (dto.price !== undefined) updateData.price = dto.price != null ? Number(dto.price) : null;
    if (dto.prezzo !== undefined) updateData.price = dto.prezzo != null ? Number(dto.prezzo) : null;
    if (dto.status !== undefined) updateData.status = parseCourseStatus(dto.status);
    if (dto.stato !== undefined) updateData.status = parseCourseStatus(dto.stato);
    if (dto.teacherId !== undefined) updateData.teacherId = dto.teacherId;
    if (dto.teacher_id !== undefined) updateData.teacherId = dto.teacher_id;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.descrizione !== undefined) updateData.description = dto.descrizione;
    if (dto.photoUrl !== undefined) updateData.photoUrl = dto.photoUrl;
    if (dto.photo_url !== undefined) updateData.photoUrl = dto.photo_url;
    if (dto.foto !== undefined) updateData.photoUrl = dto.foto;
    if (dto.lessonsPerWeek !== undefined) updateData.lessonsPerWeek = dto.lessonsPerWeek != null ? Number(dto.lessonsPerWeek) : null;
    if (dto.lessons_per_week !== undefined) updateData.lessonsPerWeek = dto.lessons_per_week != null ? Number(dto.lessons_per_week) : null;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder != null ? Number(dto.sortOrder) : null;
    if (dto.sort_order !== undefined) updateData.sortOrder = dto.sort_order != null ? Number(dto.sort_order) : null;
    if (dto.scheduleType !== undefined) updateData.scheduleType = parseCourseScheduleType(dto.scheduleType);
    if (dto.schedule_type !== undefined) updateData.scheduleType = parseCourseScheduleType(dto.schedule_type);
    if (dto.totalLessons !== undefined) updateData.totalLessons = dto.totalLessons != null ? Number(dto.totalLessons) : null;
    if (dto.total_lessons !== undefined) updateData.totalLessons = dto.total_lessons != null ? Number(dto.total_lessons) : null;
    if (dto.scheduleDays !== undefined) updateData.scheduleDays = mapDaysToDb(dto.scheduleDays);
    if (dto.schedule_days !== undefined) updateData.scheduleDays = mapDaysToDb(dto.schedule_days);
    if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
    if (dto.start_time !== undefined) updateData.startTime = dto.start_time;
    if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
    if (dto.end_time !== undefined) updateData.endTime = dto.end_time;
    if (dto.lessonDurationMinutes !== undefined) updateData.lessonDurationMinutes = dto.lessonDurationMinutes != null ? Number(dto.lessonDurationMinutes) : null;
    if (dto.lesson_duration_minutes !== undefined) updateData.lessonDurationMinutes = dto.lesson_duration_minutes != null ? Number(dto.lesson_duration_minutes) : null;
    if (dto.totalHours !== undefined) updateData.totalHours = dto.totalHours != null ? Number(dto.totalHours) : null;
    if (dto.total_hours !== undefined) updateData.totalHours = dto.total_hours != null ? Number(dto.total_hours) : null;
    if (dto.courseFormat !== undefined) updateData.courseFormat = parseCourseFormat(dto.courseFormat);
    if (dto.course_format !== undefined) updateData.courseFormat = parseCourseFormat(dto.course_format);
    if (dto.slug !== undefined) updateData.slug = dto.slug;

    const teachersList = dto.teachers ?? dto.courseTeachers ?? dto.course_teachers;
    if (Array.isArray(teachersList)) {
      const primaryItem = teachersList.find((t: any) => t.isPrimary || t.is_primary || Number(t.role) === 1);
      if (primaryItem) {
        updateData.teacherId = primaryItem.teacherId ?? primaryItem.teacher_id ?? null;
      }
    }

    const deliveryMode = dto.deliveryMode ?? dto.delivery_mode ?? (
      Number(updateData.courseFormat ?? dto.courseFormat ?? existing?.courseFormat) === CourseFormat.CERTIFICATION || Number(updateData.courseFormat ?? dto.courseFormat ?? existing?.courseFormat) === 4 ? 4 :
      Number(updateData.scheduleType ?? dto.scheduleType ?? existing?.scheduleType) === CourseScheduleType.FLEXIBLE || Number(updateData.scheduleType ?? dto.scheduleType ?? existing?.scheduleType) === 2 ? 2 : 1
    );
    updateData.deliveryMode = Number(deliveryMode);

    const c = await this.coursesRepository.update(id, updateData);
    const bigCourseId = BigInt(c.id);

    // Sync course_teachers pivot table
    if (Array.isArray(teachersList)) {
      await this.prisma.$executeRaw`DELETE FROM course_teachers WHERE course_id = ${bigCourseId}`;
      for (const t of teachersList) {
        const tId = t.teacherId ?? t.teacher_id;
        if (!tId) continue;
        const role = t.role != null ? Number(t.role) : (t.isPrimary || t.is_primary ? 1 : 2);
        const isPrimary = !!(t.isPrimary || t.is_primary);
        const bigTeacherId = BigInt(tId);
        await this.prisma.$executeRaw`
          INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
          VALUES (${bigCourseId}, ${bigTeacherId}, ${role}, ${isPrimary})
          ON CONFLICT (course_id, teacher_id) DO UPDATE SET role = ${role}, is_primary = ${isPrimary}
        `;
      }
    } else if (dto.teacherId !== undefined || dto.teacher_id !== undefined) {
      const newTeacherId: string | null = dto.teacherId ?? dto.teacher_id ?? null;
      await this.prisma.$executeRaw`DELETE FROM course_teachers WHERE course_id = ${bigCourseId} AND is_primary = true`;
      if (newTeacherId) {
        const bigTeacherId = BigInt(newTeacherId);
        await this.prisma.$executeRaw`
          INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
          VALUES (${bigCourseId}, ${bigTeacherId}, 1, true)
          ON CONFLICT (course_id, teacher_id) DO UPDATE SET is_primary = true, role = 1
        `;
      }
    }

    const fresh = await this.coursesRepository.findOne(c.id);
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return this.toDto(fresh ?? c);
  }

  async deleteCourse(id: string) {
    await this.coursesRepository.delete(id);
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return { success: true };
  }

  async listCategories() {
    try {
      const categoriesAll = await this.prisma.courseCategory.findMany();
      for (const cat of categoriesAll) {
        const catNum = parseCourseCategory(cat.slug);
        await this.prisma.$executeRaw`
          UPDATE courses 
          SET category_id = ${cat.id} 
          WHERE category_id IS NULL AND (category = ${catNum} OR slug ILIKE ${'%' + cat.slug + '%'})
        `;
      }
    } catch {}

    const categories = await this.prisma.courseCategory.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return categories.map((c) => ({
      id: c.id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      sort_order: c.sortOrder,
      isActive: c.isActive,
      is_active: c.isActive,
      coursesCount: c._count?.courses ?? 0,
      courses_count: c._count?.courses ?? 0,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async createCategory(dto: any) {
    const slug = dto.slug || slugify(dto.name || 'categoria');
    const sortOrder = dto.sortOrder != null ? Number(dto.sortOrder) : (dto.sort_order != null ? Number(dto.sort_order) : 0);
    const isActive = dto.isActive !== undefined ? !!dto.isActive : (dto.is_active !== undefined ? !!dto.is_active : true);
    const created = await this.prisma.courseCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description || null,
        sortOrder,
        isActive,
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return {
      id: created.id.toString(),
      name: created.name,
      slug: created.slug,
      description: created.description,
      sortOrder: created.sortOrder,
      sort_order: created.sortOrder,
      isActive: created.isActive,
      is_active: created.isActive,
      coursesCount: created._count?.courses ?? 0,
      courses_count: created._count?.courses ?? 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateCategory(id: string, dto: any) {
    const bigId = toBigInt(id);
    if (bigId === undefined) throw new Error('Invalid Category ID');

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.slug !== undefined) updateData.slug = dto.slug;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sortOrder !== undefined || dto.sort_order !== undefined) {
      updateData.sortOrder = Number(dto.sortOrder ?? dto.sort_order);
    }
    if (dto.isActive !== undefined || dto.is_active !== undefined) {
      updateData.isActive = dto.isActive !== undefined ? !!dto.isActive : !!dto.is_active;
    }

    const updated = await this.prisma.courseCategory.update({
      where: { id: bigId },
      data: updateData,
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return {
      id: updated.id.toString(),
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      sortOrder: updated.sortOrder,
      sort_order: updated.sortOrder,
      isActive: updated.isActive,
      is_active: updated.isActive,
      coursesCount: updated._count?.courses ?? 0,
      courses_count: updated._count?.courses ?? 0,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteCategory(id: string) {
    const bigId = toBigInt(id);
    if (bigId !== undefined) {
      await this.prisma.course.updateMany({
        where: { categoryId: bigId },
        data: { categoryId: null },
      });
      await this.prisma.courseCategory.delete({
        where: { id: bigId },
      });
    }
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return { success: true };
  }

  async createSettings(dto: any) {
    const deliveryMode = dto.deliveryMode ?? dto.delivery_mode ?? 1;

    const created = await this.prisma.courseSettings.create({
      data: {
        name: dto.name || 'Configurazione Corso',
        deliveryMode: Number(deliveryMode),
        lessonDurationMinutes: dto.lessonDurationMinutes != null ? Number(dto.lessonDurationMinutes) : (dto.lesson_duration_minutes != null ? Number(dto.lesson_duration_minutes) : null),
        lessonsPerWeek: dto.lessonsPerWeek != null ? Number(dto.lessonsPerWeek) : (dto.lessons_per_week != null ? Number(dto.lessons_per_week) : null),
        totalLessons: dto.totalLessons != null ? Number(dto.totalLessons) : (dto.total_lessons != null ? Number(dto.total_lessons) : null),
        totalHours: dto.totalHours != null ? Number(dto.totalHours) : (dto.total_hours != null ? Number(dto.total_hours) : null),
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
    return {
      id: created.id.toString(),
      name: created.name,
      deliveryMode: created.deliveryMode,
      delivery_mode: created.deliveryMode,
      lessonDurationMinutes: created.lessonDurationMinutes,
      lesson_duration_minutes: created.lessonDurationMinutes,
      lessonsPerWeek: created.lessonsPerWeek,
      lessons_per_week: created.lessonsPerWeek,
      totalLessons: created.totalLessons,
      total_lessons: created.totalLessons,
      totalHours: created.totalHours ? Number(created.totalHours) : null,
      total_hours: created.totalHours ? Number(created.totalHours) : null,
      coursesCount: created._count?.courses ?? 0,
      courses_count: created._count?.courses ?? 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  async updateSettings(id: string, dto: any) {
    const bigId = toBigInt(id);
    if (bigId === undefined) throw new Error('Invalid Settings ID');

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.deliveryMode !== undefined || dto.delivery_mode !== undefined) {
      updateData.deliveryMode = Number(dto.deliveryMode ?? dto.delivery_mode);
    }
    if (dto.lessonDurationMinutes !== undefined || dto.lesson_duration_minutes !== undefined) {
      const val = dto.lessonDurationMinutes ?? dto.lesson_duration_minutes;
      updateData.lessonDurationMinutes = val != null ? Number(val) : null;
    }
    if (dto.lessonsPerWeek !== undefined || dto.lessons_per_week !== undefined) {
      const val = dto.lessonsPerWeek ?? dto.lessons_per_week;
      updateData.lessonsPerWeek = val != null ? Number(val) : null;
    }
    if (dto.totalLessons !== undefined || dto.total_lessons !== undefined) {
      const val = dto.totalLessons ?? dto.total_lessons;
      updateData.totalLessons = val != null ? Number(val) : null;
    }
    if (dto.totalHours !== undefined || dto.total_hours !== undefined) {
      const val = dto.totalHours ?? dto.total_hours;
      updateData.totalHours = val != null ? Number(val) : null;
    }

    const updated = await this.prisma.courseSettings.update({
      where: { id: bigId },
      data: updateData,
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return {
      id: updated.id.toString(),
      name: updated.name,
      deliveryMode: updated.deliveryMode,
      delivery_mode: updated.deliveryMode,
      lessonDurationMinutes: updated.lessonDurationMinutes,
      lesson_duration_minutes: updated.lessonDurationMinutes,
      lessonsPerWeek: updated.lessonsPerWeek,
      lessons_per_week: updated.lessonsPerWeek,
      totalLessons: updated.totalLessons,
      total_lessons: updated.totalLessons,
      totalHours: updated.totalHours ? Number(updated.totalHours) : null,
      total_hours: updated.totalHours ? Number(updated.totalHours) : null,
      coursesCount: updated._count?.courses ?? 0,
      courses_count: updated._count?.courses ?? 0,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  async deleteSettings(id: string) {
    const bigId = toBigInt(id);
    if (bigId !== undefined) {
      await this.prisma.course.updateMany({
        where: { settingsId: bigId },
        data: { settingsId: null },
      });
      await this.prisma.courseSettings.delete({
        where: { id: bigId },
      });
    }
    revalidateLanding({ tag: 'courses' }).catch(() => {});
    return { success: true };
  }

  async listTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
    return teachers.map((t) => ({
      teacherId: t.id.toString(),
      fullName: t.fullName ?? '',
    }));
  }
}
