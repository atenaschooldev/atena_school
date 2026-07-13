import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingsRepository } from './domain/settings.repository.interface';
import { PrismaSettingsRepository } from './impl/prisma-settings.repository';

@Module({
  controllers: [SettingsController],
  providers: [
    SettingsService,
    {
      provide: SettingsRepository,
      useClass: PrismaSettingsRepository,
    },
  ],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
