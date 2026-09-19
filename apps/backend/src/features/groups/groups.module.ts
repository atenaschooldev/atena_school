import { Module } from '@nestjs/common';
import { GroupsController } from './groups.admin.controller';
import { GroupsService } from './groups.admin.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
