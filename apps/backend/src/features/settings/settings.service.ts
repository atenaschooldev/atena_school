import { Injectable } from '@nestjs/common';
import { SettingsRepository } from './domain/settings.repository.interface';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async getSettings(userId: string) {
    return this.settingsRepository.getSettings(userId);
  }

  async updateSettings(userId: string, settingsDto: any) {
    return this.settingsRepository.updateSettings(userId, settingsDto);
  }
}
