import { Module } from '@nestjs/common';
import { ActiveServicesAdminController } from './active-services.admin.controller';
import { ActiveServicesAdminService } from './active-services.admin.service';

@Module({
  controllers: [ActiveServicesAdminController],
  providers: [ActiveServicesAdminService],
  exports: [ActiveServicesAdminService],
})
export class ActiveServicesModule {}
