export class StudentEntity {
  studentId: string;
  languageLevel: string;
  status: string;
  registrationDate: Date;
  contractId: string | null;
  
  // Присоединенные данные пользователя (из таблицы users)
  email?: string;
  firstName?: string;
  lastName?: string;
}
