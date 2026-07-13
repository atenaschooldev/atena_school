export class CourseEntity {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  status: string;
  teacherId: string | null;
  studentCount: number;

  // Joined teacher info (optional)
  teacherName?: string;
}
