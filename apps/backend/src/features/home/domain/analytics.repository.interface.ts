export interface DashboardStats {
  activeStudents: number;
  activeTeachers: number;
  activeCourses: number;
  attendanceRate: string;
  upcomingLessonsCount: number;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: Date;
  }>;
}

export abstract class AnalyticsRepository {
  abstract getDashboardStats(): Promise<DashboardStats>;
}
