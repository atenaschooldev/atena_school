import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { ActivityLogEntity } from '../domain/activity-log.entity';
import { ActivityLogsRepository } from '../domain/activity-logs.repository.interface';

@Injectable()
export class PrismaActivityLogsRepository implements ActivityLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<ActivityLogEntity[]> {
    const list = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return list.map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      operatorId: l.operatorId,
      operatorName: l.operatorName,
      action: l.action,
      module: l.module,
      targetId: l.targetId,
      details: l.details,
      status: l.status,
    }));
  }

  async create(data: {
    operatorId?: string | null;
    operatorName: string;
    action: string;
    module: string;
    targetId?: string | null;
    details: any;
    status?: string;
  }): Promise<ActivityLogEntity> {
    const l = await this.prisma.activityLog.create({
      data: {
        operatorId: data.operatorId || null,
        operatorName: data.operatorName,
        action: data.action,
        module: data.module,
        targetId: data.targetId || null,
        details: data.details || {},
        status: data.status || 'success',
      },
    });

    return {
      id: l.id,
      createdAt: l.createdAt,
      operatorId: l.operatorId,
      operatorName: l.operatorName,
      action: l.action,
      module: l.module,
      targetId: l.targetId,
      details: l.details,
      status: l.status,
    };
  }
}
