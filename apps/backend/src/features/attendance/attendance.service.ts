import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './domain/attendance.repository.interface';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async getLessonAttendance(lessonId: string) {
    const list = await this.attendanceRepository.findBySchedule(lessonId);
    return list.map((a) => this.mapResponse(a));
  }

  async markAttendance(lessonId: string, records: any[], teacherId: string) {
    const recordsToSave = records.map((r) => ({
      studentId: r.student_id || r.studentId,
      status: r.status,
      note: r.comment || r.note || null,
      date: r.marked_at ? new Date(r.marked_at) : new Date(),
    }));

    const list = await this.attendanceRepository.saveMany(lessonId, recordsToSave, teacherId);
    return list.map((a) => this.mapResponse(a));
  }

  private mapResponse(a: any) {
    return {
      attendance_id: a.id,
      lesson_id: a.scheduleId,
      student_id: a.studentId,
      status: a.status,
      marked_by: a.teacherId,
      marked_at: a.date.toISOString(),
      comment: a.note,
      student_name: a.studentName,
      teacher_name: a.teacherName,
    };
  }
}
