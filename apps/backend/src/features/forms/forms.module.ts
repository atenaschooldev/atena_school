import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsAdminController, FormsPublicController } from './forms.controller';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FormsPublicController, FormsAdminController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
