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
    const offset = (page - 1) * limit;

    const moduleFilter = params?.module ? `AND module ILIKE '%${params.module}%'` : '';
    const actionFilter = params?.action ? `AND action ILIKE '%${params.action}%'` : '';
    const searchFilter = params?.search
      ? `AND (operator_name ILIKE '%${params.search}%' OR module ILIKE '%${params.search}%' OR action ILIKE '%${params.search}%')`
      : '';

    try {
      const logs = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT id, created_at, operator_id, operator_name, action, module, target_id, details, status
        FROM activity_logs
        WHERE 1=1 ${moduleFilter} ${actionFilter} ${searchFilter}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `).catch(() => []);

      const countResult = await this.prisma.$queryRawUnsafe<any[]>(`
        SELECT COUNT(*)::int as total
        FROM activity_logs
        WHERE 1=1 ${moduleFilter} ${actionFilter} ${searchFilter}
      `).catch(() => [{ total: 0 }]);

      const total = countResult[0]?.total || 0;

      return {
        items: logs.map((l) => ({
          id: l.id,
          createdAt: l.created_at,
          operatorId: l.operator_id,
          operatorName: l.operator_name,
          action: l.action,
          module: l.module,
          targetId: l.target_id,
          details: l.details,
          status: l.status,
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
