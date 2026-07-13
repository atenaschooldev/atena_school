import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from './domain/users.repository.interface';

@Injectable()
export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async login(dto: LoginDto) {
    // Временный mock-логин для локальной разработки
    if (dto.email === 'admin@atenaschool.it' && dto.password === 'password123') {
      let user = await this.usersRepository.findByEmail(dto.email);
      if (!user) {
        user = await this.usersRepository.create({
          id: '00000000-0000-0000-0000-000000000000',
          email: dto.email,
          firstName: 'Marco',
          lastName: 'Rossi (Test)',
          role: 'admin',
        });
      }
      return {
        access_token: 'DEVELOPMENT_TEST_TOKEN',
        user: {
          id: user.id,
          role: user.role,
          full_name: `${user.firstName} ${user.lastName}`,
          email: user.email,
        },
      };
    }

    // В будущем здесь будет проверка токена / авторизация:
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }
    
    // Тут выполняем верификацию пароля
    return {
      access_token: 'MOCK_TOKEN',
      user: {
        id: user.id,
        role: user.role,
        full_name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    };
  }
}
