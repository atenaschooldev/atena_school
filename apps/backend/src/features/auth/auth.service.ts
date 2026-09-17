import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto, MagicLinkDto } from './dto/login.dto';
import { UsersRepository } from './domain/users.repository.interface';

@Injectable()
export class AuthService {
  private supabaseAdmin: SupabaseClient;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl =
      this.configService.get<string>('SUPABASE_URL') ||
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL') ||
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      '';
    const serviceKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      '';
    this.supabaseAdmin = createClient(supabaseUrl, serviceKey);
  }

  async login(dto: LoginDto) {
    // Аутентификация через Supabase Auth
    try {
      const { data, error } = await this.supabaseAdmin.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

      if (error || !data.session || !data.user) {
        throw new UnauthorizedException('Неверный логин или пароль');
      }

      const user = data.user;
      const meta = user.user_metadata || {};
      const firstName = meta.first_name || meta.given_name || (user.email ? user.email.split('@')[0] : 'User');
      const lastName = meta.last_name || meta.family_name || 'Admin';
      const fullName = meta.full_name || `${firstName} ${lastName}`.trim();

      return {
        access_token: data.session.access_token,
        user: {
          id: user.id,
          role: user.role || 'admin',
          full_name: fullName,
          email: user.email,
        },
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Ошибка авторизации. Проверьте правильность логина и пароля.');
    }
  }

  async sendMagicLink(dto: MagicLinkDto) {
    const email = dto.email ? dto.email.trim().toLowerCase() : '';
    if (!email || !email.includes('@')) {
      throw new BadRequestException('A valid email address is required');
    }

    const siteUrl =
      this.configService.get<string>('NEXT_PUBLIC_SITE_URL') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://atena-school.vercel.app';

    const { error } = await this.supabaseAdmin.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/autenticazione/callback`,
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      message: `Magic Link successfully dispatched to ${email}`,
    };
  }
}
