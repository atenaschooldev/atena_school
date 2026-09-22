import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormFieldsService } from './form-fields.service';
import { FormsAdminController, FormsPublicController } from './forms.controller';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [FormsPublicController, FormsAdminController],
  providers: [FormsService, FormFieldsService],
  exports: [FormsService, FormFieldsService],
})
export class FormsModule {}

