export interface Teacher {
  id: string;
  teacherId: string;
  fullName: string | null;
  nome: string;
  cognome: string;
  email?: string | null;
  telefono?: string | null;
  photoUrl?: string | null;
  status: 'active' | 'inactive' | string;
  experience?: string | null;
  hireDate?: string | null;
  birthDate?: string | null;
  lessonCount?: number;
  courseCount?: number;
}

export interface UpdateTeacherFormValues {
  fullName?: string;
  status?: string;
  photoUrl?: string;
  experience?: string;
}
