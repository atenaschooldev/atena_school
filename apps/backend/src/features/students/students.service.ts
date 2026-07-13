import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentsRepository } from './domain/students.repository.interface';
import { UsersRepository } from '../auth/domain/users.repository.interface';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async listStudents() {
    const students = await this.studentsRepository.findMany();
    return students.map((s) => ({
      id: s.studentId,
      full_name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      status: s.status,
      language_level: s.languageLevel,
    }));
  }

  async getStudent(id: string) {
    const s = await this.studentsRepository.findOne(id);
    if (!s) throw new NotFoundException('Студент не найден');
    return {
      id: s.studentId,
      full_name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      status: s.status,
      language_level: s.languageLevel,
    };
  }

  async createStudent(dto: any) {
    // 1. Создаем учетную запись пользователя
    const userId = dto.studentId || `stud-${Date.now()}`;
    const names = (dto.full_name || 'Student Student').split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'Student';

    const user = await this.usersRepository.create({
      id: userId,
      email: dto.email || `student-${Date.now()}@atenaschool.it`,
      firstName,
      lastName,
      role: 'student',
    });

    // 2. Создаем профиль студента
    const s = await this.studentsRepository.create({
      studentId: user.id,
      languageLevel: dto.language_level,
      status: dto.status,
    });

    return {
      id: s.studentId,
      full_name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      status: s.status,
      language_level: s.languageLevel,
    };
  }

  async updateStudent(id: string, dto: any) {
    // Обновляем профиль
    const s = await this.studentsRepository.update(id, {
      languageLevel: dto.language_level,
      status: dto.status,
    });

    // Обновляем имя/фамилию, если переданы
    if (dto.full_name) {
      const names = dto.full_name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '';
      await this.usersRepository.update(id, { firstName, lastName });
    }

    return this.getStudent(id);
  }

  async deleteStudent(id: string) {
    await this.studentsRepository.delete(id);
    return { success: true };
  }
}
