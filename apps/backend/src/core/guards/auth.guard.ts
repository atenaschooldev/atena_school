import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Неверный формат заголовка авторизации');
    }

    const token = authHeader.split(' ')[1];

    // Тестовый токен для локальной разработки
    if (token === 'DEVELOPMENT_TEST_TOKEN') {
      request.user = {
        id: '00000000-0000-0000-0000-000000000000',
        role: 'admin',
        full_name: 'Marco Rossi (Test)',
        email: 'test@atenaschool.it',
      };
      return true;
    }

    const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET') || 'your_jwt_secret';

    try {
      const payload = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
        audience: 'authenticated',
      }) as any;

      const userId = payload.sub;
      if (!userId) {
        throw new UnauthorizedException('В токене отсутствует ID пользователя');
      }

      // На этапе кодовой базы без схемы БД мы сохраняем декодированный профиль пользователя из токена
      request.user = {
        id: userId,
        role: payload.role || 'student', // Роль в токене (по умолчанию student)
        email: payload.email,
        full_name: payload.user_metadata?.full_name || 'Atena User',
      };

      return true;
    } catch (err) {
      throw new UnauthorizedException('Невалидный или просроченный токен');
    }
  }
}
