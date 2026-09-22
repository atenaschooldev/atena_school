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
      orderBy: { name: 'asc' },
    });
    return list.map((s) => ({
      id: s.id,
      name: s.name,
      deliveryMode: s.deliveryMode,
      delivery_mode: s.deliveryMode,
      scheduleDays: s.scheduleDays,
      schedule_days: s.scheduleDays,
      startTime: s.startTime,
      start_time: s.startTime,
      endTime: s.endTime,
      end_time: s.endTime,
      lessonDurationMinutes: s.lessonDurationMinutes,
      lesson_duration_minutes: s.lessonDurationMinutes,
      lessonsPerWeek: s.lessonsPerWeek,
      lessons_per_week: s.lessonsPerWeek,
      totalLessons: s.totalLessons,
      total_lessons: s.totalLessons,
      totalHours: s.totalHours ? Number(s.totalHours) : null,
      total_hours: s.totalHours ? Number(s.totalHours) : null,
      minStudents: s.minStudents,
      min_students: s.minStudents,
      maxStudents: s.maxStudents,
      max_students: s.maxStudents,
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

    // If no preset chosen, create a dedicated course_settings record
    if (!settingsId) {
      try {
        const createdSettings = await this.prisma.courseSettings.create({
          data: {
            name: `${courseName} (Config)`,
            deliveryMode: Number(deliveryMode),
            scheduleDays: dto.scheduleDays ? mapDaysToDb(dto.scheduleDays) : (dto.schedule_days ? mapDaysToDb(dto.schedule_days) : []),
            startTime: dto.startTime ?? dto.start_time ?? null,
            endTime: dto.endTime ?? dto.end_time ?? null,
            lessonDurationMinutes: dto.lessonDurationMinutes != null ? Number(dto.lessonDurationMinutes) : (dto.lesson_duration_minutes != null ? Number(dto.lesson_duration_minutes) : null),
            lessonsPerWeek: dto.lessonsPerWeek != null ? Number(dto.lessonsPerWeek) : (dto.lessons_per_week != null ? Number(dto.lessons_per_week) : null),
            totalLessons: dto.totalLessons != null ? Number(dto.totalLessons) : (dto.total_lessons != null ? Number(dto.total_lessons) : null),
            totalHours: dto.totalHours != null ? Number(dto.totalHours) : (dto.total_hours != null ? Number(dto.total_hours) : null),
            minStudents: dto.minStudents != null ? Number(dto.minStudents) : 1,
            maxStudents: dto.maxStudents != null ? Number(dto.maxStudents) : 8,
          },
        });
        settingsId = createdSettings.id;
      } catch (csErr) {
        console.warn('Error creating courseSettings on create:', csErr);
      }
    }

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
      scheduleType: rawSchedule != null ? parseCourseScheduleType(rawSchedule) : CourseScheduleType.FIXED,
      totalLessons: dto.totalLessons != null ? Number(dto.totalLessons) : (dto.total_lessons != null ? Number(dto.total_lessons) : null),
      scheduleDays: dto.scheduleDays ? mapDaysToDb(dto.scheduleDays) : (dto.schedule_days ? mapDaysToDb(dto.schedule_days) : []),
      startTime: dto.startTime ?? dto.start_time ?? null,
      endTime: dto.endTime ?? dto.end_time ?? null,
      lessonDurationMinutes: dto.lessonDurationMinutes != null ? Number(dto.lessonDurationMinutes) : (dto.lesson_duration_minutes != null ? Number(dto.lesson_duration_minutes) : null),
      totalHours: dto.totalHours != null ? Number(dto.totalHours) : (dto.total_hours != null ? Number(dto.total_hours) : null),
      courseFormat: rawFormat != null ? parseCourseFormat(rawFormat) : CourseFormat.GROUP,
      slug: autoSlug,
    });

    // Multi-teacher sync to course_teachers pivot table
    const teachersList = dto.teachers ?? dto.courseTeachers ?? dto.course_teachers;
    if (Array.isArray(teachersList) && teachersList.length > 0) {
      for (const t of teachersList) {
        const tId = t.teacherId ?? t.teacher_id;
        if (!tId) continue;
        const role = t.role != null ? Number(t.role) : (t.isPrimary || t.is_primary ? 1 : 2);
        const isPrimary = !!(t.isPrimary || t.is_primary);
        try {
          await this.prisma.$executeRaw`
            INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
            VALUES (${c.id}::uuid, ${tId}::uuid, ${role}, ${isPrimary})
            ON CONFLICT (course_id, teacher_id) DO UPDATE SET role = ${role}, is_primary = ${isPrimary}
          `;
        } catch {}
      }
    } else if (teacherId) {
      try {
        await this.prisma.$executeRaw`
          INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
          VALUES (${c.id}::uuid, ${teacherId}::uuid, 1, true)
          ON CONFLICT (course_id, teacher_id) DO UPDATE SET is_primary = true, role = 1
        `;
      } catch {}
    }

    const fresh = await this.coursesRepository.findOne(c.id);
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

    // Handle course_settings update
    const targetSettingsId = updateData.settingsId ?? existing?.settingsId;
    const deliveryMode = dto.deliveryMode ?? dto.delivery_mode ?? (
      Number(updateData.courseFormat ?? dto.courseFormat ?? existing?.courseFormat) === CourseFormat.CERTIFICATION || Number(updateData.courseFormat ?? dto.courseFormat ?? existing?.courseFormat) === 4 ? 4 :
      Number(updateData.scheduleType ?? dto.scheduleType ?? existing?.scheduleType) === CourseScheduleType.FLEXIBLE || Number(updateData.scheduleType ?? dto.scheduleType ?? existing?.scheduleType) === 2 ? 2 : 1
    );

    if (targetSettingsId) {
      try {
        await this.prisma.courseSettings.update({
          where: { id: targetSettingsId },
          data: {
            deliveryMode: Number(deliveryMode),
            scheduleDays: (updateData.scheduleDays !== undefined && updateData.scheduleDays !== null) ? updateData.scheduleDays : undefined,
            startTime: updateData.startTime !== undefined ? updateData.startTime : undefined,
            endTime: updateData.endTime !== undefined ? updateData.endTime : undefined,
            lessonDurationMinutes: updateData.lessonDurationMinutes !== undefined ? updateData.lessonDurationMinutes : undefined,
            lessonsPerWeek: updateData.lessonsPerWeek !== undefined ? updateData.lessonsPerWeek : undefined,
            totalLessons: updateData.totalLessons !== undefined ? updateData.totalLessons : undefined,
            totalHours: updateData.totalHours !== undefined ? updateData.totalHours : undefined,
            minStudents: dto.minStudents != null ? Number(dto.minStudents) : undefined,
            maxStudents: dto.maxStudents != null ? Number(dto.maxStudents) : undefined,
          },
        });
      } catch (csErr) {
        console.warn('Error saving courseSettings on update:', csErr);
      }
    } else {
      try {
        const createdSettings = await this.prisma.courseSettings.create({
          data: {
            name: `${updateData.name || existing?.name || 'Corso'} (Config)`,
            deliveryMode: Number(deliveryMode),
            scheduleDays: (updateData.scheduleDays !== undefined && updateData.scheduleDays !== null) ? updateData.scheduleDays : [],
            startTime: updateData.startTime ?? null,
            endTime: updateData.endTime ?? null,
            lessonDurationMinutes: updateData.lessonDurationMinutes ?? null,
            lessonsPerWeek: updateData.lessonsPerWeek ?? null,
            totalLessons: updateData.totalLessons ?? null,
            totalHours: updateData.totalHours ?? null,
            minStudents: dto.minStudents != null ? Number(dto.minStudents) : 1,
            maxStudents: dto.maxStudents != null ? Number(dto.maxStudents) : 8,
          },
        });
        updateData.settingsId = createdSettings.id;
      } catch (csErr) {
        console.warn('Error creating courseSettings on update:', csErr);
      }
    }

    const c = await this.coursesRepository.update(id, updateData);

    // Sync course_teachers pivot table
    if (Array.isArray(teachersList)) {
      await this.prisma.$executeRaw`DELETE FROM course_teachers WHERE course_id = ${id}::uuid`;
      for (const t of teachersList) {
        const tId = t.teacherId ?? t.teacher_id;
        if (!tId) continue;
        const role = t.role != null ? Number(t.role) : (t.isPrimary || t.is_primary ? 1 : 2);
        const isPrimary = !!(t.isPrimary || t.is_primary);
        await this.prisma.$executeRaw`
          INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
          VALUES (${id}::uuid, ${tId}::uuid, ${role}, ${isPrimary})
          ON CONFLICT (course_id, teacher_id) DO UPDATE SET role = ${role}, is_primary = ${isPrimary}
        `;
      }
    } else if (dto.teacherId !== undefined || dto.teacher_id !== undefined) {
      const newTeacherId: string | null = dto.teacherId ?? dto.teacher_id ?? null;
      await this.prisma.$executeRaw`DELETE FROM course_teachers WHERE course_id = ${id}::uuid AND is_primary = true`;
      if (newTeacherId) {
        await this.prisma.$executeRaw`
          INSERT INTO course_teachers (course_id, teacher_id, role, is_primary)
          VALUES (${id}::uuid, ${newTeacherId}::uuid, 1, true)
          ON CONFLICT (course_id, teacher_id) DO UPDATE SET is_primary = true, role = 1
        `;
      }
    }

    const fresh = await this.coursesRepository.findOne(c.id);
    return this.toDto(fresh ?? c);
  }

  async deleteCourse(id: string) {
    await this.coursesRepository.delete(id);
    return { success: true };
  }

  async listCategories() {
    return this.prisma.courseCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async listTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      where: { isActive: true },
      select: { teacherId: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
    return teachers.map((t) => ({
      teacherId: t.teacherId,
      fullName: t.fullName ?? '',
    }));
  }
}
