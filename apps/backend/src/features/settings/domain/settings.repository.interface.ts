export abstract class SettingsRepository {
  abstract getSettings(userId: string): Promise<{
    userId: string;
    language: string;
    theme: string;
    notificationsEnabled: boolean;
  }>;
  abstract updateSettings(
    userId: string,
    data: { language?: string; theme?: string; notificationsEnabled?: boolean },
  ): Promise<any>;
}
