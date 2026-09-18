import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { parseUserRole } from '@atena/api-types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<any[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Если роли не указаны, доступ разрешен всем аутентифицированным пользователям
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('У вас недостаточно прав для выполнения этого действия');
    }

    const userNumericRole = parseUserRole(user.role);
    const isAllowed = requiredRoles.some((req) => {
      const parsedReq = parseUserRole(req);
      return (
        parsedReq === userNumericRole ||
        String(req).toLowerCase() === String(user.role).toLowerCase() ||
        String(req).toLowerCase() === String(user.rawRole ?? '').toLowerCase()
      );
    });

    if (!isAllowed) {
      throw new ForbiddenException('У вас недостаточно прав для выполнения этого действия');
    }
    return true;
  }
}
