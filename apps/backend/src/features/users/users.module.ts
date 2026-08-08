import { Module } from '@nestjs/common';
import { UsersController } from './users.admin.controller';
import { UsersService } from './users.admin.service';
import { UsersRepository } from './domain/users.repository.interface';
import { PrismaUsersRepository } from './impl/prisma-users.repository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
