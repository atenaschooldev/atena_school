export interface DashboardStats {
  activeCourses: number;
  upcomingLessonsCount: number;
}

export abstract class AnalyticsRepository {
  abstract getDashboardStats(): Promise<DashboardStats>;
}
