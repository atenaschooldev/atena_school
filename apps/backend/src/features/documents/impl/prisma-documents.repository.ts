import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { DocumentEntity } from '../domain/document.entity';
import { DocumentsRepository } from '../domain/documents.repository.interface';

@Injectable()
export class PrismaDocumentsRepository implements DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(): Promise<DocumentEntity[]> {
    const list = await this.prisma.document.findMany({
      orderBy: { joiningDate: 'desc' },
    });
    return list.map((d) => this.mapToEntity(d));
  }

  async findOne(id: string): Promise<DocumentEntity | null> {
    const d = await this.prisma.document.findUnique({
      where: { id },
    });
    if (!d) return null;
    return this.mapToEntity(d);
  }

  async create(data: {
    documentNumber: string;
    fileUrl?: string | null;
    studentName: string;
    studentEmail: string;
    parentName?: string | null;
    joiningDate?: Date;
    templateData: any;
  }): Promise<DocumentEntity> {
    const d = await this.prisma.document.create({
      data: {
        documentNumber: data.documentNumber,
        fileUrl: data.fileUrl || null,
        studentName: data.studentName,
        studentEmail: data.studentEmail,
        parentName: data.parentName || null,
        joiningDate: data.joiningDate || new Date(),
        templateData: data.templateData,
      },
    });
    return this.mapToEntity(d);
  }

  async update(id: string, data: Partial<DocumentEntity>): Promise<DocumentEntity> {
    const updateData: any = {};
    if (data.documentNumber !== undefined) updateData.documentNumber = data.documentNumber;
    if (data.fileUrl !== undefined) updateData.fileUrl = data.fileUrl;
    if (data.studentName !== undefined) updateData.studentName = data.studentName;
    if (data.studentEmail !== undefined) updateData.studentEmail = data.studentEmail;
    if (data.parentName !== undefined) updateData.parentName = data.parentName;
    if (data.joiningDate !== undefined) updateData.joiningDate = data.joiningDate;
    if (data.templateData !== undefined) updateData.templateData = data.templateData;

    const d = await this.prisma.document.update({
      where: { id },
      data: updateData,
    });
    return this.mapToEntity(d);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({
      where: { id },
    });
  }

  private mapToEntity(d: any): DocumentEntity {
    return {
      id: d.id,
      documentNumber: d.documentNumber,
      fileUrl: d.fileUrl,
      studentName: d.studentName,
      studentEmail: d.studentEmail,
      parentName: d.parentName,
      joiningDate: d.joiningDate,
      templateData: d.templateData,
    };
  }
}
