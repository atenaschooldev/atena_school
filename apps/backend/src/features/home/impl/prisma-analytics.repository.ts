import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AnalyticsRepository, DashboardStats } from '../domain/analytics.repository.interface';

@Injectable()
export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const activeCourses = await this.prisma.course.count({
      where: { status: 'active' },
    });

    const upcomingLessonsCount = await this.prisma.schedule.count({
      where: { startDate: { gte: new Date() } },
    });

    return {
      activeCourses,
      upcomingLessonsCount,
    };
  }
}
