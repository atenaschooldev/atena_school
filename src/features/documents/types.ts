export interface DocumentRecord {
  id: string;
  studentName: string;
  studentLastName: string;
  email: string;
  telefono: string;
  dataIscrizione: string;
  genitoreName: string;
  genitoreLastName: string;
  signature?: string; // base64 string
  createdAt: string;
}
