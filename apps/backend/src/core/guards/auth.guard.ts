import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

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

    try {
      const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(token);
      if (!error && user) {
        request.user = {
          id: user.id,
          role: user.role || 'student',
          email: user.email,
          user_metadata: user.user_metadata,
        };

        // Auto-sync user to public.users table in TypeScript (replacing SQL trigger)
        const meta = user.user_metadata || {};
        const firstName = meta.first_name || meta.given_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || (user.email ? user.email.split('@')[0] : 'User');
        const lastName = meta.last_name || meta.family_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : '') || 'Student';
        const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

        this.supabaseAdmin.from('users').upsert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
        }, { onConflict: 'id' }).then(() => {}, () => {});

        return true;
      }

      // Fallback for decoded payload if getUser has latency
      const payload = jwt.decode(token) as any;
      if (payload && payload.sub) {
        request.user = {
          id: payload.sub,
          role: payload.role || 'student',
          email: payload.email,
          user_metadata: payload.user_metadata,
        };

        const meta = payload.user_metadata || {};
        const firstName = meta.first_name || meta.given_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || (payload.email ? payload.email.split('@')[0] : 'User');
        const lastName = meta.last_name || meta.family_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : '') || 'Student';
        const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

        this.supabaseAdmin.from('users').upsert({
          id: payload.sub,
          email: payload.email,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
        }, { onConflict: 'id' }).then(() => {}, () => {});

        return true;
      }

      throw new UnauthorizedException('Невалидный или просроченный токен');
    } catch (err) {
      throw new UnauthorizedException('Невалидный или просроченный токен');
    }
  }
}
