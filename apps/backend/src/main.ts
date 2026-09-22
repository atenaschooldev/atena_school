import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import fastifyHelmet from '@fastify/helmet';

import { DictionaryService } from './features/dictionary/dictionary.service';

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
  const configuredOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [];

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        configuredOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  });

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
    .setDescription(
      'Академическая система управления (CRM) Atena School (NestJS/Fastify)<br><br>' +
      '<div style="background: #F7F6F3; border: 1px solid #E9E9E7; border-radius: 4px; padding: 14px 18px; margin: 12px 0 16px 0; display: flex; align-items: center; justify-content: space-between; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">' +
      '  <div style="display: flex; align-items: center; gap: 12px;">' +
      '    <span style="font-size: 24px;">📖</span>' +
      '    <div>' +
      '      <div style="font-weight: 600; color: #37352F; font-size: 14px;">Словарь данных (Data Dictionary)</div>' +
      '      <div style="color: #787774; font-size: 13px;">Таблицы числовых статусов (1, 2, 3...), кодов и переводов (IT, EN, RU) в стиле Notion</div>' +
      '    </div>' +
      '  </div>' +
      '  <a href="/docs/dictionary" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #2EAADC; color: #FFFFFF; font-weight: 500; font-size: 13px; padding: 7px 14px; border-radius: 4px; text-decoration: none;">' +
      '    Открыть словарь →' +
      '  </a>' +
      '</div>',
    )
    .setVersion('1.0.0')
    // ==========================================
    // 1. 🌟 ЛЕНДИНГ И ЧЕКАУТ (LANDING & PUBLIC API)
    // ==========================================
    .addTag('Landing — Courses Catalog', 'Публичная витрина, каталог курсов, форматы (разово/подписка) и расписания')
    .addTag('Landing — Checkout & Payments', 'Оформление заказа: проверка взноса €30, Paga in Sede, Stripe Checkout и подписки')
    .addTag('Landing — Bookings & Receipts', 'Получение подтверждения бронирования, квитанции, уроков и платежей')
    .addTag('Landing — Settings & Gateways', 'Системные настройки лендинга (статус онлайн-оплаты Stripe и подписок)')
    .addTag('Landing — Contact & Leads', 'Форма обратной связи и входящие лиды')
    .addTag('Landing — Webhooks (Stripe)', 'Обработка асинхронных событий Stripe (оплаты, продление подписок, инвойсы)')

    // ==========================================
    // 2. 🔐 АВТОРИЗАЦИЯ И ЛК СТУДЕНТА / РОДИТЕЛЯ
    // ==========================================
    .addTag('Auth', 'Аутентификация: Magic Link (OTP) для учеников и логин администратора')
    .addTag('Student & Parent Portal (LK)', 'Личный кабинет студента и родителя (расписание, уроки, профиль)')

    // ==========================================
    // 3. 📖 СЛОВАРИ И СПРАВОЧНИКИ
    // ==========================================
    .addTag('Dictionary / Справочники', 'Словарь числовых кодов, статусов и типов данных. Интерактивная таблица: /docs/dictionary')

    .addTag('Admin — Dashboard / Home', 'Главный дашборд CRM и аналитическая сводка')
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
    .addTag('Admin — Notifications (Mail & Telegram)', 'Отправка писем и Telegram-уведомлений')
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

  if (process.env.GENERATE_OPENAPI === 'true' || process.env.EXPORT_OPENAPI === 'true') {
    const fs = await import('fs-extra');
    const path = await import('path');
    const swaggerJsonPath = path.join(process.cwd(), 'swagger.json');
    const docsOpenApiPath = path.join(process.cwd(), '../../docs/openapi.json');

    console.log(`[SWAGGER GENERATOR]: Exporting OpenAPI specification to: ${swaggerJsonPath}`);
    await fs.outputJson(swaggerJsonPath, document, { spaces: 2 });
    console.log(`[SWAGGER GENERATOR]: Exporting OpenAPI specification to: ${docsOpenApiPath}`);
    await fs.outputJson(docsOpenApiPath, document, { spaces: 2 });
    console.log('[SWAGGER GENERATOR]: OpenAPI specification exported successfully.');
    await app.close();
    process.exit(0);
  }

  SwaggerModule.setup('docs', app, document, {

    customSiteTitle: 'Atena School API Docs',
    customCss: `
      .topbar { display: flex !important; background-color: #191919 !important; padding: 10px 24px !important; }
      .topbar-wrapper { display: flex !important; width: 100% !important; justify-content: space-between !important; align-items: center !important; }
      .notion-swagger-btn {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        background: #FFFFFF !important;
        color: #37352F !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        padding: 6px 14px !important;
        border-radius: 4px !important;
        border: 1px solid #E9E9E7 !important;
        text-decoration: none !important;
        transition: background 0.15s ease !important;
      }
      .notion-swagger-btn:hover {
        background: #F7F6F3 !important;
      }
    `,
    customJsStr: `
      window.addEventListener('DOMContentLoaded', () => {
        const topbar = document.querySelector('.topbar-wrapper') || document.querySelector('.topbar');
        if (topbar && !document.getElementById('swagger-notion-btn')) {
          const btn = document.createElement('a');
          btn.id = 'swagger-notion-btn';
          btn.href = '/docs/dictionary';
          btn.target = '_blank';
          btn.className = 'notion-swagger-btn';
          btn.innerHTML = '<span>📖</span> <span>Словарь (Data Dictionary)</span>';
          topbar.appendChild(btn);
        }
      });
    `,
  });

  // Маршруты для страницы словаря в стиле Notion
  const fastify = app.getHttpAdapter().getInstance();
  const sendDictionary = (request: any, reply: any) => {
    const dictionaryService = app.get(DictionaryService);
    reply.type('text/html; charset=utf-8').send(dictionaryService.renderHtml());
  };

  fastify.get('/docs/dictionary', sendDictionary);
  fastify.get('/docs/dictionary/*', sendDictionary);
  fastify.get('/dictionary', sendDictionary);
  fastify.get('/dictionary/*', sendDictionary);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`\n============================================================`);
  console.log(`⚙️  Backend API:          http://localhost:${port}/v1`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(`📖 Data Dictionary (UI):  http://localhost:${port}/docs/dictionary`);
  console.log(`============================================================\n`);
}
bootstrap();
