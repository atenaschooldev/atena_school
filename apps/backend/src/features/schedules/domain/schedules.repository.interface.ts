import { ScheduleEntity } from './schedule.entity';

export abstract class SchedulesRepository {
  abstract findMany(filters?: {
    courseId?: string;
    teacherId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<ScheduleEntity[]>;
  abstract findOne(id: string): Promise<ScheduleEntity | null>;
  abstract create(data: {
    courseId: string;
    teacherId: string;
    room?: string | null;
    status?: string;
    startDate: Date;
    endDate: Date;
    lessonType?: string;
    meetingUrl?: string | null;
  }): Promise<ScheduleEntity>;
  abstract createMany(data: {
    courseId: string;
    teacherId: string;
    room?: string | null;
    status?: string;
    startDate: Date;
    endDate: Date;
    lessonType?: string;
    meetingUrl?: string | null;
  }[]): Promise<ScheduleEntity[]>;
  abstract update(id: string, data: Partial<ScheduleEntity>): Promise<ScheduleEntity>;
  abstract delete(id: string): Promise<void>;
}
