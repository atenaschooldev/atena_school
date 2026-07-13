import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { AnalyticsRepository } from './domain/analytics.repository.interface';
import { PrismaAnalyticsRepository } from './impl/prisma-analytics.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: AnalyticsRepository,
      useClass: PrismaAnalyticsRepository,
    },
  ],
  exports: [HomeService, AnalyticsRepository],
})
export class HomeModule {}
