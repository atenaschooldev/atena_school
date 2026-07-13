import { DocumentEntity } from './document.entity';

export abstract class DocumentsRepository {
  abstract findMany(): Promise<DocumentEntity[]>;
  abstract findOne(id: string): Promise<DocumentEntity | null>;
  abstract create(data: {
    documentNumber: string;
    fileUrl?: string | null;
    studentName: string;
    studentEmail: string;
    parentName?: string | null;
    joiningDate?: Date;
    templateData: any;
  }): Promise<DocumentEntity>;
  abstract update(id: string, data: Partial<DocumentEntity>): Promise<DocumentEntity>;
  abstract delete(id: string): Promise<void>;
}
