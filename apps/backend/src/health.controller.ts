import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from './core/prisma/prisma.service';
import {
  getResendCredentials,
  getTelegramCredentials,
  getStripeCredentials,
  getSentryCredentials,
} from '@atena/core';

@ApiTags('System Health & Diagnostics')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Диагностика состояния API, базы данных и интеграций' })
  async check() {
    const start = Date.now();
    let dbStatus = 'connected';
    let latencyMs = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - start;
    } catch (err: any) {
      dbStatus = `error: ${err?.message || 'Database connection failed'}`;
    }

    const [resend, tg, stripe, sentry] = await Promise.all([
      getResendCredentials().then((c: any) => Boolean(c.apiKey)).catch(() => false),
      getTelegramCredentials().then((c: any) => Boolean(c.botToken && c.chatId)).catch(() => false),
      getStripeCredentials().then((c: any) => Boolean(c.secretKey)).catch(() => false),
      getSentryCredentials().then((c: any) => Boolean(c.dsn)).catch(() => false),
    ]);

    const memUsage = process.memoryUsage();
    const isHealthy = dbStatus === 'connected';

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      memory: {
        heapUsedMb: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
      },
      database: {
        status: dbStatus,
        latencyMs,
      },
      integrations: {
        resend,
        telegram: tg,
        stripe,
        sentry,
      },
    };
  }

  @Get('terminus')
  @HealthCheck()
  @ApiOperation({ summary: 'Стандартная детальная проверка здоровья NestJS Terminus' })
  async checkTerminus() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
    ]);
  }
}

