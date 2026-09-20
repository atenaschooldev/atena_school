import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    module?: string;
    action?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.min(100, Math.max(1, Number(params?.limit || 20)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.module) {
      where.controller = { contains: params.module, mode: 'insensitive' };
    }
    if (params?.action) {
      where.action = { contains: params.action, mode: 'insensitive' };
    }
    if (params?.search) {
      where.OR = [
        { endpoint: { contains: params.search, mode: 'insensitive' } },
        { action: { contains: params.search, mode: 'insensitive' } },
        { controller: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    try {
      const [logs, total] = await Promise.all([
        this.prisma.admin_api_logs.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        }),
        this.prisma.admin_api_logs.count({ where }),
      ]);

      return {
        items: logs.map((l) => ({
          id: l.id,
          createdAt: l.createdAt,
          operatorId: l.userId,
          operatorName: l.user?.fullName || l.user?.email || 'Администратор',
          action: l.action,
          module: l.controller.replace(/Controller$/i, ''),
          targetId: (l.request as any)?.params?.id || null,
          details: {
            endpoint: l.endpoint,
            httpMethod: l.httpMethod,
            statusCode: l.statusCode,
            request: l.request,
            response: l.response,
            ipAddress: l.ipAddress,
          },
          status: l.statusCode < 400 ? 'success' : 'failed',
        })),
        total,
        page,
        limit,
      };
    } catch {
      return { items: [], total: 0, page, limit };
    }
  }
}
