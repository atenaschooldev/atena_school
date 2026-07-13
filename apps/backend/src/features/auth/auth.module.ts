import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersRepository } from './domain/users.repository.interface';
import { PrismaUsersRepository } from './impl/prisma-users.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [AuthService, UsersRepository],
})
export class AuthModule {}
