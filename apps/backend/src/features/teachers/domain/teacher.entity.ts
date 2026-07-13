export class TeacherEntity {
  teacherId: string;
  subject: string | null;
  experience: string | null;
  status: string;
  hireDate: Date;
  
  // Данные учетной записи (users)
  email?: string;
  firstName?: string;
  lastName?: string;
}
