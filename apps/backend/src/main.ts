import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import fastifyHelmet from '@fastify/helmet';

import { DictionaryService } from './features/dictionary/dictionary.service';
import { BigIntInterceptor } from './core/interceptors/bigint.interceptor';

// Enable automatic JSON serialization for BigInt (Prisma BIGSERIAL / int8 IDs)
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

class CleanNestLogger extends ConsoleLogger {
  log(message: any, context?: string) {
    // Filter out internal NestJS 300+ line dependency initialization spam
    if (context === 'InstanceLoader' || context === 'RoutesResolver' || context === 'RouterExplorer') {
      return;
    }
    super.log(message, context);
  }
}

async function bootstrap() {
  // Инициализация адаптера Fastify с увеличенным лимитом размера тела запроса (10MB) и подписью rawBody для Stripe
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 10485760, rawBody: true } as any),
    {
      logger: new CleanNestLogger(),
    },
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

  // Глобальный перехватчик для автоматической сериализации BigInt в Number
  app.useGlobalInterceptors(new BigIntInterceptor());

  // Глобальная валидация DTO через class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Генератор карточки навигации в описании документа
  const createNavDescription = (
    activeTab: 'landing' | 'portal' | 'admin' | 'all',
    subtitle: string,
  ) => `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin-bottom: 20px;">
  <p style="font-size: 14px; color: #4B5563; margin: 0 0 16px 0;">${subtitle}</p>

  <div style="background: #111827; border: 1px solid #374151; border-radius: 8px; padding: 14px 18px; margin: 12px 0 20px 0;">
    <div style="color: #9CA3AF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">
      ⚡️ Разделы документации API (Быстрое переключение):
    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
      <a href="/docs/landing" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'landing' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'landing' ? '#3B82F6' : '#374151'};">
        🌐 Landing & Public API
      </a>
      <a href="/docs/portal" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'portal' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'portal' ? '#3B82F6' : '#374151'};">
        🎓 Student Portal (ЛК)
      </a>
      <a href="/docs/admin" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'admin' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'admin' ? '#3B82F6' : '#374151'};">
        ⚙️ CRM Admin
      </a>
      <a href="/docs" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'all' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'all' ? '#3B82F6' : '#374151'};">
        📑 Все ручки (All)
      </a>
      <a href="/docs/dictionary" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #047857; color: #FFFFFF; font-weight: 600; font-size: 13px; padding: 8px 14px; border-radius: 6px; text-decoration: none; border: 1px solid #059669; margin-left: auto;">
        📖 Словарь данных →
      </a>
    </div>
  </div>
</div>
`;

  // Базовая конфигурация Swagger DocumentBuilder
  const baseConfig = new DocumentBuilder()
    .setTitle('Atena School API')
    .setDescription(
      createNavDescription(
        'all',
        'Полная спецификация REST API платформы Atena School (NestJS / Fastify).',
      ),
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
    createNavDescription(
      'landing',
      'Публичные эндпоинты для лендинга: каталог курсов, чекаут, проверка взноса €30, формы и вебхуки Stripe.',
    ),
  );

  // 2. Документ Личного Кабинета (Portal / LK)
  const portalDocument = createSubDocument(
    (path, tags) =>
      !path.startsWith('/admin') &&
      (path.startsWith('/portal') ||
        path.startsWith('/auth') ||
        tags.some((t) => t.includes('Portal') || t.includes('Auth'))),
    '🎓 Atena School — Student & Parent Portal (LK)',
    createNavDescription(
      'portal',
      'Эндпоинты личного кабинета ученика и родителя: Magic Link авторизация, профиль, расписание и история платежей.',
    ),
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
    createNavDescription(
      'admin',
      'Эндпоинты для секретариата и администрации: дашборд, студенты, POS-чекаут, уроки, журнал посещаемости, триггеры и настройки школы.',
    ),
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
  const createSwaggerCustomOptions = (activeTab: 'landing' | 'portal' | 'admin' | 'all') => {
    return {
      customSiteTitle: `Atena School API Docs — ${activeTab.toUpperCase()}`,
      customCss: `
        #atena-sticky-header a:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
        }
      `,
      customJsStr: `
        (function() {
          function injectHeader() {
            if (document.getElementById('atena-sticky-header')) return;
            var header = document.createElement('div');
            header.id = 'atena-sticky-header';
            header.style.cssText = 'position: sticky; top: 0; left: 0; right: 0; z-index: 999999; background: #111827; border-bottom: 2px solid #374151; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
            header.innerHTML = \`
              <div style="font-weight: 700; color: #F9FAFB; font-size: 15px; display: flex; align-items: center; gap: 8px;">
                🏛 Atena School API Docs
              </div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <a href="/docs/landing" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'landing' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'landing' ? '#3B82F6' : '#374151'}; transition: all 0.15s ease;">🌐 Landing</a>
                <a href="/docs/portal" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'portal' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'portal' ? '#3B82F6' : '#374151'}; transition: all 0.15s ease;">🎓 Portal (ЛК)</a>
                <a href="/docs/admin" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'admin' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'admin' ? '#3B82F6' : '#374151'}; transition: all 0.15s ease;">⚙️ CRM Admin</a>
                <a href="/docs" style="display: inline-flex; align-items: center; gap: 6px; background: ${activeTab === 'all' ? '#2563EB' : '#1F2937'}; color: #FFFFFF; font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 6px; text-decoration: none; border: 1px solid ${activeTab === 'all' ? '#3B82F6' : '#374151'}; transition: all 0.15s ease;">📑 Все ручки</a>
                <a href="/docs/dictionary" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #047857; color: #FFFFFF; font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 6px; text-decoration: none; border: 1px solid #059669; transition: all 0.15s ease;">📖 Словарь</a>
              </div>
            \`;
            if (document.body) {
              document.body.insertBefore(header, document.body.firstChild);
            }
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectHeader);
          } else {
            injectHeader();
          }
          setInterval(injectHeader, 400);
        })();
      `,
    };
  };

  // Настройка изолированных страниц Swagger
  SwaggerModule.setup('docs/landing', app, landingDocument, createSwaggerCustomOptions('landing'));
  SwaggerModule.setup('docs/portal', app, portalDocument, createSwaggerCustomOptions('portal'));
  SwaggerModule.setup('docs/admin', app, adminDocument, createSwaggerCustomOptions('admin'));
  SwaggerModule.setup('docs', app, fullDocument, createSwaggerCustomOptions('all'));

  // Маршруты для отдачи OpenAPI JSON спецификаций напрямую
  const fastify = app.getHttpAdapter().getInstance();
  fastify.get('/docs/openapi.json', (req: any, reply: any) => reply.send(fullDocument));
  fastify.get('/docs/openapi-landing.json', (req: any, reply: any) => reply.send(landingDocument));
  fastify.get('/docs/openapi-portal.json', (req: any, reply: any) => reply.send(portalDocument));
  fastify.get('/docs/openapi-admin.json', (req: any, reply: any) => reply.send(adminDocument));

  // Маршруты для страницы словаря в стиле Notion
  const sendDictionary = (request: any, reply: any) => {
    const dictionaryService = app.get(DictionaryService);
    reply.type('text/html; charset=utf-8').send(dictionaryService.renderHtml());
  };

  fastify.get('/docs/dictionary', sendDictionary);
  fastify.get('/docs/dictionary/*', sendDictionary);
  fastify.get('/dictionary', sendDictionary);
  fastify.get('/dictionary/*', sendDictionary);

  const port = Number(process.env.PORT) || 4000;
  try {
    // Bind to dual-stack IPv6 (::) so macOS Chrome connects to both localhost (::1) and 127.0.0.1
    await app.listen(port, '::');
  } catch {
    await app.listen(port, '0.0.0.0');
  }

  const isProdDb = process.env.SUPABASE_URL?.includes('jnfbfihzpplyersbhkch');
  const envBadge = isProdDb ? '🟢 PROD (jnfbfihz)' : '🟡 DEV (hcxpfzsm)';

  console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════════════════════╗\x1b[0m
\x1b[36m║\x1b[0m  \x1b[1m\x1b[32m🚀 ATENA SCHOOL ECOSYSTEM\x1b[0m — [${envBadge}]
\x1b[36m╠════════════════════════════════════════════════════════════════════════════╣\x1b[0m
\x1b[36m║\x1b[0m  🌐 \x1b[1mLanding & Checkout:\x1b[0m    \x1b[34mhttp://localhost:3000\x1b[0m                  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  🏢 \x1b[1mAdmin CRM (Панель):\x1b[0m    \x1b[35mhttp://localhost:3001\x1b[0m                  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  🎓 \x1b[1mStudent LK (Кабинет):\x1b[0m  \x1b[33mhttp://localhost:3002\x1b[0m                  \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  ⚙️  \x1b[1mBackend REST API:\x1b[0m      \x1b[32mhttp://localhost:${port}/v1\x1b[0m               \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  📚 \x1b[1mSwagger Hub (Docs):\x1b[0m    \x1b[34mhttp://localhost:${port}/docs\x1b[0m             \x1b[36m║\x1b[0m
\x1b[36m║\x1b[0m  📖 \x1b[1mData Dictionary:\x1b[0m       \x1b[34mhttp://localhost:${port}/docs/dictionary\x1b[0m  \x1b[36m║\x1b[0m
\x1b[36m╚════════════════════════════════════════════════════════════════════════════╝\x1b[0m
`);
}
bootstrap();

