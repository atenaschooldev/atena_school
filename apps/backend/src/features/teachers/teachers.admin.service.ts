import { Injectable, NotFoundException } from '@nestjs/common';
import { TeachersRepository } from './domain/teachers.repository.interface';

@Injectable()
export class TeachersService {
  constructor(private readonly teachersRepository: TeachersRepository) {}

  async findAll(filters?: { status?: string; search?: string }) {
    const list = await this.teachersRepository.findAll();
    let result = list;

    if (filters?.status) {
      const st = filters.status.toLowerCase().trim();
      result = result.filter((t) => (t.status || '').toLowerCase() === st);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.fullName || '').toLowerCase().includes(s) ||
          ((t as any).email || '').toLowerCase().includes(s) ||
          ((t as any).phone || '').toLowerCase().includes(s),
      );
    }

    return result;
  }

  async findOne(id: string) {
    const teacher = await this.teachersRepository.findById(id);
    if (!teacher) throw new NotFoundException(`Teacher ${id} not found`);
    return teacher;
  }

  async create(dto: any) {
    return this.teachersRepository.create({
      fullName: dto.fullName,
      status: dto.status,
      photoUrl: dto.photoUrl,
      experience: dto.experience,
    });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.teachersRepository.update(id, {
      fullName: dto.fullName,
      status: dto.status,
      photoUrl: dto.photoUrl,
      experience: dto.experience,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.teachersRepository.delete(id);
  }
}
