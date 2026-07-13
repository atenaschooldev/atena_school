import { Injectable, Inject } from '@nestjs/common';
import { DocumentRenderer } from '../../shared/abstractions/document-renderer.interface';
import { DocumentsRepository } from './domain/documents.repository.interface';

@Injectable()
export class DocumentsService {
  constructor(
    @Inject('DocumentRenderer')
    private readonly renderer: DocumentRenderer,
    private readonly documentsRepository: DocumentsRepository,
  ) {}

  async listDocuments() {
    const list = await this.documentsRepository.findMany();
    return list.map((d) => ({
      id: d.id,
      document_type: 'contract',
      language: 'it',
      status: 'generated',
      created_at: d.joiningDate.toISOString(),
      document_number: d.documentNumber,
      file_url: d.fileUrl,
      student_name: d.studentName,
      student_email: d.studentEmail,
      parent_name: d.parentName,
    }));
  }

  async generateDocument(dto: any) {
    const { document_type, data, language = 'it' } = dto;

    const pdfBuffer = await this.renderer.render(document_type, data, language);

    // Генерируем уникальный номер документа
    const docNumber = dto.document_number || `doc-${Date.now()}`;
    const studentName = data.student_name || data.full_name || 'Student Student';
    const studentEmail = data.student_email || data.email || 'student@atenaschool.it';
    const parentName = data.parent_name || null;

    const d = await this.documentsRepository.create({
      documentNumber: docNumber,
      studentName,
      studentEmail,
      parentName,
      templateData: data,
    });

    const metadata = {
      id: d.id,
      document_type,
      language,
      status: 'generated',
      created_at: d.joiningDate.toISOString(),
      document_number: d.documentNumber,
      file_url: d.fileUrl,
      student_name: d.studentName,
      student_email: d.studentEmail,
      parent_name: d.parentName,
    };

    return {
      metadata,
      fileBase64: pdfBuffer.toString('base64'),
    };
  }
}
