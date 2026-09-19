/**
 * ============================================================================
 * ATENA SCHOOL — ACADEMIC / STUDENTS REGISTRY DOMAIN
 * ============================================================================
 * @module @atena/api-types/academic/students
 * @description
 * Реестр студентов и шкала уровней владения языком (CEFR):
 * - StudentStatus: 1=ACTIVE, 2=INACTIVE, 3=PAUSED, 4=GRADUATED, 5=ARCHIVED
 * - LanguageLevel: 1=A1, 2=A2, 3=B1, 4=B2, 5=C1, 6=C2
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary';

// ----------------------------------------------------------------------------
// 1. Student Enrollment Status
// ----------------------------------------------------------------------------

export const StudentStatus = {
  ACTIVE: 1,    // Active student (Attivo)
  INACTIVE: 2,  // Inactive / Awaiting payment (Inattivo / In attesa)
  PAUSED: 3,    // On hold / Academic leave (In pausa)
  GRADUATED: 4, // Graduated / Completed (Diplomato / Concluso)
  ARCHIVED: 5,  // Archived (Archiviato)
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const STUDENT_STATUS_DICTIONARY: Record<StudentStatus, DictionaryEntry> = {
  [StudentStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo',
    label_en: 'Active',
    label_ru: 'Активен',
    description: 'Студент активно проходит обучение в школе',
  },
  [StudentStatus.INACTIVE]: {
    id: 2,
    code: 'INACTIVE',
    label_it: 'Inattivo',
    label_en: 'Inactive',
    label_ru: 'Неактивен',
    description: 'Обучение не начато или приостановлено до подтверждения оплаты',
  },
  [StudentStatus.PAUSED]: {
    id: 3,
    code: 'PAUSED',
    label_it: 'In pausa',
    label_en: 'Paused',
    label_ru: 'На паузе',
    description: 'Академический отпуск или временная заморозка занятий',
  },
  [StudentStatus.GRADUATED]: {
    id: 4,
    code: 'GRADUATED',
    label_it: 'Diplomato',
    label_en: 'Graduated',
    label_ru: 'Выпускник',
    description: 'Курс успешно завершен, сертификат выдан',
  },
  [StudentStatus.ARCHIVED]: {
    id: 5,
    code: 'ARCHIVED',
    label_it: 'Archiviato',
    label_en: 'Archived',
    label_ru: 'В архиве',
    description: 'Карточка студента перенесена в архив',
  },
};

export const LanguageLevel = {
  A1: 1, // A1 — Principiante (Beginner)
  A2: 2, // A2 — Elementare (Elementary)
  B1: 3, // B1 — Intermedio (Intermediate)
  B2: 4, // B2 — Intermedio Superiore (Upper Intermediate)
  C1: 5, // C1 — Avanzato (Advanced)
  C2: 6, // C2 — Padronanza (Proficiency / Mastery)
} as const;
export type LanguageLevel = (typeof LanguageLevel)[keyof typeof LanguageLevel];

export const LANGUAGE_LEVEL_DICTIONARY: Record<LanguageLevel, DictionaryEntry> = {
  [LanguageLevel.A1]: {
    id: 1,
    code: 'A1',
    label_it: 'A1 — Principiante',
    label_en: 'A1 — Beginner',
    label_ru: 'A1 — Начальный',
    description: 'CEFR A1: Базовое понимание повседневных фраз и простых выражений',
  },
  [LanguageLevel.A2]: {
    id: 2,
    code: 'A2',
    label_it: 'A2 — Elementare',
    label_en: 'A2 — Elementary',
    label_ru: 'A2 — Элементарный',
    description: 'CEFR A2: Понимание предложений по основным сферам жизни (семья, покупки, работа)',
  },
  [LanguageLevel.B1]: {
    id: 3,
    code: 'B1',
    label_it: 'B1 — Intermedio',
    label_en: 'B1 — Intermediate',
    label_ru: 'B1 — Средний',
    description: 'CEFR B1: Понимание основных положений четкой речи, способность поддержать беседу',
  },
  [LanguageLevel.B2]: {
    id: 4,
    code: 'B2',
    label_it: 'B2 — Intermedio Superiore',
    label_en: 'B2 — Upper Intermediate',
    label_ru: 'B2 — Выше среднего',
    description: 'CEFR B2: Понимание сложных текстов, беглая и спонтанная речь с носителями',
  },
  [LanguageLevel.C1]: {
    id: 5,
    code: 'C1',
    label_it: 'C1 — Avanzato',
    label_en: 'C1 — Advanced',
    label_ru: 'C1 — Продвинутый',
    description: 'CEFR C1: Свободное выражение мыслей без затруднений в подборе слов',
  },
  [LanguageLevel.C2]: {
    id: 6,
    code: 'C2',
    label_it: 'C2 — Padronanza',
    label_en: 'C2 — Proficiency',
    label_ru: 'C2 — Профессиональный',
    description: 'CEFR C2: Свободное владение языком на уровне образованного носителя',
  },
};

export function parseStudentStatus(val: any): StudentStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 5) return val as StudentStatus;
    return StudentStatus.ACTIVE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'active' || s === 'attivo') return StudentStatus.ACTIVE;
  if (s === '2' || s === 'inactive' || s === 'inattivo' || s === 'pending' || s === 'in_attesa') return StudentStatus.INACTIVE;
  if (s === '3' || s === 'paused' || s === 'in_pausa' || s === 'in pausa') return StudentStatus.PAUSED;
  if (s === '4' || s === 'graduated' || s === 'diplomato' || s === 'concluso') return StudentStatus.GRADUATED;
  if (s === '5' || s === 'archived' || s === 'archiviato') return StudentStatus.ARCHIVED;
  return StudentStatus.ACTIVE;
}

export function parseLanguageLevel(val: any): LanguageLevel {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 6) return val as LanguageLevel;
    return LanguageLevel.A1;
  }
  const s = String(val || '').toUpperCase().trim();
  if (s === '1' || s === 'A1') return LanguageLevel.A1;
  if (s === '2' || s === 'A2') return LanguageLevel.A2;
  if (s === '3' || s === 'B1') return LanguageLevel.B1;
  if (s === '4' || s === 'B2') return LanguageLevel.B2;
  if (s === '5' || s === 'C1') return LanguageLevel.C1;
  if (s === '6' || s === 'C2') return LanguageLevel.C2;
  return LanguageLevel.A1;
}

export interface StudentRecord {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  tax_code?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  parent_id?: string | null;
  student_user_id?: string | null;
  status: StudentStatus;
  language_level: LanguageLevel;
  annual_fee_paid?: boolean | null;
  annual_fee_paid_at?: string | null;
  registration_date?: string | null;
  photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}
