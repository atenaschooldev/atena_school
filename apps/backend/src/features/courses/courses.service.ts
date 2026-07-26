import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './domain/courses.repository.interface';
import { CourseEntity } from './domain/course.entity';

export interface CourseResponseDto {
  id: string;
  name: string;
  title: string;
  category: string;
  duration: string;
  price: number;
  status: string;
  studentCount: number;
  studentsCount: number;
  teacherId: string | null;
  teacherName: string | null;
  description: string | null;
  imageUrl: string | null;
  level: string | null;
  capacity: number;
}

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  private toDto(c: CourseEntity): CourseResponseDto {
    return {
      id: c.id,
      name: c.name,
      title: c.name,
      category: c.category,
      duration: c.duration,
      price: c.price,
      status: c.status,
      studentCount: c.studentCount,
      studentsCount: c.studentCount,
      teacherId: c.teacherId ?? null,
      teacherName: c.teacherName ?? null,
      description: c.description ?? null,
      imageUrl: c.imageUrl ?? null,
      level: c.level ?? null,
      capacity: c.capacity ?? 10,
    };
  }

  async listCourses(): Promise<CourseResponseDto[]> {
    const list = await this.coursesRepository.findMany();
    const activeList = list.filter((c) => c.status !== 'archived');
    return activeList.map((c) => this.toDto(c));
  }

  async getCourse(id: string): Promise<CourseResponseDto> {
    const c = await this.coursesRepository.findOne(id);
    if (!c || c.status === 'archived') {
      throw new NotFoundException('Курс не найден');
    }
    return this.toDto(c);
  }

  async createCourse(dto: any): Promise<CourseResponseDto> {
    const c = await this.coursesRepository.create({
      name: dto.title ?? dto.name ?? 'Nuovo Corso',
      category: dto.category ?? 'General English',
      duration: dto.duration ?? '60 ore',
      price: Number(dto.price ?? 0),
      status: dto.status ?? 'active',
      teacherId: dto.teacherId ?? dto.teacher_id ?? null,
      description: dto.description ?? '',
      imageUrl: dto.imageUrl ?? dto.foto ?? null,
      level: dto.level ?? dto.livello ?? 'A1',
      capacity: Number(dto.capacity ?? dto.capienza ?? 10),
    });
    return this.toDto(c);
  }

  async updateCourse(id: string, dto: any): Promise<CourseResponseDto> {
    const updateData: Partial<CourseEntity> = {};
    if (dto.title !== undefined) updateData.name = dto.title;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.price !== undefined) updateData.price = Number(dto.price);
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.teacherId !== undefined) updateData.teacherId = dto.teacherId;
    if (dto.teacher_id !== undefined) updateData.teacherId = dto.teacher_id;
    if (dto.studentCount !== undefined) updateData.studentCount = dto.studentCount;
    if (dto.studentsCount !== undefined) updateData.studentCount = dto.studentsCount;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl;
    if (dto.foto !== undefined) updateData.imageUrl = dto.foto;
    if (dto.level !== undefined) updateData.level = dto.level;
    if (dto.livello !== undefined) updateData.level = dto.livello;
    if (dto.capacity !== undefined) updateData.capacity = Number(dto.capacity);
    if (dto.capienza !== undefined) updateData.capacity = Number(dto.capienza);

    const c = await this.coursesRepository.update(id, updateData);
    return this.toDto(c);
  }

  async deleteCourse(id: string) {
    await this.coursesRepository.delete(id);
    return { success: true };
  }
}
