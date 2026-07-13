import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { UserEntity } from '../domain/user.entity';
import { UsersRepository } from '../domain/users.repository.interface';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id, isActive: true },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email, isActive: true },
    });
  }

  async create(data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }): Promise<UserEntity> {
    return this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: true,
      },
    });
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
