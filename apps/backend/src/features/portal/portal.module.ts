import { Module } from '@nestjs/common';
import { PortalController } from './portal.public.controller';
import { PortalService } from './portal.public.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PortalController],
  providers: [PortalService],
  exports: [PortalService],
})
export class PortalModule {}
