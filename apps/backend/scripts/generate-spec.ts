import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs-extra';
import * as path from 'path';

async function generateSpec() {
  console.log('[SWAGGER GENERATOR]: Инициализация контекста приложения...');
  
  // Создаем приложение в headless-режиме
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.setGlobalPrefix('api/v1');

  console.log('[SWAGGER GENERATOR]: Сборка OpenAPI спецификации...');
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
  const outputPath = path.join(process.cwd(), 'swagger.json');

  console.log(`[SWAGGER GENERATOR]: Запись спецификации в файл: ${outputPath}`);
  await fs.outputJson(outputPath, document, { spaces: 2 });

  await app.close();
  console.log('[SWAGGER GENERATOR]: Экспорт завершен успешно!');
}

generateSpec().catch((err) => {
  console.error('[SWAGGER GENERATOR ERROR]: Сбой при генерации спецификации:', err);
  process.exit(1);
});
