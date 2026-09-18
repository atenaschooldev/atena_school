/**
 * ============================================================================
 * ATENA SCHOOL — ACADEMIC / COURSES DOMAIN
 * ============================================================================
 * @module @atena/api-types/academic/courses
 * @description
 * Каталог учебных курсов, программ, расписаний и преподавательских ролей:
 * - CourseStatus: 1=ACTIVE (опубликован), 2=DRAFT (черновик), 3=ARCHIVED (архив)
 * - CourseScheduleType: 1=FIXED (фиксированные дни/время), 2=FLEXIBLE (по согласованию)
 * - CourseFormat: 1=GROUP (в группе), 2=INDIVIDUAL (индивидуально), 3=ONLINE, 4=CERTIFICATION
 * - CourseCategory: 1=LANGUAGES, 2=ACADEMIC (репетиторство), 3=CERTIPASS, 4=OTHER
 * - CourseTeacherRole: 1=PRIMARY (основной), 2=ASSISTANT (ассистент), 3=SUBSTITUTE (замена)
 * ============================================================================
 */

import { DictionaryEntry } from '../common/dictionary.types';

// ----------------------------------------------------------------------------
// 1. Course Publication Status
// ----------------------------------------------------------------------------

export const CourseStatus = {
  ACTIVE: 1,   // Active / Published (Attivo / Pubblicato)
  DRAFT: 2,    // Draft / Planned (Bozza / In programmazione)
  ARCHIVED: 3, // Archived / Concluded (Archiviato / Concluso)
} as const;
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

export const COURSE_STATUS_DICTIONARY: Record<CourseStatus, DictionaryEntry> = {
  [CourseStatus.ACTIVE]: {
    id: 1,
    code: 'ACTIVE',
    label_it: 'Attivo / Pubblicato',
    label_en: 'Active / Published',
    label_ru: 'Активен / Опубликован',
    description: 'Курс доступен для публичного просмотра, записи и онлайн-оплаты',
  },
  [CourseStatus.DRAFT]: {
    id: 2,
    code: 'DRAFT',
    label_it: 'Bozza / In programmazione',
    label_en: 'Draft / Planned',
    label_ru: 'Черновик / В планировании',
    description: 'Курс находится в разработке или планировании, скрыт из каталога',
  },
  [CourseStatus.ARCHIVED]: {
    id: 3,
    code: 'ARCHIVED',
    label_it: 'Archiviato / Concluso',
    label_en: 'Archived / Concluded',
    label_ru: 'В архиве / Завершен',
    description: 'Курс окончен, архивный или снят с проведения',
  },
};

// ----------------------------------------------------------------------------
// 2. Schedule Type (Fixed Days vs Flexible Timetable)
// ----------------------------------------------------------------------------

export const CourseScheduleType = {
  FIXED: 1,    // Fixed schedule with set days and times (Fisso)
  FLEXIBLE: 2, // Flexible schedule / To be agreed (Flessibile / Da concordare)
} as const;
export type CourseScheduleType = (typeof CourseScheduleType)[keyof typeof CourseScheduleType];

export const COURSE_SCHEDULE_TYPE_DICTIONARY: Record<CourseScheduleType, DictionaryEntry> = {
  [CourseScheduleType.FIXED]: {
    id: 1,
    code: 'FIXED',
    label_it: 'Orario Fisso',
    label_en: 'Fixed Schedule',
    label_ru: 'Фиксированное расписание',
    description: 'Фиксированные дни недели и время занятий (например, Пн/Ср 18:00)',
  },
  [CourseScheduleType.FLEXIBLE]: {
    id: 2,
    code: 'FLEXIBLE',
    label_it: 'Flessibile (Da concordare)',
    label_en: 'Flexible (To be agreed)',
    label_ru: 'Гибкий график (По согласованию)',
    description: 'Индивидуальный график, время уроков согласуется со студентом',
  },
};

// ----------------------------------------------------------------------------
// 3. Course Delivery Format
// ----------------------------------------------------------------------------

export const CourseFormat = {
  GROUP: 1,         // Group lessons (Di Gruppo)
  INDIVIDUAL: 2,    // Individual / private lessons (Individuale / Privato)
  ONLINE: 3,        // Online course
  CERTIFICATION: 4, // Certification / Exam prep (Certificazione)
} as const;
export type CourseFormat = (typeof CourseFormat)[keyof typeof CourseFormat];

export const COURSE_FORMAT_DICTIONARY: Record<CourseFormat, DictionaryEntry> = {
  [CourseFormat.GROUP]: {
    id: 1,
    code: 'GROUP',
    label_it: 'Di Gruppo',
    label_en: 'Group Course',
    label_ru: 'Групповой курс',
    description: 'Занятия в мини-группах от 3 до 8 человек в аудитории',
  },
  [CourseFormat.INDIVIDUAL]: {
    id: 2,
    code: 'INDIVIDUAL',
    label_it: 'Individuale / Privato',
    label_en: 'Individual / Private',
    label_ru: 'Индивидуальный',
    description: 'Персональные уроки один на один с преподавателем',
  },
  [CourseFormat.ONLINE]: {
    id: 3,
    code: 'ONLINE',
    label_it: 'Online',
    label_en: 'Online Course',
    label_ru: 'Онлайн курс',
    description: 'Дистанционное обучение через видеосвязь (Google Meet / Zoom)',
  },
  [CourseFormat.CERTIFICATION]: {
    id: 4,
    code: 'CERTIFICATION',
    label_it: 'Certificazione / Esame',
    label_en: 'Certification / Exam',
    label_ru: 'Сертификация / Экзамен',
    description: 'Подготовка к сдаче и экзаменационная сессия (Certipass, Cambridge, CELI)',
  },
};

// ----------------------------------------------------------------------------
// 4. Course Category
// ----------------------------------------------------------------------------

export const CourseCategory = {
  LANGUAGES: 1,  // Corsi di Lingua (Foreign languages)
  ACADEMIC: 2,   // Recupero Scolastico (School tutoring)
  CERTIPASS: 3,  // Certificazioni EIPASS / Certipass (IT certifications)
  OTHER: 4,      // Altro / Generale (Other directions)
} as const;
export type CourseCategory = (typeof CourseCategory)[keyof typeof CourseCategory];

export const COURSE_CATEGORY_DICTIONARY: Record<CourseCategory, DictionaryEntry> = {
  [CourseCategory.LANGUAGES]: {
    id: 1,
    code: 'LANGUAGES',
    label_it: 'Corsi di Lingua',
    label_en: 'Language Courses',
    label_ru: 'Языковые курсы',
    description: 'Английский, итальянский, немецкий, французский, испанский и др.',
  },
  [CourseCategory.ACADEMIC]: {
    id: 2,
    code: 'ACADEMIC',
    label_it: 'Recupero Scolastico',
    label_en: 'School Tutoring',
    label_ru: 'Школьное репетиторство',
    description: 'Помощь по школьным предметам, подготовка к экзаменам и аттестациям',
  },
  [CourseCategory.CERTIPASS]: {
    id: 3,
    code: 'CERTIPASS',
    label_it: 'Certificazioni EIPASS',
    label_en: 'EIPASS Certifications',
    label_ru: 'IT-сертификации EIPASS',
    description: 'Международные цифровые сертификации EIPASS / Certipass для школы и конкурсов',
  },
  [CourseCategory.OTHER]: {
    id: 4,
    code: 'OTHER',
    label_it: 'Altro / Generale',
    label_en: 'Other / General',
    label_ru: 'Общие курсы / Другое',
    description: 'Специальные и дополнительные направления обучения',
  },
};

// ----------------------------------------------------------------------------
// 5. Course Teacher Role in Curriculum
// ----------------------------------------------------------------------------

export const CourseTeacherRole = {
  PRIMARY: 1,    // Main / Lead Teacher (Docente Principale)
  ASSISTANT: 2,  // Co-teacher / Assistant (Docente di Supporto / Assistente)
  SUBSTITUTE: 3, // Substitute (Docente Sostituto)
} as const;
export type CourseTeacherRole = (typeof CourseTeacherRole)[keyof typeof CourseTeacherRole];

export const COURSE_TEACHER_ROLE_DICTIONARY: Record<CourseTeacherRole, DictionaryEntry> = {
  [CourseTeacherRole.PRIMARY]: {
    id: 1,
    code: 'PRIMARY',
    label_it: 'Docente Principale',
    label_en: 'Primary / Lead Teacher',
    label_ru: 'Основной преподаватель',
    description: 'Ведущий преподаватель курса',
  },
  [CourseTeacherRole.ASSISTANT]: {
    id: 2,
    code: 'ASSISTANT',
    label_it: 'Docente di Supporto',
    label_en: 'Assistant / Co-teacher',
    label_ru: 'Второй преподаватель / Ассистент',
    description: 'Второй преподаватель или ассистент курса',
  },
  [CourseTeacherRole.SUBSTITUTE]: {
    id: 3,
    code: 'SUBSTITUTE',
    label_it: 'Sostituto',
    label_en: 'Substitute Teacher',
    label_ru: 'Замещающий преподаватель',
    description: 'Преподаватель на замену',
  },
};

export const CourseDetailTab = {
  INFO: 1,
  INCLUDED: 2,
} as const;
export type CourseDetailTab = (typeof CourseDetailTab)[keyof typeof CourseDetailTab];

// ----------------------------------------------------------------------------
// 6. Safe Parsing Helpers
// ----------------------------------------------------------------------------

export function parseCourseTeacherRole(val: any): CourseTeacherRole {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 3) return val as CourseTeacherRole;
    return CourseTeacherRole.PRIMARY;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'primary' || s === 'lead' || s === 'principale' || s === 'main') return CourseTeacherRole.PRIMARY;
  if (s === '2' || s === 'assistant' || s === 'supporto' || s === 'co-teacher' || s === 'coteacher') return CourseTeacherRole.ASSISTANT;
  if (s === '3' || s === 'substitute' || s === 'sostituto' || s === 'replacement') return CourseTeacherRole.SUBSTITUTE;
  return CourseTeacherRole.PRIMARY;
}

export function parseCourseStatus(val: any): CourseStatus {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 3) return val as CourseStatus;
    return CourseStatus.ACTIVE;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'active' || s === 'attivo' || s === 'published') return CourseStatus.ACTIVE;
  if (s === '2' || s === 'draft' || s === 'bozza' || s === 'in-programmazione' || s === 'in_programmazione' || s === 'scheduled' || s === 'planned') return CourseStatus.DRAFT;
  if (s === '3' || s === 'archived' || s === 'archiviato' || s === 'concluded' || s === 'completed' || s === 'concluso') return CourseStatus.ARCHIVED;
  return CourseStatus.ACTIVE;
}

export function parseCourseScheduleType(val: any): CourseScheduleType {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 2) return val as CourseScheduleType;
    return CourseScheduleType.FIXED;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'fixed' || s === 'fisso') return CourseScheduleType.FIXED;
  if (s === '2' || s === 'flexible' || s === 'flessibile' || s === 'da concordare' || s === 'da_concordare') return CourseScheduleType.FLEXIBLE;
  return CourseScheduleType.FIXED;
}

export function parseCourseCategory(val: any): CourseCategory {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as CourseCategory;
    return CourseCategory.LANGUAGES;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'languages' || s === 'language' || s === 'lingua' || s === 'lingue') return CourseCategory.LANGUAGES;
  if (s === '2' || s === 'academic' || s === 'recupero' || s === 'scuola') return CourseCategory.ACADEMIC;
  if (s === '3' || s === 'certipass' || s === 'eipass' || s === 'certificazione') return CourseCategory.CERTIPASS;
  if (s === '4' || s === 'other' || s === 'general' || s === 'generale') return CourseCategory.OTHER;
  return CourseCategory.LANGUAGES;
}

export function parseCourseFormat(val: any): CourseFormat {
  if (typeof val === 'number') {
    if (val >= 1 && val <= 4) return val as CourseFormat;
    return CourseFormat.GROUP;
  }
  const s = String(val || '').toLowerCase().trim();
  if (s === '1' || s === 'group' || s === 'gruppo' || s === 'di gruppo' || s === 'di_gruppo' || s === 'in sede') return CourseFormat.GROUP;
  if (s === '2' || s === 'individual' || s === 'individuale' || s === 'private' || s === 'privato') return CourseFormat.INDIVIDUAL;
  if (s === '3' || s === 'online') return CourseFormat.ONLINE;
  if (s === '4' || s === 'certification' || s === 'certificazione' || s === 'esame' || s === 'certipass') return CourseFormat.CERTIFICATION;
  return CourseFormat.GROUP;
}

// ----------------------------------------------------------------------------
// 7. Course DTO / Item Interface
// ----------------------------------------------------------------------------

export interface CourseItem {
  id: string;
  name: string;
  title_it?: string;
  slug?: string;
  description?: string;
  description_it?: string;
  photo_url?: string;
  image_url?: string;
  price: number | string;
  status: CourseStatus | number | string;
  category?: string;
  schedule_days?: string[] | number[];
  schedule_type?: CourseScheduleType | number | string;
  course_format?: CourseFormat | number | string;
  billing_type?: any;
  subscription_price?: number | string | null;
  stripe_monthly_price_id?: string | null;
  lesson_duration_minutes?: number;
  lessons_per_week?: number | null;
  total_hours?: number | null;
  total_lessons?: number | null;
  type?: string;
  start_time?: string;
  end_time?: string;
  teacher_id?: string;
  teacher_name?: string;
  teachers?: {
    full_name: string;
  };
}
