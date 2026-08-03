import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { UsersRepository, UserEntity } from '../domain/users.repository.interface';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(role?: string): Promise<UserEntity[]> {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!email) return null;
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    isActive?: boolean;
  }): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? 'student',
        isActive: data.isActive ?? true,
      },
    });

    if (user.role === 'teacher') {
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Docente';
      await this.prisma.teacher.upsert({
        where: { teacherId: user.id },
        create: {
          teacherId: user.id,
          fullName,
          status: user.isActive ? 'active' : 'inactive',
        },
        update: {
          fullName,
          status: user.isActive ? 'active' : 'inactive',
        },
      }).catch((e) => console.warn('Could not sync teacher:', e));
    }

    return user;
  }

  async update(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      role: string;
      isActive: boolean;
    }>,
  ): Promise<UserEntity> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    if (user.role === 'teacher') {
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Docente';
      await this.prisma.teacher.upsert({
        where: { teacherId: user.id },
        create: {
          teacherId: user.id,
          fullName,
          status: user.isActive ? 'active' : 'inactive',
        },
        update: {
          fullName,
          status: user.isActive ? 'active' : 'inactive',
        },
      }).catch((e) => console.warn('Could not sync teacher update:', e));
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.teacher.delete({ where: { teacherId: id } }).catch(() => {});
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
