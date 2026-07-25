import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import fastifyHelmet from '@fastify/helmet';

async function bootstrap() {
  // Инициализация адаптера Fastify с увеличенным лимитом размера тела запроса (10MB)
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 10485760 }),
  );

  // Безопасность (Helmet) - отключаем CSP, чтобы Swagger UI корректно отображался
  await app.register(fastifyHelmet as any, {
    contentSecurityPolicy: false,
  });

  // CORS и префикс путей
  app.enableCors({ origin: '*' });
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
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/docs`);
}
bootstrap();
