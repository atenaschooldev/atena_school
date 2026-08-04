import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<{ table: string; action: string }>('audit', context.getHandler());
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const operatorName = user?.email || user?.fullName || 'Администратор';
    const operatorId = user?.id || null;

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const moduleName = auditOptions.table;
          const actionName = auditOptions.action;
          const targetId = request.params?.id || responseData?.id || null;
          const detailsJson = JSON.stringify({
            body: request.body || null,
            query: request.query || null,
          });

          await this.prisma.$executeRawUnsafe(`
            INSERT INTO activity_logs (id, created_at, operator_id, operator_name, action, module, target_id, details, status)
            VALUES (gen_random_uuid(), NOW(), ${operatorId ? `'${operatorId}'::uuid` : 'NULL'}, '${operatorName}', '${actionName}', '${moduleName}', ${targetId ? `'${targetId}'::uuid` : 'NULL'}, '${detailsJson}'::jsonb, 'success')
          `).catch(() => null);
        } catch {
          // Non-blocking audit log failure
        }
      }),
    );
  }
}
