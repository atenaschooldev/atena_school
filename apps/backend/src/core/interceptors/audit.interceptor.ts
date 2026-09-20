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

    (request as any).audit = auditOptions;

    return next.handle();
  }
}
