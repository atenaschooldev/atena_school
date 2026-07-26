import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CourseEntity } from '../domain/course.entity';
import { CoursesRepository } from '../domain/courses.repository.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaCoursesRepository implements CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<CourseEntity[]> {
    const list = await this.prisma.course.findMany();
    return list.map((c) => this.mapToEntity(c));
  }

  async findOne(id: string): Promise<CourseEntity | null> {
    const c = await this.prisma.course.findUnique({ where: { id } });
    if (!c) return null;
    return this.mapToEntity(c);
  }

  async create(data: {
    name: string;
    category: string;
    duration: string;
    price: number;
    status?: string;
    teacherId?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    level?: string | null;
    capacity?: number;
  }): Promise<CourseEntity> {
    const c = await this.prisma.course.create({
      data: {
        name: data.name,
        category: data.category,
        duration: data.duration,
        price: new Prisma.Decimal(data.price),
        status: data.status || 'active',
        teacherId: data.teacherId || null,
        description: data.description ?? '',
        imageUrl: data.imageUrl ?? null,
        level: data.level ?? 'A1',
        capacity: data.capacity ?? 10,
      },
    });
    return this.mapToEntity(c);
  }

  async update(id: string, data: Partial<CourseEntity>): Promise<CourseEntity> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
    if (data.studentCount !== undefined) updateData.studentCount = data.studentCount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;

    const c = await this.prisma.course.update({ where: { id }, data: updateData });
    return this.mapToEntity(c);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.update({
      where: { id },
      data: { status: 'archived' },
    });
  }

  private mapToEntity(c: any): CourseEntity {
    return {
      id: c.id,
      name: c.name,
      category: c.category,
      duration: c.duration,
      price: c.price ? Number(c.price) : 0,
      status: c.status,
      teacherId: c.teacherId,
      studentCount: c.studentCount,
      description: c.description ?? null,
      imageUrl: c.imageUrl ?? null,
      level: c.level ?? null,
      capacity: c.capacity ?? 10,
      teacherName: c.teacherName ?? null,
    };
  }
}
