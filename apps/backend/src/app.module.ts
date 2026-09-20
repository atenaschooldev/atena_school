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
import { UsersModule } from './features/users/users.module';
import { PaymentsModule } from './features/payments/payments.module';
import { MembershipsModule } from './features/memberships/memberships.module';
import { TeachersModule } from './features/teachers/teachers.module';
import { AttendanceModule } from './features/attendance/attendance.module';
import { ReportsModule } from './features/reports/reports.module';
import { AuditLogsModule } from './features/audit-logs/audit-logs.module';
import { StudentsModule } from './features/students/students.module';
import { GroupsModule } from './features/groups/groups.module';

import { DictionaryModule } from './features/dictionary/dictionary.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { IntegrationsModule } from './features/integrations/integrations.module';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { ApiLoggingInterceptor } from './core/interceptors/api-logging.interceptor';

const businessModules = [
  DictionaryModule,
  NotificationsModule,
  IntegrationsModule,
  AuthModule,
  CoursesModule,
  GroupsModule,
  SchedulesModule,
  MailModule,
  CheckoutModule,
  PortalModule,
  UsersModule,
  PaymentsModule,
  MembershipsModule,
  TeachersModule,
  AttendanceModule,
  ReportsModule,
  AuditLogsModule,
  StudentsModule,
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
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiLoggingInterceptor,
    },
  ],
})
export class AppModule {}

