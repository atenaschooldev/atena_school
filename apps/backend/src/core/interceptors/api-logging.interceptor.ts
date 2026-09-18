import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const controllerName = context.getClass()?.name || 'UnknownController';
    const actionName = context.getHandler()?.name || 'unknownAction';
    const httpMethod = request.method || 'GET';
    const url = request.url || request.originalUrl || '';

    // Ignore noisy static docs and health endpoints
    if (url.startsWith('/docs') || url.startsWith('/favicon.ico')) {
      return next.handle();
    }

    const ipAddress = request.ip || request.headers?.['x-forwarded-for'] || request.socket?.remoteAddress || null;
    const userAgent = request.headers?.['user-agent'] || null;
    const user = request.user || null;
    const userId = user?.id || null;
    const userRole = typeof user?.role === 'number' ? user.role : null;

    // Mask sensitive parameters in request payload
    const sanitize = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      try {
        const cloned = JSON.parse(JSON.stringify(obj));
        const sensitiveKeys = ['password', 'token', 'refreshToken', 'secret', 'cardNumber', 'cvc'];
        const walk = (target: any) => {
          if (!target || typeof target !== 'object') return;
          for (const key of Object.keys(target)) {
            if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
              target[key] = '***MASKED***';
            } else if (typeof target[key] === 'object') {
              walk(target[key]);
            }
          }
        };
        walk(cloned);
        return cloned;
      } catch {
        return obj;
      }
    };

    const requestPayload = {
      params: sanitize(request.params),
      query: sanitize(request.query),
      body: sanitize(request.body),
    };

    const targetTable = this.resolveTargetTable(url, controllerName, userRole);

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const finalTable = this.resolveTargetTable(url, controllerName, userRole, responseData);
          const statusCode = response?.statusCode || 200;
          this.saveLog(finalTable, {
            controller: controllerName,
            action: actionName,
            httpMethod,
            endpoint: url,
            userId,
            userRole,
            ipAddress,
            userAgent,
            request: requestPayload,
            response: sanitize(responseData),
            statusCode,
          });
        },
        error: (err) => {
          const statusCode = err?.status || err?.statusCode || 500;
          const errorResponse = {
            message: err?.message || 'Internal server error',
            error: err?.name || 'Error',
            statusCode,
          };
          this.saveLog(targetTable, {
            controller: controllerName,
            action: actionName,
            httpMethod,
            endpoint: url,
            userId,
            userRole,
            ipAddress,
            userAgent,
            request: requestPayload,
            response: errorResponse,
            statusCode,
          });
        },
      }),
    );
  }

  private resolveTargetTable(
    url: string,
    controllerName: string,
    userRole: number | null,
    responseData?: any,
  ): 'admin_api_logs' | 'app_api_logs' | 'landing_api_logs' {
    // 1. Explicit Landing endpoints & controllers
    if (
      url.startsWith('/landing') ||
      url.startsWith('/api/landing') ||
      controllerName.includes('Public') ||
      controllerName === 'StripeWebhookController'
    ) {
      return 'landing_api_logs';
    }

    // 2. Explicit App / Student Portal endpoints & controllers
    if (
      url.startsWith('/app') ||
      url.startsWith('/portal') ||
      url.startsWith('/api/app') ||
      url.startsWith('/api/portal') ||
      controllerName.includes('Portal')
    ) {
      return 'app_api_logs';
    }

    // 3. Auth login dynamic role detection if available
    if (url.includes('/auth/login') && responseData?.user?.role) {
      const respRole = responseData.user.role;
      if (respRole === 1 || respRole === 4 || respRole === 'student' || respRole === 'parent') {
        return 'app_api_logs';
      }
      return 'admin_api_logs';
    }

    // 4. Role based check (Student / Parent -> App, Staff / Admin -> Admin)
    if (userRole === 1 || userRole === 4) {
      return 'app_api_logs';
    }

    // 5. Default fallback for backend CRM / Admin operations
    return 'admin_api_logs';
  }

  private async saveLog(
    table: 'admin_api_logs' | 'app_api_logs' | 'landing_api_logs',
    data: {
      controller: string;
      action: string;
      httpMethod: string;
      endpoint: string;
      userId: string | null;
      userRole: number | null;
      ipAddress: string | null;
      userAgent: string | null;
      request: any;
      response: any;
      statusCode: number;
    },
  ) {
    try {
      if (table === 'admin_api_logs') {
        await this.prisma.admin_api_logs.create({ data });
      } else if (table === 'app_api_logs') {
        await this.prisma.app_api_logs.create({ data });
      } else {
        await this.prisma.landing_api_logs.create({ data });
      }
    } catch {
      // Non-blocking logger failure
    }
  }
}
