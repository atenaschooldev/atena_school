export class CourseEntity {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  status: string;
  teacherId: string | null;
  studentCount: number;
  description?: string | null;
  imageUrl?: string | null;
  level?: string | null;
  capacity?: number;

  teacherName?: string;
}
