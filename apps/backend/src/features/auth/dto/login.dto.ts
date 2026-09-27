import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@atenaschool.com', description: 'Email пользователя' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}

export class MagicLinkDto {
  @ApiProperty({ example: 'student@example.com', description: 'Email студента для отправки Magic Link' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_string', description: 'Supabase Refresh Token' })
  @IsString({ message: 'Refresh token должен быть строкой' })
  @IsNotEmpty({ message: 'Refresh token обязателен' })
  refresh_token: string;
}

