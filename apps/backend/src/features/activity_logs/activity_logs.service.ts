import { Injectable } from '@nestjs/common';
import { ActivityLogsRepository } from './domain/activity-logs.repository.interface';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly activityLogsRepository: ActivityLogsRepository) {}

  async getLogs() {
    const list = await this.activityLogsRepository.findMany();
    return list.map((l) => this.mapResponse(l));
  }

  private mapResponse(l: any) {
    return {
      log_id: l.id,
      user_id: l.operatorId || '00000000-0000-0000-0000-000000000000',
      operator_name: l.operatorName,
      action: l.action,
      table_name: l.module,
      record_id: l.targetId,
      created_at: l.createdAt.toISOString(),
      details: l.details,
      status: l.status,
    };
  }
}
