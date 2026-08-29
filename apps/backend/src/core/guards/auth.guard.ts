import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  private supabaseAdmin: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
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

    // Allow test token in non-production environments for local development
    if (process.env.NODE_ENV !== 'production' && token === 'DEVELOPMENT_TEST_TOKEN') {
      this.logger.warn('Development test token bypass used for request');
      request.user = {
        id: '00000000-0000-0000-0000-000000000000',
        role: 'admin',
        full_name: 'Marco Rossi (Test)',
        email: 'test@atenaschool.com',
      };
      return true;
    }

    try {
      const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        throw new UnauthorizedException('Невалидный или просроченный токен');
      }

      const userRole = user.user_metadata?.role || user.user_metadata?.app_role || (user.role && user.role !== 'authenticated' ? user.role : 'admin');

      request.user = {
        id: user.id,
        role: userRole,
        email: user.email,
        user_metadata: user.user_metadata,
      };

      // Sync user profile to public.users table using Prisma
      const meta = user.user_metadata || {};
      const firstName = meta.first_name || meta.given_name || (meta.full_name ? meta.full_name.split(' ')[0] : '') || (user.email ? user.email.split('@')[0] : 'User');
      const lastName = meta.last_name || meta.family_name || (meta.full_name ? meta.full_name.split(' ').slice(1).join(' ') : '') || 'Student';
      const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

      try {
        await this.prisma.user.upsert({
          where: { id: user.id },
          create: {
            id: user.id,
            email: user.email || '',
            firstName: firstName,
            lastName: lastName,
            full_name: fullName,
            role: userRole,
          },
          update: {
            email: user.email || '',
            firstName: firstName,
            lastName: lastName,
            full_name: fullName,
            role: userRole,
          },
        });
      } catch (err: any) {
        this.logger.error(`Failed to sync user profile for ${user.id}: ${err?.message || err}`);
      }

      return true;
    } catch (err) {
      throw new UnauthorizedException('Невалидный или просроченный токен');
    }
  }
}
