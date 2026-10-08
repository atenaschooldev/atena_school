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
import { ActiveServicesModule } from './features/active-services/active-services.module';

import { DictionaryModule } from './features/dictionary/dictionary.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { IntegrationsModule } from './features/integrations/integrations.module';
import { FormsModule } from './features/forms/forms.module';
import { DocumentsModule } from './features/documents/documents.module';
import { SearchModule } from './features/search/search.module';

import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ApiLoggingInterceptor } from './core/interceptors/api-logging.interceptor';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { ObserveModule } from './observe';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { TerminusModule } from '@nestjs/terminus';

const businessModules = [
  DictionaryModule,
  NotificationsModule,
  IntegrationsModule,
  FormsModule,
  DocumentsModule,
  SearchModule,
  ActiveServicesModule,
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

    // NestJS Devtools (Интерактивный граф архитектуры на devtools.nestjs.com)
    ...(process.env.NODE_ENV !== 'production' || process.env.DEVTOOLS_ENABLED
      ? [
          DevtoolsModule.register({
            port: 8000,
          }),
        ]
      : []),

    // NestJS Terminus (Глубокий мониторинг здоровья системы и БД)
    TerminusModule,

    // NestJS Observe APM & Observability (автоматически активируется при наличии OBSERVE_APP_KEY)
    ...(process.env.OBSERVE_APP_KEY
      ? [
          ObserveModule.forRoot({
            appKey: process.env.OBSERVE_APP_KEY,
            appSecret: process.env.OBSERVE_APP_SECRET || '',
            serviceId: process.env.OBSERVE_SERVICE_ID || 'atena-school-api',
          }),
        ]
      : []),

    // Защита от DDoS и флуда (Rate Limiting)
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 120,
      },
    ]),

    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

