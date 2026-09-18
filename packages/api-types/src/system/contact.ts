/**
 * ============================================================================
 * ATENA SCHOOL — SYSTEM / CONTACT MESSAGES & TOPICS DOMAIN
 * ============================================================================
 * @module @atena/api-types/system/contact
 * @description
 * Входящие обращения с лендинга, темы запросов и статусы обработки лидов:
 * - ContactTopic: 1=GENERAL_INFO, 2=COURSE_ENROLLMENT, 3=CORPORATE_TRAINING, 4=CERTIFICATIONS, 5=PLACEMENT_TEST, 6=OTHER
 * - ContactMessageStatus: 1=NEW, 2=IN_PROGRESS, 3=RESOLVED, 4=ARCHIVED
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary.types';

// ----------------------------------------------------------------------------
// 1. Contact Topics Enum & Dictionary
// ----------------------------------------------------------------------------

export const ContactTopic = {
  GENERAL_INFO:       1, // General information / Informazioni generali
  COURSE_ENROLLMENT:  2, // Course enrollment / Iscrizione corso
  CORPORATE_TRAINING: 3, // Corporate training / Formazione aziendale
  CERTIFICATIONS:     4, // Exams & certifications / Esami e certificazioni
  PLACEMENT_TEST:     5, // Free placement test / Test di livello gratuito
  OTHER:              6, // Other questions / Altro
} as const;
export type ContactTopic = (typeof ContactTopic)[keyof typeof ContactTopic];

export const CONTACT_TOPIC_DICTIONARY: Record<ContactTopic, DictionaryEntry> = {
  [ContactTopic.GENERAL_INFO]: {
    id: 1,
    code: 'GENERAL_INFO',
    label_it: 'Informazioni Generali',
    label_en: 'General Information',
    label_ru: 'Общая информация о школе',
    description: 'Общий запрос: контакты, адрес, цены, расписание',
  },
  [ContactTopic.COURSE_ENROLLMENT]: {
    id: 2,
    code: 'COURSE_ENROLLMENT',
    label_it: 'Iscrizione a un Corso',
    label_en: 'Course Enrollment',
    label_ru: 'Запись на курс',
    description: 'Заявка на запись в конкретный курс школы',
  },
  [ContactTopic.CORPORATE_TRAINING]: {
    id: 3,
    code: 'CORPORATE_TRAINING',
    label_it: 'Formazione Aziendale',
    label_en: 'Corporate Training',
    label_ru: 'Корпоративное обучение',
    description: 'Языковые курсы для компаний и B2B-клиентов',
  },
  [ContactTopic.CERTIFICATIONS]: {
    id: 4,
    code: 'CERTIFICATIONS',
    label_it: 'Esami e Certificazioni',
    label_en: 'Exams & Certifications',
    label_ru: 'Экзамены и сертификации',
    description: 'Информация о подготовке к Cambridge, IELTS, EIPASS и другим экзаменам',
  },
  [ContactTopic.PLACEMENT_TEST]: {
    id: 5,
    code: 'PLACEMENT_TEST',
    label_it: 'Test di Livello Gratuito',
    label_en: 'Free Placement Test',
    label_ru: 'Бесплатный тест на определение уровня',
    description: 'Запрос на прохождение бесплатного теста для определения уровня языка',
  },
  [ContactTopic.OTHER]: {
    id: 6,
    code: 'OTHER',
    label_it: 'Altro',
    label_en: 'Other',
    label_ru: 'Другое',
    description: 'Прочие вопросы, не вошедшие в другие категории',
  },
};

// ----------------------------------------------------------------------------
// 2. Contact Message Lifecycle Status
// ----------------------------------------------------------------------------

export const ContactMessageStatus = {
  NEW: 1,         // New incoming lead / Nuovo / Новая
  IN_PROGRESS: 2, // Being processed by secretary / In corso / В обработке
  RESOLVED: 3,    // Resolved and completed / Risolto / Закрыта
  ARCHIVED: 4,    // Archived lead / Archiviato / В архиве
} as const;
export type ContactMessageStatus = (typeof ContactMessageStatus)[keyof typeof ContactMessageStatus];

export const CONTACT_MESSAGE_STATUS_DICTIONARY: Record<ContactMessageStatus, DictionaryEntry> = {
  [ContactMessageStatus.NEW]: {
    id: 1,
    code: 'NEW',
    label_it: 'Nuovo',
    label_en: 'New',
    label_ru: 'Новая',
    description: 'Новая входящая заявка, ожидающая обработки',
  },
  [ContactMessageStatus.IN_PROGRESS]: {
    id: 2,
    code: 'IN_PROGRESS',
    label_it: 'In Corso',
    label_en: 'In Progress',
    label_ru: 'В обработке',
    description: 'Заявка взята в работу сотрудником школы',
  },
  [ContactMessageStatus.RESOLVED]: {
    id: 3,
    code: 'RESOLVED',
    label_it: 'Risolto',
    label_en: 'Resolved',
    label_ru: 'Обработана / Закрыта',
    description: 'Клиент получил ответ, консультация завершена',
  },
  [ContactMessageStatus.ARCHIVED]: {
    id: 4,
    code: 'ARCHIVED',
    label_it: 'Archiviato',
    label_en: 'Archived',
    label_ru: 'В архиве',
    description: 'Заявка отправлена в архив',
  },
};

export function parseContactMessageStatus(val: any): ContactMessageStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as ContactMessageStatus;
    return ContactMessageStatus.NEW;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'new' || s === 'nuovo') return ContactMessageStatus.NEW;
  if (s === '2' || s === 'in_progress' || s === 'in corso' || s === 'processing') return ContactMessageStatus.IN_PROGRESS;
  if (s === '3' || s === 'resolved' || s === 'risolto' || s === 'closed') return ContactMessageStatus.RESOLVED;
  if (s === '4' || s === 'archived' || s === 'archiviato') return ContactMessageStatus.ARCHIVED;
  return ContactMessageStatus.NEW;
}

// ----------------------------------------------------------------------------
// 3. Contact Message Record DTO Interface
// ----------------------------------------------------------------------------

export interface ContactMessageRecord {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  interest?: string | null;
  message: string;
  status: ContactMessageStatus;
  notes?: string | null;
}
