import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { SettingsRepository } from '../domain/settings.repository.interface';

@Injectable()
export class PrismaSettingsRepository implements SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return {
      userId: user.id,
      language: 'it', // В будущем: user.language || 'it'
      theme: 'dark',
      notificationsEnabled: true,
    };
  }

  async updateSettings(
    userId: string,
    data: { language?: string; theme?: string; notificationsEnabled?: boolean },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    // Если в таблице User появится колонка language, обновим её. 
    // Пока просто имитируем успешное обновление.
    return {
      userId: user.id,
      language: data.language || 'it',
      theme: data.theme || 'dark',
      notificationsEnabled: data.notificationsEnabled ?? true,
      updatedAt: new Date().toISOString(),
    };
  }
}
