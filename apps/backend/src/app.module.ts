import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './core/supabase/supabase.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { HealthController } from './health.controller';

// Импорт бизнес-фич (Feature-First) — только MVP-нужные:
import { AuthModule } from './features/auth/auth.module';
import { CoursesModule } from './features/courses/courses.module';
import { SchedulesModule } from './features/schedules/schedules.module';
import { MailModule } from './features/mail/mail.module';
import { CheckoutModule } from './features/checkout/checkout.module';
import { PortalModule } from './features/portal/portal.module';

const businessModules = [
  AuthModule,
  CoursesModule,
  SchedulesModule,
  MailModule,
  CheckoutModule,
  PortalModule,
];

@Module({
  imports: [
    // Конфигурация приложения (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Глобальные сервисы инфраструктуры
    SupabaseModule,
    PrismaModule,

    // Бизнес-модули
    ...businessModules,
  ],
  controllers: [HealthController],
})
export class AppModule {}
