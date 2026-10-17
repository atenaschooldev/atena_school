/**
 * ============================================================================
 * INSTANCE MASTER CONFIGURATION (White-Label Config)
 * ============================================================================
 * Единая точка конфигурации для нового инстанса школы.
 * При развертывании проекта под новую школу достаточно настроить этот файл.
 * 
 * Что здесь настраивается:
 * 1. Идентичность школы (название, слоган, основатели, логотип)
 * 2. Адрес и геолокация (город, провинция, адрес, индекс, Google Maps)
 * 3. Контакты (телефоны, email секретариата/поддержки, часы работы)
 * 4. Юридические данные и банк (P.IVA, IBAN, банк, годовой взнос)
 * 5. Социальные сети (Instagram, Facebook, LinkedIn, TikTok, YouTube)
 * 6. Цветовая палитра (Primary, Secondary, фоны, акценты)
 * 7. Включение/выключение фичей (тест английского, аккредитации, бегущая строка)
 * 8. Аккредитации и партнеры (Cambridge, Trinity, EIPASS и др.)
 * 9. SEO & Metadata по умолчанию
 * 
 * ВАЖНО:
 * - Данные из базы данных (таблица public.school_profiles в Supabase)
 *   автоматически переопределяют значения из этого файла, если они заполнены
 *   администратором через CRM (apps/admin -> /settings/account).
 * - Для быстрой инициализации БД новой школы используйте:
 *   pnpm seed:instance (или запустите сгенерированный SQL в Supabase SQL Editor).
 * ============================================================================
 */

import { type SchoolProfile, DEFAULT_SCHOOL_PROFILE } from '@atena/api-types';

export interface BrandTheme {
  /** Основной фирменный цвет (кнопки, заголовки, акценты меню) */
  primary: string;
  /** Hover-состояние для основного цвета */
  primaryHover: string;
  /** Темный оттенок основного цвета */
  primaryDark: string;
  /** Вторичный / контрастный цвет (CTA кнопки, бейджи, важные плашки) */
  secondary: string;
  /** Hover-состояние для вторичного цвета */
  secondaryHover: string;
  /** Очень светлый оттенок вторичного цвета (фон бейджей, подсветка) */
  secondaryLight: string;
  /** Акцентный цвет фона */
  accent: string;
}

export interface AccreditationItem {
  id: string;
  name: string;
  label: string;
  href?: string;
  showInHero?: boolean;
  showInStats?: boolean;
}

export interface BrandConfig {
  /** 1. Идентичность школы */
  school: {
    name: string;
    legalName: string;
    tagline: string;
    founders: string;
    logoUrl: string;
  };

  /** 2. Геолокация и физический адрес */
  location: {
    city: string;
    province: string;
    address: string;
    cap: string;
    country: string;
    mapsUrl: string;
  };

  /** 3. Контакты и график работы */
  contacts: {
    phone: string;
    landline: string;
    whatsapp: string;
    email: string;
    secretariatEmail: string;
    supportEmail: string;
    secretariatHours: string;
  };

  /** 4. Юр. лицо, счета и взносы */
  legal: {
    vatCode: string;
    iban: string;
    bankName: string;
    accountHolder: string;
  };

  /** 5. Социальные сети школы */
  socials: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  /** 6. Цветовая палитра инстанса */
  theme: BrandTheme;

  /** 7. Переключатели фичей */
  features: {
    /** Показывать ли онлайн-тест уровня английского */
    enableEnglishTest: boolean;
    /** Показывать ли блок аккредитаций (Cambridge, Trinity, etc.) */
    enableAccreditations: boolean;
    /** Показывать ли бегущую строку со статистикой на главной */
    enableStatsBanner: boolean;
    /** Включен ли регистрационный сбор (€30) */
    registrationFeeEnabled: boolean;
    /** Размер регистрационного сбора в евро */
    registrationFeeEur: number;
    /** Текущий академический год */
    academicYear: string;
  };

  /** 8. Аккредитации и партнеры */
  accreditations: AccreditationItem[];

  /** 9. SEO & метатеги по умолчанию */
  seo: {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    locale: string;
  };

  /** Геттеры для обратной совместимости */
  defaultName: string;
  defaultTagline: string;
  defaultCity: string;
  defaultProvince: string;
}

export const brandConfig: BrandConfig = {
  // 1. Идентичность школы
  school: {
    name: 'Atena School',
    legalName: 'Atena School S.r.l.s.',
    tagline: 'civitatis ornamento',
    founders: 'ELISABETTA & MARIA, FONDATRICI',
    logoUrl: '/assets/logo.webp',
  },

  // 2. Геолокация и адрес
  location: {
    city: 'Cittanova',
    province: 'RC',
    address: 'Via Matteotti 11',
    cap: '89022',
    country: 'Italia',
    mapsUrl: 'https://maps.app.goo.gl/4Vmvrk9hxz5EC5gM7',
  },

  // 3. Контакты
  contacts: {
    phone: '+39 375 605 2362',
    landline: '0966 447052',
    whatsapp: '+39 375 605 2362',
    email: 'info@atenaschool.com',
    secretariatEmail: 'atenaschool20@gmail.com',
    supportEmail: 'supporto@atenaschool.com',
    secretariatHours: 'Martedì e Giovedì dalle ore 15:00 alle ore 18:00',
  },

  // 4. Юр. лицо и банк
  legal: {
    vatCode: 'P.IVA/C.F. 03321620803',
    iban: 'IT60X0542811101000000123456',
    bankName: 'Banca Popolare',
    accountHolder: 'Atena School S.r.l.s.',
  },

  // 5. Соцсети
  socials: {
    instagram: 'https://instagram.com/atenaschool',
    facebook: 'https://facebook.com/atenaschool',
    linkedin: 'https://linkedin.com/company/atenaschool',
    youtube: '',
    tiktok: '',
  },

  // 6. Цветовая палитра инстанса
  theme: {
    primary: '#043569',
    primaryHover: '#032852',
    primaryDark: '#00328F',
    secondary: '#F8861D',
    secondaryHover: '#e0730d',
    secondaryLight: '#fff5eb',
    accent: '#fff5eb',
  },

  // 7. Фичи
  features: {
    enableEnglishTest: true,
    enableAccreditations: true,
    enableStatsBanner: true,
    registrationFeeEnabled: true,
    registrationFeeEur: 30,
    academicYear: '2026/2027',
  },

  // 8. Аккредитации
  accreditations: [
    {
      id: 'cambridge',
      name: 'Cambridge English',
      label: 'Preparazione Esami',
      href: 'https://www.cambridgeenglish.org/',
      showInHero: true,
      showInStats: true,
    },
    {
      id: 'trinity',
      name: 'Trinity College London',
      label: 'Registered Exam Centre',
      href: 'https://www.trinitycollege.it',
      showInHero: true,
      showInStats: true,
    },
    {
      id: 'eipass',
      name: 'EIPASS',
      label: 'Centro autorizzato',
      href: 'https://it.eipass.com/',
      showInHero: true,
      showInStats: true,
    },
  ],

  // 9. SEO & Метатеги
  seo: {
    titleTemplate: '%s | Atena School',
    defaultTitle: 'Atena School — Scuola di Lingue e Formazione a Cittanova',
    defaultDescription: 'Corsi di lingua, recupero scolastico e certificazioni a Cittanova (RC). Lezioni individuali e di gruppo, online e in presenza.',
    locale: 'it_IT',
  },

  // Геттеры обратной совместимости
  get defaultName() { return this.school.name; },
  get defaultTagline() { return this.school.tagline; },
  get defaultCity() { return this.location.city; },
  get defaultProvince() { return this.location.province; },
};

/**
 * Объединяет профиль школы из БД (Supabase) с локальной конфигурацией инстанса.
 * Если БД не настроена или поле пустое — используются данные из brandConfig.
 */
export function getEffectiveSchoolProfile(profile?: Partial<SchoolProfile> | null): SchoolProfile {
  return {
    ...DEFAULT_SCHOOL_PROFILE,
    name: profile?.name || brandConfig.school.name,
    legal_name: profile?.legal_name || brandConfig.school.legalName,
    tagline: profile?.tagline || brandConfig.school.tagline,
    founders: profile?.founders || brandConfig.school.founders,
    logo_url: profile?.logo_url || brandConfig.school.logoUrl,
    address: profile?.address || brandConfig.location.address,
    city: profile?.city || brandConfig.location.city,
    cap: profile?.cap || brandConfig.location.cap,
    province: profile?.province || brandConfig.location.province,
    country: profile?.country || brandConfig.location.country,
    phone: profile?.phone || brandConfig.contacts.phone,
    landline: profile?.landline || brandConfig.contacts.landline,
    whatsapp: profile?.whatsapp || brandConfig.contacts.whatsapp,
    email: profile?.email || brandConfig.contacts.email,
    secretariat_email: profile?.secretariat_email || brandConfig.contacts.secretariatEmail,
    support_email: profile?.support_email || brandConfig.contacts.supportEmail,
    secretariat_hours: profile?.secretariat_hours || brandConfig.contacts.secretariatHours,
    vat_code: profile?.vat_code || brandConfig.legal.vatCode,
    iban: profile?.iban || brandConfig.legal.iban,
    bank_name: profile?.bank_name || brandConfig.legal.bankName,
    account_holder: profile?.account_holder || brandConfig.legal.accountHolder,
    registration_fee_enabled: profile?.registration_fee_enabled ?? brandConfig.features.registrationFeeEnabled,
    registration_fee_eur: profile?.registration_fee_eur ?? brandConfig.features.registrationFeeEur,
    academic_year: profile?.academic_year || brandConfig.features.academicYear,
    maps_url: profile?.maps_url || brandConfig.location.mapsUrl,
    socials: {
      instagram: profile?.socials?.instagram || brandConfig.socials.instagram,
      facebook: profile?.socials?.facebook || brandConfig.socials.facebook,
      linkedin: profile?.socials?.linkedin || brandConfig.socials.linkedin,
      youtube: profile?.socials?.youtube || brandConfig.socials.youtube,
      tiktok: profile?.socials?.tiktok || brandConfig.socials.tiktok,
    },
  };
}

/**
 * Генерирует SQL-запрос для инициализации / обновления таблицы school_profiles в Supabase.
 */
export function generateSchoolProfileSql(config: BrandConfig = brandConfig): string {
  const socialsJson = JSON.stringify(config.socials).replace(/'/g, "''");
  const escape = (val: string | undefined) => (val ? `'${val.replace(/'/g, "''")}'` : 'NULL');

  return `
-- Инициализация профиля школы для нового инстанса
INSERT INTO public.school_profiles (
  id,
  is_default,
  name,
  legal_name,
  tagline,
  founders,
  logo_url,
  address,
  city,
  cap,
  province,
  country,
  maps_url,
  phone,
  landline,
  whatsapp,
  email,
  secretariat_email,
  support_email,
  secretariat_hours,
  vat_code,
  iban,
  bank_name,
  account_holder,
  registration_fee_enabled,
  registration_fee_eur,
  academic_year,
  socials,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  true,
  ${escape(config.school.name)},
  ${escape(config.school.legalName)},
  ${escape(config.school.tagline)},
  ${escape(config.school.founders)},
  ${escape(config.school.logoUrl)},
  ${escape(config.location.address)},
  ${escape(config.location.city)},
  ${escape(config.location.cap)},
  ${escape(config.location.province)},
  ${escape(config.location.country)},
  ${escape(config.location.mapsUrl)},
  ${escape(config.contacts.phone)},
  ${escape(config.contacts.landline)},
  ${escape(config.contacts.whatsapp)},
  ${escape(config.contacts.email)},
  ${escape(config.contacts.secretariatEmail)},
  ${escape(config.contacts.supportEmail)},
  ${escape(config.contacts.secretariatHours)},
  ${escape(config.legal.vatCode)},
  ${escape(config.legal.iban)},
  ${escape(config.legal.bankName)},
  ${escape(config.legal.accountHolder)},
  ${config.features.registrationFeeEnabled},
  ${config.features.registrationFeeEur},
  ${escape(config.features.academicYear)},
  '${socialsJson}'::jsonb,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  legal_name = EXCLUDED.legal_name,
  tagline = EXCLUDED.tagline,
  founders = EXCLUDED.founders,
  logo_url = EXCLUDED.logo_url,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  cap = EXCLUDED.cap,
  province = EXCLUDED.province,
  country = EXCLUDED.country,
  maps_url = EXCLUDED.maps_url,
  phone = EXCLUDED.phone,
  landline = EXCLUDED.landline,
  whatsapp = EXCLUDED.whatsapp,
  email = EXCLUDED.email,
  secretariat_email = EXCLUDED.secretariat_email,
  support_email = EXCLUDED.support_email,
  secretariat_hours = EXCLUDED.secretariat_hours,
  vat_code = EXCLUDED.vat_code,
  iban = EXCLUDED.iban,
  bank_name = EXCLUDED.bank_name,
  account_holder = EXCLUDED.account_holder,
  registration_fee_enabled = EXCLUDED.registration_fee_enabled,
  registration_fee_eur = EXCLUDED.registration_fee_eur,
  academic_year = EXCLUDED.academic_year,
  socials = EXCLUDED.socials,
  updated_at = NOW();
`.trim();
}
