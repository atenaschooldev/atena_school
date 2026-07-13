import { AttendanceEntity } from './attendance.entity';

export abstract class AttendanceRepository {
  abstract findBySchedule(scheduleId: string): Promise<AttendanceEntity[]>;
  abstract saveMany(
    scheduleId: string,
    records: {
      studentId: string;
      status: string;
      note?: string | null;
      date?: Date;
    }[],
    teacherId: string,
  ): Promise<AttendanceEntity[]>;
}
