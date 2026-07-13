import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { WeasyPrintRendererService } from '../../shared/impl/weasyprint-renderer.service';
import { DocumentsRepository } from './domain/documents.repository.interface';
import { PrismaDocumentsRepository } from './impl/prisma-documents.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: 'DocumentRenderer',
      useClass: WeasyPrintRendererService,
    },
    {
      provide: DocumentsRepository,
      useClass: PrismaDocumentsRepository,
    },
  ],
  exports: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
