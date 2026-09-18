import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { UsersRepository, UserEntity } from '../domain/users.repository.interface';
import { UserRole, parseUserRole } from '@atena/api-types';

function toEntity(u: any): UserEntity {
  const fullName = u.fullName || u.full_name || 'Utente';
  const parts = fullName.split(' ');
  return {
    id: u.id,
    email: u.email,
    fullName,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
    role: u.role,
    isActive: u.isActive,
    phone: u.phone,
    taxCode: u.taxCode || u.tax_code,
    avatarUrl: u.avatarUrl || u.avatar_url,
    createdAt: u.createdAt || u.created_at,
    updatedAt: u.updatedAt || u.updated_at,
  };
}

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(role?: string | number): Promise<UserEntity[]> {
    const numericRole = role !== undefined && role !== null && role !== '' ? parseUserRole(role) : undefined;
    const users = await this.prisma.user.findMany({
      where: numericRole !== undefined ? { role: numericRole } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toEntity);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!email) return null;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user ? toEntity(user) : null;
  }

  async create(data: {
    id: string;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    role?: number | string;
    isActive?: boolean;
  }): Promise<UserEntity> {
    const fullName =
      data.fullName ||
      `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() ||
      'Utente';

    const numericRole = parseUserRole(data.role ?? UserRole.STUDENT);

    const user = await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        fullName,
        role: numericRole,
        isActive: data.isActive ?? true,
      },
    });

    if (user.role === UserRole.TEACHER) {
      await this.prisma.teacher
        .upsert({
          where: { teacherId: user.id },
          create: {
            teacherId: user.id,
            fullName: user.fullName,
            isActive: user.isActive,
          },
          update: {
            fullName: user.fullName,
            isActive: user.isActive,
          },
        })
        .catch((e) => console.warn('Could not sync teacher:', e));
    }

    return toEntity(user);
  }

  async update(
    id: string,
    data: Partial<{
      fullName: string;
      firstName: string;
      lastName: string;
      role: number | string;
      isActive: boolean;
      phone: string;
      taxCode: string;
    }>,
  ): Promise<UserEntity> {
    const updateData: any = {};
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName;
    } else if (data.firstName !== undefined || data.lastName !== undefined) {
      updateData.fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
    }
    if (data.role !== undefined) updateData.role = parseUserRole(data.role);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.taxCode !== undefined) updateData.taxCode = data.taxCode;

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    if (user.role === UserRole.TEACHER) {
      await this.prisma.teacher
        .upsert({
          where: { teacherId: user.id },
          create: {
            teacherId: user.id,
            fullName: user.fullName,
            isActive: user.isActive,
          },
          update: {
            fullName: user.fullName,
            isActive: user.isActive,
          },
        })
        .catch((e) => console.warn('Could not sync teacher update:', e));
    }

    return toEntity(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.teacher.delete({ where: { teacherId: id } }).catch(() => {});
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
