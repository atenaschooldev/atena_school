import { ActivityLogEntity } from './activity-log.entity';

export abstract class ActivityLogsRepository {
  abstract findMany(): Promise<ActivityLogEntity[]>;
  abstract create(data: {
    operatorId?: string | null;
    operatorName: string;
    action: string;
    module: string;
    targetId?: string | null;
    details: any;
    status?: string;
  }): Promise<ActivityLogEntity>;
}
