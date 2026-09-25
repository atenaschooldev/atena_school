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
        }),
        this.prisma.admin_api_logs.count({ where }),
      ]);

      const userIds = Array.from(new Set(logs.map((l) => l.userId).filter((id): id is string => !!id)));
      const users = userIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true, fullName: true },
          })
        : [];
      const userMap = new Map(users.map((u) => [u.id, u]));

      return {
        items: logs.map((l) => {
          const u = l.userId ? userMap.get(l.userId) : null;
          return {
            id: l.id ? l.id.toString() : '',
            createdAt: l.createdAt,
            operatorId: l.userId,
            operatorName: u?.fullName || u?.email || 'Администратор',
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
          };
        }),
        total,
        page,
        limit,
      };
    } catch {
      return { items: [], total: 0, page, limit };
    }
  }
}
