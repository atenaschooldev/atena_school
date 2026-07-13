export class ScheduleEntity {
  id: string;
  courseId: string;
  teacherId: string;
  room: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  lessonType: string;
  meetingUrl: string | null;

  // Additional joined info (optional)
  courseName?: string;
  teacherName?: string;
}
