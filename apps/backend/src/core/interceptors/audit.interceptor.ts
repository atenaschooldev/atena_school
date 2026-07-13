import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditOptions } from '../decorators/audit.decorator';
import { ActivityLogsRepository } from '../../features/activity_logs/domain/activity-logs.repository.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private readonly activityLogsRepository: ActivityLogsRepository,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>('audit_options', context.getHandler());
    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Получен из AuthGuard

    return next.handle().pipe(
      tap(async (result) => {
        // Логируем действие, если пользователь администратор
        if (user && user.role === 'admin') {
          try {
            let recordId: string | null = null;
            if (result && typeof result === 'object') {
              const keys = [
                'id',
                'course_id',
                'user_id',
                'student_id',
                'teacher_id',
                'parent_id',
                'schedule_id',
                'lesson_id',
                'enrollment_id',
              ];
              for (const key of keys) {
                if (result[key]) {
                  recordId = String(result[key]);
                  break;
                }
              }
            }

            const operatorName = user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.email || 'Admin Operator';

            await this.activityLogsRepository.create({
              operatorId: user.id,
              operatorName,
              action: auditOptions.action,
              module: auditOptions.table,
              targetId: recordId,
              details: result || {},
              status: 'success',
            });
          } catch (err) {
            console.error('Ошибка записи в аудит-лог:', err);
          }
        }
      }),
    );
  }
}
