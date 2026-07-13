export class ActivityLogEntity {
  id: string;
  createdAt: Date;
  operatorId: string | null;
  operatorName: string;
  action: string;
  module: string;
  targetId: string | null;
  details: any;
  status: string;
}
