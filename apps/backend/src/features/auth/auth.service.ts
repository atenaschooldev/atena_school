import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
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
}
