import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { softDeleteExtension } from '../../shared/prisma/soft-delete.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });

    const extendedClient = this.$extends(softDeleteExtension);
    return extendedClient as any;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[PRISMA]: Успешно подключено к базе данных.');
    } catch (err: any) {
      console.warn(
        `[PRISMA WARNING]: Не удалось подключиться к базе данных при запуске: ${err.message}. Убедитесь, что сервер БД запущен и доступен.`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('[PRISMA]: Соединение с базой данных закрыто.');
    } catch (err: any) {
      console.warn(`[PRISMA WARNING]: Ошибка при закрытии соединения: ${err.message}`);
    }
  }
}
