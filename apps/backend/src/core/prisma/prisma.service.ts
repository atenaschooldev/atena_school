import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { softDeleteExtension } from '../../shared/prisma/soft-delete.extension';

// Atena School Prisma Service
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log:
        process.env.PRISMA_LOG_QUERIES === 'true'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });

    const extendedClient = this.$extends(softDeleteExtension);
    return extendedClient as any;
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[PRISMA]: Database connection successfully established.');
    } catch (err: any) {
      console.warn(
        `[PRISMA WARNING]: Could not connect to database on startup: ${err.message}. Make sure DB server is running and accessible.`,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      console.log('[PRISMA]: Database connection closed.');
    } catch (err: any) {
      console.warn(`[PRISMA WARNING]: Error closing database connection: ${err.message}`);
    }
  }
}
