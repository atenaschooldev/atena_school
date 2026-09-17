import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, MagicLinkDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller(['auth', 'landing/auth', 'admin/auth', 'app/auth'])
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему (Supabase Auth)' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход и возврат JWT-токена',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'admin@atenaschool.com',
          role: 'admin',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('magic-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отправка Magic Link (Supabase OTP) для входа студента / родителя' })
  @ApiResponse({
    status: 200,
    description: 'Magic link успешно отправлен на указанный email',
    schema: {
      example: {
        success: true,
        message: 'Magic Link successfully dispatched to mario.rossi@gmail.com',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Некорректный email адрес' })
  async sendMagicLink(@Body() dto: MagicLinkDto) {
    return this.authService.sendMagicLink(dto);
  }
}
