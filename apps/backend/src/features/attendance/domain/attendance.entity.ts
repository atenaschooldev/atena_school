export class AttendanceEntity {
  id: string;
  studentId: string;
  teacherId: string;
  scheduleId: string;
  status: string;
  note: string | null;
  date: Date;

  // Joined information (optional)
  studentName?: string;
  teacherName?: string;
}
