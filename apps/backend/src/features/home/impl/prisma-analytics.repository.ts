import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AnalyticsRepository, DashboardStats } from '../domain/analytics.repository.interface';

@Injectable()
export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const activeStudents = await this.prisma.student.count({
      where: { status: 'active' },
    });

    const activeTeachers = await this.prisma.teacher.count({
      where: { status: 'active' },
    });

    const activeCourses = await this.prisma.course.count({
      where: { status: 'active' },
    });

    const upcomingLessonsCount = await this.prisma.schedule.count({
      where: { startDate: { gte: new Date() } },
    });

    // Расчет процента посещаемости
    const totalAttendances = await this.prisma.attendance.count();
    let attendanceRate = '100%';
    if (totalAttendances > 0) {
      const presentAttendances = await this.prisma.attendance.count({
        where: { status: 'present' },
      });
      const rate = (presentAttendances / totalAttendances) * 100;
      attendanceRate = `${rate.toFixed(1)}%`;
    }

    // Последняя активность из журнала логов
    const recentLogs = await this.prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    const recentActivity = recentLogs.map((log) => {
      let actionLabel = log.action;
      if (log.action === 'create') actionLabel = 'created';
      if (log.action === 'update') actionLabel = 'updated';
      if (log.action === 'delete') actionLabel = 'deleted';
      if (log.action === 'mark') actionLabel = 'marked';
      if (log.action === 'generate') actionLabel = 'generated';

      const message = `${log.operatorName} ${actionLabel} ${log.module}`;

      return {
        id: log.id,
        type: log.module,
        message,
        timestamp: log.createdAt,
      };
    });

    // Если логов в БД еще нет, возвращаем дефолтные заглушки для красоты
    if (recentActivity.length === 0) {
      recentActivity.push({
        id: 'init-1',
        type: 'system',
        message: 'System initialized successfully',
        timestamp: new Date(),
      });
    }

    return {
      activeStudents,
      activeTeachers,
      activeCourses,
      attendanceRate,
      upcomingLessonsCount,
      recentActivity,
    };
  }
}
