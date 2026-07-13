import { Controller, Get, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import { Audit } from '../../core/decorators/audit.decorator';
import { AuditInterceptor } from '../../core/interceptors/audit.interceptor';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(AuditInterceptor)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles('admin', 'teacher')
  @ApiOperation({ summary: 'Получить список сгенерированных документов' })
  async listDocuments() {
    return this.documentsService.listDocuments();
  }

  @Post('generate')
  @Roles('admin')
  @Audit('documents', 'generate')
  @ApiOperation({ summary: 'Сгенерировать PDF-документ на основе шаблона (WeasyPrint)' })
  async generateDocument(@Body() dto: any) {
    return this.documentsService.generateDocument(dto);
  }
}
