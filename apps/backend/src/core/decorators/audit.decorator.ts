import { SetMetadata } from '@nestjs/common';

export interface AuditOptions {
  table: string;
  action: string;
}

export const Audit = (table: string, action: string) =>
  SetMetadata('audit_options', { table, action });
