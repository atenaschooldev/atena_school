export class DocumentEntity {
  id: string;
  documentNumber: string;
  fileUrl: string | null;
  studentName: string;
  studentEmail: string;
  parentName: string | null;
  joiningDate: Date;
  templateData: any;
}
