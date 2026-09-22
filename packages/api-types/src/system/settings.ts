/**
 * ============================================================================
 * ATENA SCHOOL — SYSTEM / APP SETTINGS DOMAIN
 * ============================================================================
 * @module @atena/api-types/system/settings
 * @description
 * Динамические настройки приложения (app_settings table, JSONB Key-Value):
 * - stripe_enabled: переключатель приема онлайн-платежей через Stripe
 * - subscriptions_enabled: переключатель помесячных абонементов/подписок
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. App Setting Key Enum & Dictionary
// ----------------------------------------------------------------------------

export const AppSettingKey = {
  STRIPE_ENABLED: 'stripe_enabled',
  SUBSCRIPTIONS_ENABLED: 'subscriptions_enabled',
  SCHOOL_PROFILE: 'school_profile',
} as const;
export type AppSettingKey = (typeof AppSettingKey)[keyof typeof AppSettingKey];

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
  [AppSettingKey.SCHOOL_PROFILE]: {
    id: 3,
    code: AppSettingKey.SCHOOL_PROFILE,
    label_it: 'Profilo della Scuola',
    label_en: 'School Profile',
    label_ru: 'Профиль школы (White-label брендинг)',
    description: 'Данные школы: название, юридическое наименование, адрес, контакты, сайт',
  },
};

// ----------------------------------------------------------------------------
// 2. School Profile Interface
// ----------------------------------------------------------------------------

export interface SchoolSocials {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface SchoolProfile {
  id?: string;
  is_default?: boolean;
  name: string;
  legal_name?: string;
  tagline?: string;
  address?: string;
  city?: string;
  cap?: string;
  province?: string;
  country?: string;
  phone?: string;
  landline?: string;
  whatsapp?: string;
  email?: string;
  secretariat_email?: string;
  support_email?: string;
  website?: string;
  site_url?: string;
  app_url?: string;
  admin_url?: string;
  vat_code?: string;
  secretariat_hours?: string;
  registration_fee_enabled?: boolean;
  registration_fee_eur?: number;
  academic_year?: string;
  iban?: string;
  bank_name?: string;
  account_holder?: string;
  logo_url?: string;
  maps_url?: string;
  founders?: string;
  socials?: SchoolSocials;
}

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  name: 'Atena School',
  legal_name: 'Atena School S.r.l.s.',
  tagline: 'civitatis ornamento',
  address: 'Via Matteotti 11',
  city: 'Cittanova',
  cap: '89022',
  province: 'RC',
  country: 'Italia',
  phone: '+39 375 605 2362',
  landline: '0966 447052',
  whatsapp: '+39 375 605 2362',
  email: 'info@atenaschool.com',
  secretariat_email: 'atenaschool20@gmail.com',
  support_email: 'supporto@atenaschool.com',
  website: 'https://atenaschool.com',
  site_url: 'https://atenaschool.com',
  app_url: 'https://app.atenaschool.com',
  admin_url: 'https://atena-school-admin.vercel.app',
  vat_code: 'P.IVA/C.F. 03321620803',
  secretariat_hours: 'Martedì e Giovedì dalle ore 15:00 alle ore 18:00',
  registration_fee_enabled: true,
  registration_fee_eur: 30,
  academic_year: '2026/2027',
  iban: 'IT60X0542811101000000123456',
  bank_name: 'Banca Popolare',
  account_holder: 'Atena School S.r.l.s.',
  logo_url: '/assets/logo.webp',
  maps_url: 'https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7',
  founders: 'ELISABETTA & MARIA, FONDATRICI',
  socials: {
    instagram: 'https://instagram.com/atenaschool',
    facebook: 'https://facebook.com/atenaschool',
    linkedin: 'https://linkedin.com/company/atenaschool',
  },
};

// ----------------------------------------------------------------------------
// 3. App Setting Record DTO Interface
// ----------------------------------------------------------------------------

export interface AppSettingRecord<T = any> {
  key: string;
  value: T;
  description?: string | null;
  updated_at?: string | null;
}
