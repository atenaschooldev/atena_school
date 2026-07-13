import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './domain/analytics.repository.interface';

@Injectable()
export class HomeService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getDashboardStats() {
    return this.analyticsRepository.getDashboardStats();
  }
}
