import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from './domain/courses.repository.interface';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepository: CoursesRepository) {}

  async listCourses() {
    const list = await this.coursesRepository.findMany();
    // Фильтруем архивированные курсы (мягкое удаление)
    const activeList = list.filter((c) => c.status !== 'archived');
    return activeList.map((c) => ({
      id: c.id,
      title: c.name,
      category: c.category,
      duration: c.duration,
      price: c.price,
      status: c.status,
      studentsCount: c.studentCount,
      teacherName: c.teacherName,
    }));
  }

  async getCourse(id: string) {
    const c = await this.coursesRepository.findOne(id);
    if (!c || c.status === 'archived') {
      throw new NotFoundException('Курс не найден');
    }
    return {
      id: c.id,
      title: c.name,
      category: c.category,
      duration: c.duration,
      price: c.price,
      status: c.status,
      studentsCount: c.studentCount,
      teacherName: c.teacherName,
    };
  }

  async createCourse(dto: any) {
    const c = await this.coursesRepository.create({
      name: dto.title,
      category: dto.category || 'Development',
      duration: dto.duration || '8 weeks',
      price: dto.price || 0.0,
      status: dto.status || 'active',
      teacherId: dto.teacherId,
    });

    return {
      id: c.id,
      title: c.name,
      category: c.category,
      duration: c.duration,
      price: c.price,
      status: c.status,
      studentsCount: c.studentCount,
      teacherName: c.teacherName,
    };
  }

  async updateCourse(id: string, dto: any) {
    const updateData: any = {};
    if (dto.title !== undefined) updateData.name = dto.title;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.duration !== undefined) updateData.duration = dto.duration;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.teacherId !== undefined) updateData.teacherId = dto.teacherId;

    const c = await this.coursesRepository.update(id, updateData);

    return {
      id: c.id,
      title: c.name,
      category: c.category,
      duration: c.duration,
      price: c.price,
      status: c.status,
      studentsCount: c.studentCount,
      teacherName: c.teacherName,
    };
  }

  async deleteCourse(id: string) {
    await this.coursesRepository.delete(id);
    return { success: true };
  }
}
