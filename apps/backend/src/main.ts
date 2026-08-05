import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import fastifyHelmet from '@fastify/helmet';

async function bootstrap() {
  // Инициализация адаптера Fastify с увеличенным лимитом размера тела запроса (10MB) и подписью rawBody для Stripe
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 10485760, rawBody: true } as any),
  );

  // Безопасность (Helmet) - отключаем CSP, чтобы Swagger UI корректно отображался
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: false,
  });

  // CORS и префикс путей
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:4000',
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.setGlobalPrefix('api/v1');

  // Глобальный фильтр ошибок (совместимость с FastAPI для Flutter-клиента)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Глобальная валидация DTO через class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Конфигурация Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Atena School API')
    .setDescription('Академическая система управления (CRM) Atena School (NestJS/Fastify)')
    .setVersion('1.0.0')
    // 1. АДМИНКА (вверху)
    .addTag('Admin — Bookings', 'Управление бронированиями и регистрацией на рецепции')
    .addTag('Admin — Students', 'Управление карточками студентов и фильтрами')
    .addTag('Admin — Courses', 'Управление каталогом курсов')
    .addTag('Admin — Presenze / Attendance', 'Управление посещаемостью и журналом уроков')
    .addTag('Admin — Payments', 'Управление платежами и транзакциями')
    .addTag('Admin — Memberships', 'Управление членскими взносами (€30)')
    .addTag('Admin — Teachers', 'Управление преподавателями')
    .addTag('Admin — Schedules', 'Управление расписанием')
    .addTag('Admin — Reports / Analytics', 'Финансовые отчёты, должники и сводки посещаемости')
    .addTag('Admin — Audit Logs', 'Журнал активности и логов действий сотрудников')
    .addTag('Admin — Mail', 'Отправка писем и уведомлений')
    // 2. ЛЕНДИНГ (в середине)
    .addTag('Landing — Checkout & Catalog', 'Публичная витрина курсов и онлайн-бронирование')
    .addTag('Landing — Webhooks', 'Обработка вебхуков Stripe')
    .addTag('Landing — Home', 'Публичная главная страница')
    // 3. ЛИЧНЫЙ КАБИНЕТ / ЛК (внизу)
    .addTag('Student & Parent Portal (LK)', 'Личный кабинет студента и родителя')
    .addTag('Auth', 'Аутентификация и сессии')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен Supabase Auth',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n============================================================`);
  console.log(`⚙️  Backend API:          http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(`============================================================\n`);
}
bootstrap();
