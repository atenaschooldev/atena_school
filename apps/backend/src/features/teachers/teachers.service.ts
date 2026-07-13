import { Injectable, NotFoundException } from '@nestjs/common';
import { TeachersRepository } from './domain/teachers.repository.interface';
import { UsersRepository } from '../auth/domain/users.repository.interface';

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepository: TeachersRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async listTeachers() {
    const list = await this.teachersRepository.findMany();
    return list.map((t) => ({
      id: t.teacherId,
      full_name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      status: t.status,
      subject: t.subject,
      experience: t.experience,
    }));
  }

  async getTeacher(id: string) {
    const t = await this.teachersRepository.findOne(id);
    if (!t) throw new NotFoundException('Преподаватель не найден');
    return {
      id: t.teacherId,
      full_name: `${t.firstName} ${t.lastName}`,
      email: t.email,
      status: t.status,
      subject: t.subject,
      experience: t.experience,
    };
  }

  async createTeacher(dto: any) {
    // 1. Создаем учетную запись пользователя
    const userId = dto.teacherId || `teach-${Date.now()}`;
    const names = (dto.full_name || 'Teacher Teacher').split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'Teacher';

    const user = await this.usersRepository.create({
      id: userId,
      email: dto.email || `teacher-${Date.now()}@atenaschool.it`,
      firstName,
      lastName,
      role: 'teacher',
    });

    // 2. Создаем профиль учителя
    const t = await this.teachersRepository.create({
      teacherId: user.id,
      subject: dto.subject,
      experience: dto.experience,
      status: dto.status,
    });

    return {
      id: t.teacherId,
      full_name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      status: t.status,
      subject: t.subject,
      experience: t.experience,
    };
  }

  async updateTeacher(id: string, dto: any) {
    // Обновляем профиль
    const t = await this.teachersRepository.update(id, {
      subject: dto.subject,
      experience: dto.experience,
      status: dto.status,
    });

    // Обновляем имя/фамилию, если переданы
    if (dto.full_name) {
      const names = dto.full_name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '';
      await this.usersRepository.update(id, { firstName, lastName });
    }

    return this.getTeacher(id);
  }

  async deleteTeacher(id: string) {
    await this.teachersRepository.delete(id);
    return { success: true };
  }
}
