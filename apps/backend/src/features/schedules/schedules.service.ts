import { Injectable, NotFoundException } from '@nestjs/common';
import { SchedulesRepository } from './domain/schedules.repository.interface';

@Injectable()
export class SchedulesService {
  constructor(private readonly schedulesRepository: SchedulesRepository) {}

  async listSchedules() {
    const list = await this.schedulesRepository.findMany();
    return list.map((s) => this.mapResponse(s));
  }

  async createSchedule(dto: any) {
    // Вычисляем даты из DTO (если переданы start_date/end_date или конструируем)
    let startDate = new Date();
    if (dto.start_date) {
      startDate = new Date(dto.start_date);
    } else if (dto.day_of_week !== undefined && dto.start_time) {
      // Подбираем ближайший день недели с нужным временем
      const today = new Date();
      const targetDay = dto.day_of_week;
      const currentDay = today.getDay();
      let diff = targetDay - currentDay;
      if (diff < 0) diff += 7;
      startDate.setDate(today.getDate() + diff);
      const [h, m] = dto.start_time.split(':');
      startDate.setHours(Number(h), Number(m), 0, 0);
    }

    let endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // 90 минут по умолчанию
    if (dto.end_date) {
      endDate = new Date(dto.end_date);
    } else if (dto.end_time) {
      const [h, m] = dto.end_time.split(':');
      endDate = new Date(startDate);
      endDate.setHours(Number(h), Number(m), 0, 0);
    }

    const s = await this.schedulesRepository.create({
      courseId: dto.course_id || dto.courseId,
      teacherId: dto.teacher_id || dto.teacherId,
      room: dto.room || null,
      status: dto.status || 'scheduled',
      startDate,
      endDate,
      lessonType: dto.format || dto.lessonType || 'offline',
      meetingUrl: (dto.format || dto.lessonType) === 'online' ? (dto.meeting_url || 'https://meet.google.com/mock-meet') : null,
    });

    return this.mapResponse(s);
  }

  async updateSchedule(id: string, dto: any) {
    const existing = await this.schedulesRepository.findOne(id);
    if (!existing) throw new NotFoundException('Расписание не найдено');

    let startDate = existing.startDate;
    if (dto.start_date !== undefined) {
      startDate = new Date(dto.start_date);
    } else if (dto.day_of_week !== undefined && dto.start_time) {
      const today = new Date();
      const targetDay = dto.day_of_week;
      const currentDay = today.getDay();
      let diff = targetDay - currentDay;
      if (diff < 0) diff += 7;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + diff);
      const [h, m] = dto.start_time.split(':');
      startDate.setHours(Number(h), Number(m), 0, 0);
    } else if (dto.start_time) {
      const [h, m] = dto.start_time.split(':');
      startDate = new Date(existing.startDate);
      startDate.setHours(Number(h), Number(m), 0, 0);
    }

    let endDate = existing.endDate;
    if (dto.end_date !== undefined) {
      endDate = new Date(dto.end_date);
    } else if (dto.end_time) {
      const [h, m] = dto.end_time.split(':');
      endDate = new Date(startDate);
      endDate.setHours(Number(h), Number(m), 0, 0);
    }

    const s = await this.schedulesRepository.update(id, {
      courseId: dto.course_id !== undefined ? dto.course_id : dto.courseId !== undefined ? dto.courseId : existing.courseId,
      teacherId: dto.teacher_id !== undefined ? dto.teacher_id : dto.teacherId !== undefined ? dto.teacherId : existing.teacherId,
      room: dto.room !== undefined ? dto.room : existing.room,
      status: dto.status !== undefined ? dto.status : existing.status,
      startDate,
      endDate,
      lessonType: (dto.format !== undefined ? dto.format : dto.lessonType !== undefined ? dto.lessonType : existing.lessonType),
      meetingUrl: ((dto.format !== undefined ? dto.format : dto.lessonType) === 'online' 
        ? (dto.meeting_url || existing.meetingUrl || 'https://meet.google.com/mock-meet')
        : ((dto.format !== undefined ? dto.format : dto.lessonType) === 'offline' ? null : existing.meetingUrl)),
    });

    return this.mapResponse(s);
  }

  async deleteSchedule(id: string) {
    const existing = await this.schedulesRepository.findOne(id);
    if (!existing) throw new NotFoundException('Расписание не найдено');
    await this.schedulesRepository.delete(id);
    return { success: true, id };
  }

  async generateLessons(scheduleId: string, startDate: string, endDate: string) {
    const template = await this.schedulesRepository.findOne(scheduleId);
    if (!template) throw new NotFoundException('Расписание (шаблон урока) не найдено');

    const lessonsToCreate = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // День недели оригинального занятия (0-6)
    const dayOfWeek = template.startDate.getDay();
    // Длительность в миллисекундах
    const durationMs = template.endDate.getTime() - template.startDate.getTime();
    
    const current = new Date(start);
    // Выравниваем на нужный день недели
    while (current.getDay() !== dayOfWeek) {
      current.setDate(current.getDate() + 1);
    }
    
    // Устанавливаем часы и минуты из шаблона
    current.setHours(
      template.startDate.getHours(),
      template.startDate.getMinutes(),
      template.startDate.getSeconds(),
      template.startDate.getMilliseconds()
    );
    
    while (current <= end) {
      const lessonStart = new Date(current);
      const lessonEnd = new Date(current.getTime() + durationMs);
      
      lessonsToCreate.push({
        courseId: template.courseId,
        teacherId: template.teacherId,
        room: template.room,
        status: 'scheduled',
        startDate: lessonStart,
        endDate: lessonEnd,
        lessonType: template.lessonType,
        meetingUrl: template.lessonType === 'online' ? 'https://meet.google.com/mock-meet' : null,
      });
      
      // Переходим на следующую неделю
      current.setDate(current.getDate() + 7);
    }
    
    if (lessonsToCreate.length === 0) {
      return [];
    }

    const created = await this.schedulesRepository.createMany(lessonsToCreate);
    return created.map((s) => ({
      lesson_id: s.id,
      schedule_id: scheduleId,
      course_id: s.courseId,
      teacher_id: s.teacherId,
      lesson_date: s.startDate.toISOString().split('T')[0],
      start_time: s.startDate.toTimeString().split(' ')[0].substring(0, 5),
      end_time: s.endDate.toTimeString().split(' ')[0].substring(0, 5),
      format: s.lessonType,
      room: s.room,
      meeting_url: s.meetingUrl,
      status: s.status,
    }));
  }

  private mapResponse(s: any) {
    return {
      id: s.id,
      course_id: s.courseId,
      teacher_id: s.teacherId,
      day_of_week: s.startDate.getDay(),
      start_time: s.startDate.toTimeString().split(' ')[0].substring(0, 5),
      end_time: s.endDate.toTimeString().split(' ')[0].substring(0, 5),
      room: s.room,
      format: s.lessonType,
      meeting_url: s.meetingUrl,
      start_date: s.startDate.toISOString(),
      end_date: s.endDate.toISOString(),
      course_name: s.courseName,
      teacher_name: s.teacherName,
    };
  }
}
