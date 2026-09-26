import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  Header,
} from '@nestjs/common';
import { DocumentsBackendService } from './documents.service';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RolesGuard } from '../../core/guards/roles.guard';
import { Roles } from '../../core/decorators/roles.decorator';
import {
  DocumentCategoryType,
  DocumentLogAction,
  DocumentStatus,
  DocumentType,
  GenerateDocumentDto,
  parseDocumentCategoryType,
  parseDocumentStatus,
  parseDocumentType,
} from '@atena/api-types';

@Controller('admin/documents')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'secretary', 'director', 'superadmin')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsBackendService) {}

  @Get('categories')
  async getCategories() {
    return this.documentsService.getCategories();
  }

  @Get('templates')
  async getTemplates() {
    return this.documentsService.getTemplates();
  }

  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string) {
    return this.documentsService.getTemplateById(Number(id));
  }

  @Put('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() body: any) {
    return this.documentsService.updateTemplate(Number(id), body);
  }

  @Get('autofill')
  async getAutofillData(
    @Query('bookingId') bookingId?: string,
    @Query('studentId') studentId?: string,
    @Query('teacherId') teacherId?: string
  ) {
    return this.documentsService.getAutofillData({
      bookingId,
      studentId,
      teacherId: teacherId ? Number(teacherId) : undefined,
    });
  }

  @Get()
  async getDocuments(
    @Query('category_type') categoryType?: string,
    @Query('document_type') documentType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('student_id') studentId?: string,
    @Query('booking_id') bookingId?: string
  ) {
    return this.documentsService.getDocuments({
      category_type: categoryType ? parseDocumentCategoryType(categoryType) : undefined,
      document_type: documentType ? parseDocumentType(documentType) : undefined,
      status: status ? parseDocumentStatus(status) : undefined,
      search,
      student_id: studentId,
      booking_id: bookingId,
    });
  }

  @Get('logs')
  async getDocumentLogs(@Query('document_id') documentId?: string) {
    return this.documentsService.getDocumentLogs(documentId);
  }

  @Get(':id')
  async getDocumentById(@Param('id') id: string) {
    return this.documentsService.getDocumentById(id);
  }

  @Get(':id/render')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async renderDocumentHtml(@Param('id') id: string, @Req() req: any) {
    const doc = await this.documentsService.getDocumentById(id);
    await this.documentsService.logDocumentAction(id, DocumentLogAction.VIEWED, req.user?.id);
    return doc.rendered_html;
  }

  @Post('generate')
  async generateDocument(@Body() dto: GenerateDocumentDto, @Req() req: any) {
    return this.documentsService.generateDocument(dto, req.user?.id);
  }

  @Post(':id/log')
  async logAction(
    @Param('id') id: string,
    @Body('action') action: number,
    @Body('metadata') metadata: any,
    @Req() req: any
  ) {
    await this.documentsService.logDocumentAction(id, action as DocumentLogAction, req.user?.id, metadata);
    return { success: true };
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    await this.documentsService.deleteDocument(id);
    return { success: true };
  }
}
