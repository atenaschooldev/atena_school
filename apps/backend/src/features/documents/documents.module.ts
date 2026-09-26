import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsBackendService } from './documents.service';
import { SupabaseModule } from '../../core/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [DocumentsController],
  providers: [DocumentsBackendService],
  exports: [DocumentsBackendService],
})
export class DocumentsModule {}
