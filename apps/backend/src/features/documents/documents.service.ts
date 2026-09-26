import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../core/supabase/supabase.service';
import {
  DocumentCategoryRecord,
  DocumentCategoryType,
  DocumentLogAction,
  DocumentPaperFormat,
  DocumentRecord,
  DocumentStatus,
  DocumentTemplateRecord,
  DocumentTemplateType,
  DocumentType,
  GenerateDocumentDto,
  parseDocumentCategoryType,
  parseDocumentPaperFormat,
  parseDocumentStatus,
  parseDocumentTemplateType,
  parseDocumentType,
} from '@atena/api-types';
import { DocumentsService as CoreDocumentsService } from '@atena/core';

@Injectable()
export class DocumentsBackendService {
  private readonly logger = new Logger(DocumentsBackendService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private get client() {
    return this.supabaseService.clientInstance;
  }

  // --------------------------------------------------------------------------
  // Categories
  // --------------------------------------------------------------------------
  async getCategories(): Promise<DocumentCategoryRecord[]> {
    return CoreDocumentsService.getCategories(this.client);
  }

  async createCategory(dto: any): Promise<DocumentCategoryRecord> {
    return CoreDocumentsService.createCategory(this.client, dto);
  }

  async updateCategory(id: number, dto: any): Promise<DocumentCategoryRecord> {
    return CoreDocumentsService.updateCategory(this.client, id, dto);
  }

  async deleteCategory(id: number): Promise<boolean> {
    return CoreDocumentsService.deleteCategory(this.client, id);
  }

  // --------------------------------------------------------------------------
  // Templates
  // --------------------------------------------------------------------------
  async getTemplates(): Promise<DocumentTemplateRecord[]> {
    return CoreDocumentsService.getTemplates(this.client);
  }

  async createTemplate(dto: any): Promise<DocumentTemplateRecord> {
    return CoreDocumentsService.createTemplate(this.client, dto);
  }

  async duplicateTemplate(id: number): Promise<DocumentTemplateRecord> {
    return CoreDocumentsService.duplicateTemplate(this.client, id);
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return CoreDocumentsService.deleteTemplate(this.client, id);
  }

  async getTemplateById(id: number): Promise<DocumentTemplateRecord> {
    const { data, error } = await this.client
      .from('document_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return {
      ...data,
      template_type: parseDocumentTemplateType(data.template_type),
      category_type: parseDocumentCategoryType(data.category_type),
      document_type: parseDocumentType(data.document_type),
      paper_format: parseDocumentPaperFormat(data.paper_format),
    };
  }

  async updateTemplate(id: number, payload: Partial<DocumentTemplateRecord>): Promise<DocumentTemplateRecord> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined) updateData.description = payload.description;
    if (payload.category_type !== undefined) updateData.category_type = payload.category_type;
    if (payload.document_type !== undefined) updateData.document_type = payload.document_type;
    if (payload.recipient_type !== undefined) updateData.recipient_type = payload.recipient_type;
    if (payload.paper_format !== undefined) updateData.paper_format = payload.paper_format;
    if (payload.blocks_config !== undefined) updateData.blocks_config = payload.blocks_config;
    if (payload.available_variables !== undefined) updateData.available_variables = payload.available_variables;
    if (payload.header_html !== undefined) updateData.header_html = payload.header_html;
    if (payload.footer_html !== undefined) updateData.footer_html = payload.footer_html;
    if (payload.css_styles !== undefined) updateData.css_styles = payload.css_styles;
    if (payload.is_active !== undefined) updateData.is_active = payload.is_active;

    const { data, error } = await this.client
      .from('document_templates')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new BadRequestException(`Failed to update template: ${error?.message}`);
    }

    return {
      ...data,
      template_type: parseDocumentTemplateType(data.template_type),
      category_type: parseDocumentCategoryType(data.category_type),
      document_type: parseDocumentType(data.document_type),
      paper_format: parseDocumentPaperFormat(data.paper_format),
    };
  }

  // --------------------------------------------------------------------------
  // Documents Registry
  // --------------------------------------------------------------------------
  async getDocuments(filters?: {
    category_type?: DocumentCategoryType;
    document_type?: DocumentType;
    status?: DocumentStatus;
    search?: string;
    student_id?: string;
    booking_id?: string;
  }): Promise<DocumentRecord[]> {
    let query = this.client
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category_type) query = query.eq('category_type', filters.category_type);
    if (filters?.document_type) query = query.eq('document_type', filters.document_type);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.student_id) query = query.eq('student_id', filters.student_id);
    if (filters?.booking_id) query = query.eq('booking_id', filters.booking_id);

    if (filters?.search) {
      const s = `%${filters.search}%`;
      query = query.or(`document_number.ilike.${s},recipient_name.ilike.${s},recipient_email.ilike.${s},title.ilike.${s}`);
    }

    const { data, error } = await query;
    if (error) {
      this.logger.error('Failed to query documents:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      ...row,
      document_type: parseDocumentType(row.document_type),
      category_type: parseDocumentCategoryType(row.category_type),
      status: parseDocumentStatus(row.status),
      paper_format: parseDocumentPaperFormat(row.paper_format),
    }));
  }

  async getDocumentById(id: string): Promise<DocumentRecord> {
    const { data, error } = await this.client
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return {
      ...data,
      document_type: parseDocumentType(data.document_type),
      category_type: parseDocumentCategoryType(data.category_type),
      status: parseDocumentStatus(data.status),
      paper_format: parseDocumentPaperFormat(data.paper_format),
    };
  }

  async generateDocument(dto: GenerateDocumentDto, userId?: string): Promise<DocumentRecord> {
    return CoreDocumentsService.generateDocument(this.client, dto, userId);
  }

  async getAutofillData(dto: { bookingId?: string; studentId?: string; teacherId?: number }) {
    return CoreDocumentsService.extractAutofillData(this.client, dto);
  }

  async logDocumentAction(documentId: string, action: DocumentLogAction, userId?: string, metadata?: Record<string, any>) {
    return CoreDocumentsService.logAction(this.client, documentId, action, userId, metadata);
  }

  async getDocumentLogs(documentId?: string) {
    let query = this.client
      .from('document_logs')
      .select('*, documents(document_number, title, recipient_name)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (documentId) {
      query = query.eq('document_id', documentId);
    }

    const { data, error } = await query;
    if (error) {
      this.logger.error('Failed to query document logs:', error);
      return [];
    }

    return data || [];
  }

  async deleteLog(id: number): Promise<boolean> {
    return CoreDocumentsService.deleteLog(this.client, id);
  }

  async clearLogs(): Promise<boolean> {
    return CoreDocumentsService.clearLogs(this.client);
  }

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await this.client.from('documents').delete().eq('id', id);
    if (error) {
      throw new BadRequestException(`Failed to delete document: ${error.message}`);
    }
    return true;
  }
}
