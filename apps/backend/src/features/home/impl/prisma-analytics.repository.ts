import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { AnalyticsRepository, DashboardStats } from '../domain/analytics.repository.interface';
import { CourseStatus } from '@atena/api-types';

@Injectable()
export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const activeCourses = await this.prisma.course.count({
      where: { status: CourseStatus.ACTIVE },
    });

    const upcomingLessonsCount = await this.prisma.lesson.count({
      where: { startsAt: { gte: new Date() } },
    });

    return {
      activeCourses,
      upcomingLessonsCount,
    };
  }
}
