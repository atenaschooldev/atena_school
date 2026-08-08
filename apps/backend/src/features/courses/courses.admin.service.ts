import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './domain/courses.repository.interface';
import { CourseEntity } from './domain/course.entity';
import { PrismaService } from '../../core/prisma/prisma.service';
import { slugify } from '@atena/utils';

export interface CourseResponseDto {
  id: string;
  name: string;
  title: string;
  category: string | null;
  price: number | null;
  status: string | null;
  photoUrl: string | null;
  description: string | null;
  teacherId: string | null;
  teacherName: string | null;
  lessonsPerWeek: number | null;
  sortOrder: number | null;
  scheduleType: string | null;
  totalLessons: number | null;
  scheduleDays: string[] | null;
  startTime: string | null;
  endTime: string | null;
  lessonDurationMinutes: number | null;
  totalHours: number | null;
  courseFormat: string | null;
  slug: string | null;
  updatedAt: Date | null;
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

const STR_DAY_MAP: Record<string, number> = {
  "Lunedì": 1,
  "Martedì": 2,
  "Mercoledì": 3,
  "Giovedì": 4,
  "Venerdì": 5,
  "Sabato": 6,
  "Domenica": 7
};

function mapDaysToFrontend(days?: number[] | null): string[] {
  if (!days) return [];
  return days.map(d => DAY_MAP[d] || String(d));
}

function mapDaysToDb(days?: string[] | null): number[] {
  if (!days) return [];
  return days.map(d => STR_DAY_MAP[d]).filter(d => !!d);
}

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly prisma: PrismaService,
  ) {}

  private toDto(c: CourseEntity): CourseResponseDto {
    return {
      id: c.id,
      name: c.name,
      title: c.name,
      category: c.category ?? null,
      price: c.price ?? null,
      status: c.status ?? null,
      photoUrl: c.photoUrl ?? null,
      description: c.description ?? null,
      teacherId: c.teacherId ?? null,
      teacherName: c.teacherName ?? null,
      lessonsPerWeek: c.lessonsPerWeek ?? null,
      sortOrder: c.sortOrder ?? null,
      scheduleType: c.scheduleType ?? null,
      totalLessons: c.totalLessons ?? null,
      scheduleDays: c.scheduleDays ? mapDaysToFrontend(c.scheduleDays) : null,
      startTime: c.startTime ?? null,
      endTime: c.endTime ?? null,
      lessonDurationMinutes: c.lessonDurationMinutes ?? null,
      totalHours: c.totalHours ?? null,
      courseFormat: c.courseFormat ?? null,
      slug: c.slug ?? null,
      updatedAt: c.updatedAt ?? null,
    };
  }

  async listCourses(params?: { category?: string; status?: string; search?: string }): Promise<CourseResponseDto[]> {
    let list = await this.coursesRepository.findMany();

    if (params?.category) {
      const cat = params.category.toLowerCase().trim();
      list = list.filter((c) => (c.category || '').toLowerCase().includes(cat));
    }
    if (params?.status) {
      const st = params.status.toLowerCase().trim();
      list = list.filter((c) => (c.status || '').toLowerCase() === st);
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
    if (!c || c.status === 'archived') {
      throw new NotFoundException('Курс не найден');
    }
    return this.toDto(c);
  }

  async createCourse(dto: any): Promise<CourseResponseDto> {
    const teacherId: string | null = dto.teacherId ?? dto.teacher_id ?? null;
    const courseName = dto.title ?? dto.name ?? 'Nuovo Corso';
    const autoSlug = dto.slug || slugify(courseName);

    const c = await this.coursesRepository.create({
      name: courseName,
      category: dto.category ?? null,
      price: dto.price != null ? Number(dto.price) : null,
      status: dto.status ?? 'active',
      teacherId,
      description: dto.description ?? null,
      photoUrl: dto.photoUrl ?? dto.photo_url ?? null,
      lessonsPerWeek: dto.lessonsPerWeek != null ? Number(dto.lessonsPerWeek) : null,
      sortOrder: dto.sortOrder != null ? Number(dto.sortOrder) : null,
      scheduleType: dto.scheduleType ?? null,
      totalLessons: dto.totalLessons != null ? Number(dto.totalLessons) : null,
      scheduleDays: dto.scheduleDays ? mapDaysToDb(dto.scheduleDays) : [],
      startTime: dto.startTime ?? null,
      endTime: dto.endTime ?? null,
      lessonDurationMinutes: dto.lessonDurationMinutes != null ? Number(dto.lessonDurationMinutes) : null,
      totalHours: dto.totalHours != null ? Number(dto.totalHours) : null,
      courseFormat: dto.courseFormat ?? null,
      slug: autoSlug,
    });

    // Sync course_teachers pivot table
    if (teacherId) {
      await this.prisma.$executeRaw`
        INSERT INTO course_teachers (course_id, teacher_id)
        VALUES (${c.id}::uuid, ${teacherId}::uuid)
        ON CONFLICT DO NOTHING
      `;
    }

    const fresh = await this.coursesRepository.findOne(c.id);
    return this.toDto(fresh ?? c);
  }

  async updateCourse(id: string, dto: any): Promise<CourseResponseDto> {
    const updateData: Partial<CourseEntity> = {};
    if (dto.title !== undefined) updateData.name = dto.title;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.price !== undefined) updateData.price = dto.price != null ? Number(dto.price) : null;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.teacherId !== undefined) updateData.teacherId = dto.teacherId;
    if (dto.teacher_id !== undefined) updateData.teacherId = dto.teacher_id;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.photoUrl !== undefined) updateData.photoUrl = dto.photoUrl;
    if (dto.photo_url !== undefined) updateData.photoUrl = dto.photo_url;
    if (dto.lessonsPerWeek !== undefined) updateData.lessonsPerWeek = dto.lessonsPerWeek != null ? Number(dto.lessonsPerWeek) : null;
    if (dto.lessons_per_week !== undefined) updateData.lessonsPerWeek = dto.lessons_per_week != null ? Number(dto.lessons_per_week) : null;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder != null ? Number(dto.sortOrder) : null;
    if (dto.sort_order !== undefined) updateData.sortOrder = dto.sort_order != null ? Number(dto.sort_order) : null;
    if (dto.scheduleType !== undefined) updateData.scheduleType = dto.scheduleType;
    if (dto.schedule_type !== undefined) updateData.scheduleType = dto.schedule_type;
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
    if (dto.courseFormat !== undefined) updateData.courseFormat = dto.courseFormat;
    if (dto.course_format !== undefined) updateData.courseFormat = dto.course_format;
    if (dto.slug !== undefined) updateData.slug = dto.slug;

    const c = await this.coursesRepository.update(id, updateData);

    // Sync course_teachers pivot if teacher changed
    if (dto.teacherId !== undefined || dto.teacher_id !== undefined) {
      const newTeacherId: string | null = dto.teacherId ?? dto.teacher_id ?? null;
      // Remove old entries, insert new one
      await this.prisma.$executeRaw`DELETE FROM course_teachers WHERE course_id = ${id}::uuid`;
      if (newTeacherId) {
        await this.prisma.$executeRaw`
          INSERT INTO course_teachers (course_id, teacher_id)
          VALUES (${id}::uuid, ${newTeacherId}::uuid)
          ON CONFLICT DO NOTHING
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

  async listTeachers() {
    const teachers = await this.prisma.teacher.findMany({
      where: { status: 'active' },
      select: { teacherId: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
    return teachers.map((t) => ({
      teacherId: t.teacherId,
      fullName: t.fullName ?? '',
    }));
  }
}
