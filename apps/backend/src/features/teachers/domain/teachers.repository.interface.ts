export interface TeacherEntity {
  teacherId: string;
  fullName: string | null;
  photoUrl: string | null;
  isActive: boolean;
  status?: string | null;
  experience: string | null;
  hireDate: Date | null;
  birthDate: Date | null;
  colorValue: number | null;
  contractId: string | null;
  createdAt?: Date | null;
  updatedAt: Date | null;
  // aggregated
  lessonCount?: number;
  courseCount?: number;
}

export abstract class TeachersRepository {
  abstract findAll(): Promise<TeacherEntity[]>;
  abstract findById(id: string): Promise<TeacherEntity | null>;
  abstract create(data: { fullName: string; isActive?: boolean; status?: string; experience?: string; photoUrl?: string }): Promise<TeacherEntity>;
  abstract update(id: string, data: Partial<Pick<TeacherEntity, 'fullName' | 'isActive' | 'status' | 'experience' | 'hireDate' | 'birthDate' | 'photoUrl'>>): Promise<TeacherEntity>;
  abstract delete(id: string): Promise<void>;
}
