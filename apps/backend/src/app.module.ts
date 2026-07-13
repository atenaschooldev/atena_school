import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './core/supabase/supabase.module';
import { PrismaModule } from './core/prisma/prisma.module';

// Импорт бизнес-фич (Feature-First)
import { AuthModule } from './features/auth/auth.module';
import { SettingsModule } from './features/settings/settings.module';
import { StudentsModule } from './features/students/students.module';
import { TeachersModule } from './features/teachers/teachers.module';
import { CoursesModule } from './features/courses/courses.module';
import { SchedulesModule } from './features/schedules/schedules.module';
import { AttendanceModule } from './features/attendance/attendance.module';
import { GradesModule } from './features/grades/grades.module';
import { DocumentsModule } from './features/documents/documents.module';
import { PaymentsModule } from './features/payments/payments.module';
import { MailModule } from './features/mail/mail.module';
import { ActivityLogsModule } from './features/activity_logs/activity_logs.module';
import { HomeModule } from './features/home/home.module';

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
    AuthModule,
    SettingsModule,
    StudentsModule,
    TeachersModule,
    CoursesModule,
    SchedulesModule,
    AttendanceModule,
    GradesModule,
    DocumentsModule,
    PaymentsModule,
    MailModule,
    ActivityLogsModule,
    HomeModule,
  ],
})
export class AppModule {}
