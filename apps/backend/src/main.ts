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

  // Базовая конфигурация Swagger DocumentBuilder
  const baseConfig = new DocumentBuilder()
    .setTitle('Atena School API')
    .setDescription(
      'Академическая система управления (CRM) Atena School (NestJS/Fastify)<br><br>' +
      '<div style="background: #F7F6F3; border: 1px solid #E9E9E7; border-radius: 6px; padding: 14px 18px; margin: 12px 0 16px 0; display: flex; align-items: center; justify-content: space-between; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">' +
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
    // 1. ЛЕНДИНГ И ЧЕКАУТ
    .addTag('Landing — Courses Catalog', 'Публичная витрина, каталог курсов, форматы (разово/подписка) и расписания')
    .addTag('Landing — Checkout & Payments', 'Оформление заказа: проверка взноса €30, Paga in Sede, Stripe Checkout и подписки')
    .addTag('Landing — Bookings & Receipts', 'Получение подтверждения бронирования, квитанции, уроков и платежей')
    .addTag('Landing — Settings & Gateways', 'Системные настройки лендинга (статус онлайн-оплаты Stripe и подписок)')
    .addTag('Landing — Contact & Leads', 'Форма обратной связи и входящие лиды')
    .addTag('Landing — Webhooks (Stripe)', 'Обработка асинхронных событий Stripe (оплаты, продление подписок, инвойсы)')
    .addTag('Forms — Public & Resolution', 'Публичное разрешение шаблонов форм и каталог динамических полей')
    // 2. АВТОРИЗАЦИЯ И ЛК СТУДЕНТА / РОДИТЕЛЯ
    .addTag('Auth', 'Аутентификация: Magic Link (OTP) для учеников и логин администратора')
    .addTag('Student & Parent Portal (LK)', 'Личный кабинет студента и родителя (расписание, уроки, профиль)')
    // 3. АДМИНКА И CRM
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
    .addTag('Admin — Integrations & Secrets', 'Управление ключами Stripe, Telegram, Resend и др.')
    .addTag('Admin — Forms Engine', 'Конструктор форм и каталог кастомных полей')
    .addTag('Dictionary / Справочники', 'Словарь числовых кодов, статусов и типов данных. Интерактивная таблица: /docs/dictionary')
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

  const fullDocument = SwaggerModule.createDocument(app, baseConfig);

  // Вспомогательная функция фильтрации разделов OpenAPI спецификации
  const createSubDocument = (
    filterFn: (path: string, tags: string[]) => boolean,
    title: string,
    description: string,
  ) => {
    const filteredPaths: Record<string, any> = {};
    const usedTags = new Set<string>();

    for (const [pathKey, pathItem] of Object.entries(fullDocument.paths || {})) {
      const operations = Object.values(pathItem as any);
      const opTags: string[] = [];
      for (const op of operations as any[]) {
        if (op && Array.isArray(op.tags)) {
          for (const t of op.tags) opTags.push(t);
        }
      }

      if (filterFn(pathKey, opTags)) {
        filteredPaths[pathKey] = pathItem;
        opTags.forEach((t) => usedTags.add(t));
      }
    }

    const filteredTags = (fullDocument.tags || []).filter((t: any) => usedTags.has(t.name));

    return {
      ...fullDocument,
      info: {
        ...fullDocument.info,
        title,
        description,
      },
      paths: filteredPaths,
      tags: filteredTags,
    };
  };

  // 1. Документ Лендинга и публичных API
  const landingDocument = createSubDocument(
    (path, tags) =>
      !path.startsWith('/admin') &&
      (path.startsWith('/landing') ||
        path.startsWith('/forms') ||
        path.startsWith('/courses') ||
        tags.some((t) => t.includes('Landing') || t.includes('Public') || t.includes('Webhook'))),
    '🌐 Atena School — Landing & Public API',
    'Публичные эндпоинты для лендинга: каталог курсов, чекаут, проверка взноса €30, формы и вебхуки Stripe.',
  );

  // 2. Документ Личного Кабинета (Portal / LK)
  const portalDocument = createSubDocument(
    (path, tags) =>
      !path.startsWith('/admin') &&
      (path.startsWith('/portal') ||
        path.startsWith('/auth') ||
        tags.some((t) => t.includes('Portal') || t.includes('Auth'))),
    '🎓 Atena School — Student & Parent Portal (LK)',
    'Эндпоинты личного кабинета ученика и родителя: Magic Link авторизация, профиль, расписание и история платежей.',
  );

  // 3. Документ Админки и CRM
  const adminDocument = createSubDocument(
    (path, tags) =>
      path.startsWith('/admin') ||
      path.startsWith('/notifications') ||
      path.startsWith('/integrations') ||
      path.startsWith('/users') ||
      tags.some((t) => t.startsWith('Admin') || t.includes('Dictionary') || t.includes('Engine')),
    '⚙️ Atena School — CRM & Admin Panel API',
    'Эндпоинты для секретариата и администрации: дашборд, студенты, POS-чекаут, уроки, журнал посещаемости, триггеры и настройки школы.',
  );

  if (process.env.GENERATE_OPENAPI === 'true' || process.env.EXPORT_OPENAPI === 'true') {
    const fs = await import('fs-extra');
    const path = await import('path');
    const swaggerJsonPath = path.join(process.cwd(), 'swagger.json');
    const docsOpenApiPath = path.join(process.cwd(), '../../docs/openapi.json');

    console.log(`[SWAGGER GENERATOR]: Exporting OpenAPI specification to: ${swaggerJsonPath}`);
    await fs.outputJson(swaggerJsonPath, fullDocument, { spaces: 2 });
    console.log(`[SWAGGER GENERATOR]: Exporting OpenAPI specification to: ${docsOpenApiPath}`);
    await fs.outputJson(docsOpenApiPath, fullDocument, { spaces: 2 });
    console.log('[SWAGGER GENERATOR]: OpenAPI specification exported successfully.');
    await app.close();
    process.exit(0);
  }

  // Общие стили и навигационная панель для всех разделов Swagger
  const createSwaggerCustomOptions = (activeTab: 'landing' | 'portal' | 'admin' | 'all') => ({
    customSiteTitle: `Atena School API Docs — ${activeTab.toUpperCase()}`,
    customCss: `
      .topbar { display: flex !important; background-color: #111827 !important; padding: 12px 24px !important; border-bottom: 1px solid #374151 !important; }
      .topbar-wrapper { display: flex !important; width: 100% !important; justify-content: space-between !important; align-items: center !important; flex-wrap: wrap !important; gap: 12px !important; }
      .topbar-wrapper .link { display: none !important; }
      .swagger-nav-container {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        flex-wrap: wrap !important;
      }
      .swagger-nav-tab {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        background: #1F2937 !important;
        color: #9CA3AF !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        padding: 7px 14px !important;
        border-radius: 6px !important;
        border: 1px solid #374151 !important;
        text-decoration: none !important;
        transition: all 0.15s ease-in-out !important;
      }
      .swagger-nav-tab:hover {
        background: #374151 !important;
        color: #F9FAFB !important;
        border-color: #4B5563 !important;
      }
      .swagger-nav-tab.active {
        background: #2563EB !important;
        color: #FFFFFF !important;
        border-color: #3B82F6 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
      }
      .swagger-nav-tab.dictionary-tab {
        background: #047857 !important;
        color: #FFFFFF !important;
        border-color: #059669 !important;
        margin-left: 8px !important;
      }
      .swagger-nav-tab.dictionary-tab:hover {
        background: #059669 !important;
      }
    `,
    customJsStr: `
      window.addEventListener('DOMContentLoaded', () => {
        const topbar = document.querySelector('.topbar-wrapper') || document.querySelector('.topbar');
        if (topbar && !document.getElementById('swagger-custom-nav')) {
          const nav = document.createElement('div');
          nav.id = 'swagger-custom-nav';
          nav.className = 'swagger-nav-container';
          nav.innerHTML = \`
            <a href="/docs/landing" class="swagger-nav-tab ${activeTab === 'landing' ? 'active' : ''}">🌐 Landing API</a>
            <a href="/docs/portal" class="swagger-nav-tab ${activeTab === 'portal' ? 'active' : ''}">🎓 Portal (ЛК)</a>
            <a href="/docs/admin" class="swagger-nav-tab ${activeTab === 'admin' ? 'active' : ''}">⚙️ CRM Admin</a>
            <a href="/docs" class="swagger-nav-tab ${activeTab === 'all' ? 'active' : ''}">📑 Все ручки (All)</a>
            <a href="/docs/dictionary" target="_blank" class="swagger-nav-tab dictionary-tab">📖 Словарь данных</a>
          \`;
          topbar.appendChild(nav);
        }
      });
    `,
  });

  // Настройка изолированных страниц Swagger
  SwaggerModule.setup('docs/landing', app, landingDocument, createSwaggerCustomOptions('landing'));
  SwaggerModule.setup('docs/portal', app, portalDocument, createSwaggerCustomOptions('portal'));
  SwaggerModule.setup('docs/admin', app, adminDocument, createSwaggerCustomOptions('admin'));
  SwaggerModule.setup('docs', app, fullDocument, createSwaggerCustomOptions('all'));

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
  console.log(`📚 Swagger Hub (All):     http://localhost:${port}/docs`);
  console.log(`🌐 Landing API Docs:      http://localhost:${port}/docs/landing`);
  console.log(`🎓 Portal (LK) Docs:      http://localhost:${port}/docs/portal`);
  console.log(`⚙️  CRM Admin Docs:        http://localhost:${port}/docs/admin`);
  console.log(`📖 Data Dictionary (UI):  http://localhost:${port}/docs/dictionary`);
  console.log(`============================================================\n`);
}
bootstrap();

