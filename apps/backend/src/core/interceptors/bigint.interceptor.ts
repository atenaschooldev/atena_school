import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Deeply transforms an object or array, converting BigInt values into standard JSON-serializable Numbers.
 */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'bigint') {
    return Number(obj) as any;
  }
  if (typeof obj === 'object' && ('d' in (obj as any) && 'e' in (obj as any) && 's' in (obj as any))) {
    return Number((obj as any).toString()) as any;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => serializeBigInt(item)) as any;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const res: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      res[key] = typeof value === 'bigint' ? Number(value) : serializeBigInt(value);
    }
    return res as any;
  }
  return obj;
}

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => serializeBigInt(data)));
  }
}
