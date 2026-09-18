import { DictionaryEntry } from '../common/dictionary.types';

/**
 * Keys for application system settings (app_settings table)
 */
export const AppSettingKey = {
  STRIPE_ENABLED: 'stripe_enabled',
  SUBSCRIPTIONS_ENABLED: 'subscriptions_enabled',
} as const;
export type AppSettingKey = (typeof AppSettingKey)[keyof typeof AppSettingKey];

export interface AppSettingRecord<T = any> {
  key: string;
  value: T;
  description?: string | null;
  updated_at?: string | null;
}

export const APP_SETTINGS_DICTIONARY: Record<string, DictionaryEntry> = {
  [AppSettingKey.STRIPE_ENABLED]: {
    id: 1,
    code: AppSettingKey.STRIPE_ENABLED,
    label_it: 'Pagamenti online Stripe',
    label_en: 'Stripe Online Payments',
    label_ru: 'Онлайн-оплата картой через Stripe',
    description: 'Включение/отключение приема онлайн-платежей через Stripe на странице чекаута',
  },
  [AppSettingKey.SUBSCRIPTIONS_ENABLED]: {
    id: 2,
    code: AppSettingKey.SUBSCRIPTIONS_ENABLED,
    label_it: 'Abbonamenti mensili',
    label_en: 'Monthly Subscriptions',
    label_ru: 'Функционал ежемесячных подписок',
    description: 'Включение/отключение функционала ежемесячных подписок и абонементов на курсы на странице чекаута',
  },
};
