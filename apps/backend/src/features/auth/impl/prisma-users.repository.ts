import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { UserEntity } from '../domain/user.entity';
import { UsersRepository } from '../domain/users.repository.interface';

function toAuthEntity(u: any): UserEntity {
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
    createdAt: u.createdAt || u.created_at,
  };
}

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({
      where: { id, isActive: true },
    });
    return u ? toAuthEntity(u) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const u = await this.prisma.user.findUnique({
      where: { email, isActive: true },
    });
    return u ? toAuthEntity(u) : null;
  }

  async create(data: {
    id: string;
    email: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    role: string;
  }): Promise<UserEntity> {
    const fullName =
      data.fullName ||
      `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() ||
      'Utente';

    const u = await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        fullName,
        role: data.role,
        isActive: true,
      },
    });
    return toAuthEntity(u);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const updateData: any = {};
    if (data.fullName !== undefined) {
      updateData.fullName = data.fullName;
    } else if (data.firstName !== undefined || data.lastName !== undefined) {
      updateData.fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();
    }
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const u = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return toAuthEntity(u);
  }
}
